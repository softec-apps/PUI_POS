import { Job, Queue } from 'bullmq'
import { EntityManager } from 'typeorm'
import { Logger } from '@nestjs/common'
import { JOB, QUEUE } from '@/common/constants/queue.const'
import {
  Processor,
  WorkerHost,
  OnWorkerEvent,
  InjectQueue,
} from '@nestjs/bullmq'
import { InjectEntityManager } from '@nestjs/typeorm'

import { Sale } from '@/modules/sales/domain/sale'
import { BillingService } from '@/modules/factuZen/services/factuZen.service'
import { BillingInvoiceService } from '@/modules/factuZen/services/billing.service'
import { SaleRepository } from '@/modules/sales/infrastructure/persistence/sale.repository'

@Processor(QUEUE.VOUCHER)
export class BillingWorker extends WorkerHost {
  private readonly logger = new Logger(BillingWorker.name)

  constructor(
    private readonly billingService: BillingService,
    private readonly billingInvoiceService: BillingInvoiceService,
    private readonly saleRepository: SaleRepository,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @InjectQueue(QUEUE.VOUCHER) private readonly billingQueue: Queue,
  ) {
    super()
    this.logger.log('🔧 BillingWorker inicializado')
  }

  async process(job: Job<any>): Promise<any> {
    this.logger.log(
      `⚡ Procesando job: ${job.name} (id: ${job.id}) - Data:`,
      JSON.stringify(job.data, null, 2),
    )

    try {
      switch (job.name) {
        case JOB.CREATE_VOUCHER:
          return await this.processCreateVoucher(job)

        case JOB.CREATE_COMPROBANTE:
          this.logger.log('📄 Procesando createFactura...')
          return await this.billingInvoiceService.createFactura(
            job.data.puntoEmision,
            job.data.facturaData,
          )

        case JOB.CHECK_PENDING_VOUCHERS:
          return await this.processCheckPendingVouchers(job)

        case 'reloadCredentials':
          this.logger.log('🔄 Recargando credenciales...')
          await this.billingService.reloadCredentials()
          return { status: 'reloaded' }

        case 'diagnostics':
          this.logger.log('🔍 Ejecutando diagnósticos...')
          return await this.billingService.runDiagnostics()

        default:
          this.logger.warn(`❓ Job desconocido: ${job.name}`)
          throw new Error(`Job type not supported: ${job.name}`)
      }
    } catch (error) {
      this.logger.error(`❌ Error procesando job ${job.name}:`, error.message)
      this.logger.error('📋 Stack trace:', error.stack)
      this.logger.error(
        '📋 Job data completa:',
        JSON.stringify(job.data, null, 2),
      )
      throw error
    }
  }

  /**
   * ✅ VERIFICAR SI UNA SALE YA ESTÁ COMPLETADA
   */
  private isSaleCompleted(sale: Sale): boolean {
    if (!sale) return false

    const completedStates = ['AUTHORIZED', 'AUTORIZADO']
    const currentState = sale.estado_sri?.toUpperCase()?.trim() || ''
    const hasValidState = completedStates.includes(currentState)

    const claveAcceso = sale.clave_acceso?.trim()
    const hasAccessKey = Boolean(claveAcceso && claveAcceso.length > 0)

    return hasValidState && hasAccessKey
  }

  /**
   * ✅ ELIMINAR JOB DE MONITOREO ESPECÍFICO
   */
  private async removeMonitoringJob(saleId: string): Promise<void> {
    try {
      const jobId = `check-voucher-${saleId}`
      this.logger.log(`🗑️ Eliminando job de monitoreo: ${jobId}`)

      let jobRemoved = false

      // 1. Intentar eliminar job repetible
      try {
        const repeatableJobs = await this.billingQueue.getRepeatableJobs()
        const targetJob = repeatableJobs.find((job) => job.id === jobId)

        if (targetJob) {
          await this.billingQueue.removeRepeatableByKey(targetJob.key)
          this.logger.log(`✅ Job repetible ${jobId} eliminado exitosamente`)
          jobRemoved = true
        } else {
          this.logger.warn(`⚠️ No se encontró job repetible ${jobId}`)
        }
      } catch (repeatError) {
        if (repeatError.message.includes('locked by another worker')) {
          this.logger.warn(
            `⚠️ Job ${jobId} está siendo procesado por otro worker, se eliminará automáticamente`,
          )
          // Marcar una flag en Redis para que el próximo job se auto-elimine
          await this.markJobForRemoval(saleId)
          jobRemoved = true
        } else {
          this.logger.error(
            `❌ Error eliminando job repetible ${jobId}:`,
            repeatError.message,
          )
        }
      }

      // 2. Eliminar jobs activos/pendientes/delayed
      try {
        const [activeJobs, waitingJobs, delayedJobs] = await Promise.all([
          this.billingQueue.getActive(),
          this.billingQueue.getWaiting(),
          this.billingQueue.getDelayed(),
        ])

        const allJobs = [...activeJobs, ...waitingJobs, ...delayedJobs]

        for (const job of allJobs) {
          if (
            job.data?.saleId === saleId &&
            job.name === JOB.CHECK_PENDING_VOUCHERS
          ) {
            try {
              await job.remove()
              this.logger.log(`✅ Eliminado job ${job.id} para sale ${saleId}`)
              jobRemoved = true
            } catch (removeError) {
              if (!removeError.message.includes('locked')) {
                this.logger.error(
                  `❌ Error eliminando job ${job.id}:`,
                  removeError.message,
                )
              }
            }
          }
        }
      } catch (error) {
        this.logger.error(
          `❌ Error obteniendo jobs activos/pendientes:`,
          error.message,
        )
      }

      if (jobRemoved) {
        this.logger.log(
          `✅ Job de monitoreo para sale ${saleId} procesado para eliminación`,
        )
      } else {
        this.logger.warn(
          `⚠️ No se pudo eliminar completamente el job para sale ${saleId}`,
        )
      }
    } catch (error) {
      this.logger.error(
        `❌ Error general eliminando job de monitoreo para sale ${saleId}:`,
        error.message,
      )
      // No fallar el proceso principal por esto
    }
  }

  /**
   * ✅ MARCAR JOB PARA ELIMINACIÓN AUTOMÁTICA
   */
  private async markJobForRemoval(saleId: string): Promise<void> {
    try {
      this.logger.log(
        `🏷️ Marcando sale ${saleId} para auto-eliminación en próxima ejecución`,
      )
    } catch (error) {
      this.logger.error(
        `❌ Error marcando job para eliminación:`,
        error.message,
      )
    }
  }

  /**
   * ✅ VERIFICAR SI EL JOB DEBE AUTO-ELIMINARSE
   */
  private async shouldAutoRemove(saleId: string): Promise<boolean> {
    // En una implementación real, verificarías una flag en Redis
    // Por ahora, siempre verificamos si la sale está completada
    try {
      const sale = await this.saleRepository.findById(saleId)
      return sale ? this.isSaleCompleted(sale) : true // Si no existe, también eliminar
    } catch (error) {
      this.logger.error(`❌ Error verificando auto-eliminación:`, error.message)
      return false
    }
  }

  private async processCheckPendingVouchers(job: Job<any>): Promise<any> {
    this.logger.log('🔍 Verificando comprobantes pendientes...')

    try {
      const { saleId } = job.data

      if (!saleId) {
        this.logger.warn('⚠️ Job sin saleId específico')
        return { success: false, message: 'saleId requerido' }
      }

      // ✅ VERIFICAR SI EL MONITOREO DEBE TERMINAR
      const finishCheck = await this.shouldFinishMonitoring(saleId)

      if (finishCheck.shouldFinish) {
        this.logger.log(
          `🎯 Finalizando monitoreo para sale ${saleId}: ${finishCheck.reason}`,
        )

        const removalResult = await this.safelyRemoveMonitoringJob(saleId)

        return {
          success: true,
          monitoringFinished: true,
          reason: finishCheck.reason,
          removalResult,
          sale: finishCheck.sale,
        }
      }

      // ✅ SI NO DEBE TERMINAR, CONTINUAR CON LA VERIFICACIÓN NORMAL
      const sale = await this.saleRepository.findById(saleId)

      if (!sale) {
        this.logger.warn(`⚠️ Sale ${saleId} no encontrada`)
        await this.safelyRemoveMonitoringJob(saleId)
        return {
          success: true,
          message: 'Sale no encontrada, monitoreo finalizado',
        }
      }

      this.logger.log(
        `🔍 Verificando sale ${saleId} - Estado actual: ${sale.estado_sri}`,
      )

      if (!sale.comprobante_id) {
        this.logger.warn(`⚠️ Sale ${saleId} sin comprobante_id`)
        return { success: false, message: 'Sin comprobante_id' }
      }

      // ✅ CONSULTAR ESTADO EN LA API
      const estadoResponse =
        await this.billingInvoiceService.getComprobanteEstadoById(
          sale.comprobante_id,
        )

      if (estadoResponse?.success && estadoResponse.data) {
        const comprobanteData = estadoResponse.data

        // ✅ EXTRAER CLAVE DE ACCESO DEL RESPONSE
        const claveAccesoFromAPI = comprobanteData.clave_acceso

        // ✅ CREAR ANÁLISIS DE ACTUALIZACIÓN INCLUYENDO CLAVE DE ACCESO
        const updateAnalysis = this.needsUpdateWithClaveAcceso(
          sale,
          comprobanteData,
        )

        if (updateAnalysis.needsUpdate) {
          // ✅ ACTUALIZAR LA SALE
          const updatePayload: Partial<Sale> = {}

          if (updateAnalysis.newState) {
            updatePayload.estado_sri = updateAnalysis.newState
          }

          if (updateAnalysis.newClaveAcceso) {
            updatePayload.clave_acceso = updateAnalysis.newClaveAcceso
            this.logger.log(
              `🔑 Actualizando clave de acceso: ${updateAnalysis.newClaveAcceso}`,
            )
          }

          const updatedSale = await this.saleRepository.update(
            sale.id,
            updatePayload,
            this.entityManager,
          )

          this.logger.log(`✅ Sale ${saleId} actualizada con nueva información`)

          // ✅ VERIFICAR SI AHORA ESTÁ COMPLETADA
          if (this.isSaleCompleted(updatedSale)) {
            this.logger.log(
              `🎉 Sale ${saleId} completada después de actualización`,
            )
            const removalResult = await this.safelyRemoveMonitoringJob(saleId)

            return {
              success: true,
              completed: true,
              removalResult,
              sale: updatedSale,
              claveAcceso: updatedSale.clave_acceso, // ✅ INCLUIR CLAVE EN RESPONSE
            }
          }

          return {
            success: true,
            updated: true,
            sale: updatedSale,
            changes: updateAnalysis.reasons,
            claveAcceso: updatedSale.clave_acceso, // ✅ INCLUIR CLAVE EN RESPONSE
          }
        }

        return {
          success: true,
          updated: false,
          message: 'Sin cambios necesarios',
          sale,
          claveAcceso: sale.clave_acceso || claveAccesoFromAPI, // ✅ INCLUIR CLAVE ACTUAL
        }
      }

      return {
        success: false,
        message: 'Error consultando API',
        sale,
      }
    } catch (error) {
      this.logger.error(
        '❌ Error en processCheckPendingVouchers:',
        error.message,
      )

      return {
        success: false,
        error: error.message,
        retry: true,
      }
    }
  }

  // ✅ NUEVA FUNCIÓN PARA VERIFICAR ACTUALIZACIONES INCLUYENDO CLAVE DE ACCESO
  private needsUpdateWithClaveAcceso(
    sale: Sale,
    apiData: any,
  ): {
    needsUpdate: boolean
    newState?: string
    newClaveAcceso?: string
    reasons: string[]
  } {
    const reasons: string[] = []
    let needsUpdate = false
    let newState: string | undefined
    let newClaveAcceso: string | undefined

    // 1. Verificar cambio de estado
    const currentState = (sale.estado_sri || 'PENDING')
      .toString()
      .toUpperCase()
      .trim()
    const apiState = this.mapApiStateToInternalState(apiData.estado)

    if (apiState !== currentState) {
      needsUpdate = true
      newState = apiState
      reasons.push(`Estado cambió: ${currentState} → ${apiState}`)
    }

    // 2. Verificar clave de acceso (MEJORADO)
    const currentClave = sale.clave_acceso?.trim()
    const apiClave = apiData.clave_acceso?.trim()

    // ✅ SIEMPRE ACTUALIZAR LA CLAVE SI VIENE DEL API Y ES DIFERENTE
    if (apiClave && apiClave !== currentClave) {
      needsUpdate = true
      newClaveAcceso = apiClave
      reasons.push(
        `Clave de acceso actualizada: ${currentClave || 'sin clave'} → ${apiClave}`,
      )
    }

    // 3. Si no tenemos clave pero el comprobante existe, tomarla del API
    if (apiClave && (!currentClave || currentClave.length === 0)) {
      needsUpdate = true
      newClaveAcceso = apiClave
      reasons.push(`Nueva clave de acceso obtenida del API`)
    }

    return {
      needsUpdate,
      newState,
      newClaveAcceso,
      reasons,
    }
  }

  /**
   * ✅ NORMALIZAR ESTADOS DEL API
   */
  private normalizeEstado(estado: string): string {
    if (!estado) return 'PENDING'

    const estadoLower = estado.toLowerCase().trim()

    // ✅ Mapear diferentes posibles valores del API
    switch (estadoLower) {
      case 'autorizado':
      case 'authorized':
      case 'approved':
        return 'AUTHORIZED'
      case 'rechazado':
      case 'rejected':
      case 'denied':
        return 'REJECTED'
      case 'pendiente':
      case 'pending':
      case 'processing':
      case 'en_proceso':
        return 'PENDING'
      case 'error':
      case 'failed':
        return 'ERROR'
      default:
        this.logger.warn(`⚠️ Estado desconocido: '${estado}', usando PENDING`)
        return 'PENDING'
    }
  }

  private async processCreateVoucher(job: Job<any>): Promise<any> {
    const { puntoEmision, clienteData, productos, formaPago, saleId } = job.data

    this.logger.log('📄 Procesando CREATE_VOUCHER...')
    this.logger.log(`🔍 Sale ID: ${saleId}`)

    // ✅ VALIDAR DATOS
    if (!saleId) throw new Error('saleId es requerido')
    if (!puntoEmision) throw new Error('puntoEmision es requerido')
    if (!clienteData) throw new Error('clienteData es requerido')
    if (!productos?.length)
      throw new Error('productos debe ser un array no vacío')
    if (!formaPago) throw new Error('formaPago es requerido')

    try {
      // ✅ 1. ACTUALIZAR ESTADO A "PROCESSING"
      await this.saleRepository.update(
        saleId,
        { estado_sri: 'PROCESSING' },
        this.entityManager,
      )
      this.logger.log('✅ Estado actualizado a PROCESSING')

      // ✅ 2. CREAR FACTURA EN FACTUZEN
      const facturaResult = await this.billingInvoiceService.createFacturaSRI(
        puntoEmision,
        clienteData,
        productos,
        formaPago,
      )

      this.logger.log(
        '✅ Factura creada exitosamente:',
        JSON.stringify(facturaResult, null, 2),
      )

      // ✅ 3. EXTRAER DATOS DEL RESULTADO
      let comprobanteId = null
      let estadoSRI = 'PENDING'
      let claveAcceso = null

      if (facturaResult?.success && facturaResult.data?.comprobante_id) {
        comprobanteId = facturaResult.data.comprobante_id
        estadoSRI = this.normalizeEstado(facturaResult.data.estado || 'PENDING')

        this.logger.log(
          `🔍 Comprobante creado: ${comprobanteId}, Estado inicial: ${estadoSRI}`,
        )

        // ✅ 4. VERIFICAR ESTADO INMEDIATAMENTE SI ES NECESARIO
        if (estadoSRI === 'PENDING') {
          try {
            this.logger.log(
              `🔍 Verificando estado inmediato del comprobante ${comprobanteId}`,
            )

            const estadoFactura =
              await this.billingInvoiceService.getComprobanteEstadoById(
                comprobanteId,
              )

            if (estadoFactura?.success && estadoFactura.data) {
              const nuevoEstado = this.normalizeEstado(
                estadoFactura.data.estado,
              )
              const nuevaClaveAcceso = estadoFactura.data.clave_acceso

              this.logger.log(
                `🔍 Estado verificado: ${nuevoEstado}, Clave: ${nuevaClaveAcceso || 'sin clave'}`,
              )

              estadoSRI = nuevoEstado
              if (nuevaClaveAcceso) {
                claveAcceso = nuevaClaveAcceso
              }
            }
          } catch (error) {
            this.logger.warn(
              '⚠️ Error consultando estado inmediato:',
              error.message,
            )
            // No fallar el proceso por esto
          }
        }
      } else {
        this.logger.error(
          '❌ No se pudo obtener comprobante_id del resultado:',
          facturaResult,
        )
        throw new Error('No se pudo crear el comprobante correctamente')
      }

      // ✅ 5. ACTUALIZAR SALE CON TODA LA INFORMACIÓN
      const updateData: any = {
        estado_sri: estadoSRI,
        comprobante_id: comprobanteId,
      }

      if (claveAcceso) {
        updateData.clave_acceso = claveAcceso
      }

      const updatedSale = await this.saleRepository.update(
        saleId,
        updateData,
        this.entityManager,
      )

      this.logger.log(
        `✅ Sale actualizada - Estado: ${estadoSRI}, Comprobante: ${comprobanteId}, Clave: ${claveAcceso || 'sin clave'}`,
      )

      // ✅ 6. SI YA ESTÁ COMPLETADA, PROGRAMAR ELIMINACIÓN DEL JOB DE MONITOREO
      if (this.isSaleCompleted(updatedSale)) {
        this.logger.log(
          `🎉 Sale ${saleId} completada inmediatamente - programando eliminación de job de monitoreo`,
        )
        // Programar eliminación para evitar locks
        setTimeout(async () => {
          await this.removeMonitoringJob(saleId.toString())
        }, 2000) // Esperar 2 segundos
      }

      return {
        success: true,
        saleId,
        comprobanteId,
        estadoSRI,
        claveAcceso,
        completed: this.isSaleCompleted(updatedSale),
      }
    } catch (error) {
      this.logger.error(`❌ Error en processCreateVoucher:`, error.message)
      this.logger.error(`❌ Stack trace:`, error.stack)

      // ✅ 7. ACTUALIZAR ESTADO A ERROR
      try {
        await this.saleRepository.update(
          saleId,
          { estado_sri: 'ERROR' },
          this.entityManager,
        )
        this.logger.log('✅ Estado actualizado a ERROR')

        // ✅ ELIMINAR JOB DE MONITOREO SI HAY ERROR (programado)
        setTimeout(async () => {
          await this.removeMonitoringJob(saleId.toString())
          this.logger.log('✅ Job de monitoreo eliminado por error')
        }, 1000) // Esperar 1 segundo
      } catch (updateError) {
        this.logger.error(
          '❌ Error actualizando estado a ERROR:',
          updateError.message,
        )
      }

      throw error
    }
  }

  /**
   * ✅ UTILIDADES PARA MAPEO DE ESTADOS
   */

  /**
   * Mapea el estado de la API de facturación a nuestro formato interno
   */
  private mapApiStateToInternalState(apiState: string): string {
    if (!apiState) return 'PENDING'

    const normalizedState = apiState.toString().toLowerCase().trim()

    const stateMap: Record<string, string> = {
      pendiente: 'PENDING',
      pending: 'PENDING',
      procesando: 'PROCESSING',
      processing: 'PROCESSING',
      autorizado: 'AUTHORIZED',
      authorized: 'AUTHORIZED',
      aprobado: 'AUTHORIZED',
      approved: 'AUTHORIZED',
      error: 'ERROR',
      failed: 'ERROR',
      fallido: 'ERROR',
      rechazado: 'REJECTED',
      rejected: 'REJECTED',
    }

    return stateMap[normalizedState] || 'PENDING'
  }

  /**
   * Verifica si un estado representa un comprobante completado/autorizado
   */
  private isAuthorizedState(state: string): boolean {
    if (!state) return false

    const normalizedState = state.toString().toLowerCase().trim()
    const authorizedStates = [
      'autorizado',
      'authorized',
      'aprobado',
      'approved',
    ]

    return authorizedStates.includes(normalizedState)
  }

  // Reemplaza el método needsUpdate en el BillingWorker por este:
  private needsUpdate(
    sale: Sale,
    apiData: any,
  ): {
    needsUpdate: boolean
    newState?: string
    newClaveAcceso?: string
    reasons: string[]
  } {
    const reasons: string[] = []
    let needsUpdate = false
    let newState: string | undefined
    let newClaveAcceso: string | undefined

    // 1. Verificar cambio de estado
    const currentState = (sale.estado_sri || 'PENDING')
      .toString()
      .toUpperCase()
      .trim()
    const apiState = this.mapApiStateToInternalState(apiData.estado)

    if (apiState !== currentState) {
      needsUpdate = true
      newState = apiState
      reasons.push(`Estado cambió: ${currentState} → ${apiState}`)
    }

    // 2. ✅ MEJORAR LÓGICA DE CLAVE DE ACCESO
    const currentClave = sale.clave_acceso?.trim()
    const apiClave = apiData.clave_acceso?.trim()

    // Siempre actualizar la clave si existe en el API y es diferente
    if (apiClave) {
      if (!currentClave || currentClave !== apiClave) {
        needsUpdate = true
        newClaveAcceso = apiClave
        reasons.push(
          currentClave
            ? `Clave de acceso actualizada: ${currentClave.substring(0, 10)}... → ${apiClave.substring(0, 10)}...`
            : `Nueva clave de acceso obtenida: ${apiClave.substring(0, 10)}...`,
        )
      }
    }

    return {
      needsUpdate,
      newState,
      newClaveAcceso,
      reasons,
    }
  }

  /**
   * ✅ VERIFICAR SI EL JOB DE MONITOREO DEBE TERMINAR
   */
  private async shouldFinishMonitoring(saleId: string): Promise<{
    shouldFinish: boolean
    reason?: string
    sale?: Sale
  }> {
    try {
      const sale = await this.saleRepository.findById(saleId)

      if (!sale) {
        return {
          shouldFinish: true,
          reason: 'Sale no encontrada',
        }
      }

      // Verificar si la sale está completada
      if (this.isSaleCompleted(sale)) {
        return {
          shouldFinish: true,
          reason: 'Sale completada',
          sale,
        }
      }

      // Verificar si ha pasado mucho tiempo (ej: 24 horas)
      const createdAt = sale.createdAt
      const hoursDiff =
        (new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60)

      if (hoursDiff > 24) {
        return {
          shouldFinish: true,
          reason: 'Tiempo máximo excedido (24h)',
          sale,
        }
      }

      return { shouldFinish: false, sale }
    } catch (error) {
      this.logger.error(`❌ Error verificando finalización:`, error.message)
      return { shouldFinish: false }
    }
  }

  /**
   * ✅ ELIMINAR JOB DE MONITOREO DE FORMA SEGURA (SOLO PARA REPETIBLES)
   */
  private async safelyRemoveMonitoringJob(saleId: string): Promise<{
    success: boolean
    message: string
    jobsRemoved: number
  }> {
    const jobId = `check-voucher-${saleId}`
    let jobsRemoved = 0

    try {
      // 1. SOLO ELIMINAR EL JOB REPETIBLE - NO TOCAR JOBS INDIVIDUALES
      const repeatableJobs = await this.billingQueue.getRepeatableJobs()
      const targetRepeatableJob = repeatableJobs.find(
        (job) => job.id === jobId || job.name === JOB.CHECK_PENDING_VOUCHERS,
      )

      if (targetRepeatableJob) {
        await this.billingQueue.removeRepeatableByKey(targetRepeatableJob.key)
        jobsRemoved++
        this.logger.log(`✅ Job repetible ${targetRepeatableJob.id} eliminado`)
      } else {
        this.logger.warn(`⚠️ No se encontró job repetible con ID: ${jobId}`)

        // Buscar por patrón si no encuentra por ID exacto
        const matchingJobs = repeatableJobs.filter(
          (job) =>
            job.name === JOB.CHECK_PENDING_VOUCHERS &&
            job?.id?.includes(saleId),
        )

        for (const job of matchingJobs) {
          await this.billingQueue.removeRepeatableByKey(job.key)
          jobsRemoved++
          this.logger.log(`✅ Job repetible ${job.id} eliminado por patrón`)
        }
      }

      return {
        success: true,
        message: `Eliminados ${jobsRemoved} jobs repetibles para sale ${saleId}`,
        jobsRemoved,
      }
    } catch (error) {
      this.logger.error(
        `❌ Error eliminando job repetible ${jobId}:`,
        error.message,
      )
      return {
        success: false,
        message: error.message,
        jobsRemoved,
      }
    }
  }

  // ✅ EVENTOS DEL WORKER
  @OnWorkerEvent('active')
  async onActive(job: Job) {
    this.logger.log(`🔄 Job activo: ${job.name} (id: ${job.id})`)
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job, result: any) {
    this.logger.log(`✅ Job completado: ${job.name} (id: ${job.id})`)
    this.logger.log('📋 Resultado:', JSON.stringify(result, null, 2))
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job, err: Error) {
    this.logger.error(`❌ Job falló: ${job.name} (id: ${job.id})`)
    this.logger.error('📋 Error:', err.message)
    this.logger.error('📋 Stack:', err.stack)
  }

  @OnWorkerEvent('progress')
  async onProgress(job: Job, progress: any) {
    this.logger.log(`📊 Progreso job ${job.name}: ${progress}%`)
  }
}
