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
import { BillingService } from '@/modules/factuZen/services/factuZen.service'
import { BillingInvoiceService } from '@/modules/factuZen/services/billing.service'
import { SaleRepository } from '@/modules/sales/infrastructure/persistence/sale.repository'
import { InjectEntityManager } from '@nestjs/typeorm'
import { Sale } from '../sales/domain/sale'

@Processor(QUEUE.VOUCHER)
export class BillingWorker extends WorkerHost {
  private readonly logger = new Logger(BillingWorker.name)

  constructor(
    private readonly billingService: BillingService,
    private readonly billingInvoiceService: BillingInvoiceService,
    private readonly saleRepository: SaleRepository,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @InjectQueue(QUEUE.VOUCHER) private readonly billingQueue: Queue, // ✅ INYECTAR LA COLA
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
      // En una implementación real, podrías usar Redis para esto
      // Por ahora, solo loggeamos que debe auto-eliminarse
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

  /**
   * ✅ PROCESAR VERIFICACIÓN DE COMPROBANTES PENDIENTES
   */
  private async processCheckPendingVouchers(job: Job<any>): Promise<any> {
    this.logger.log('🔍 Verificando comprobantes pendientes...')

    try {
      // ✅ Si viene saleId específico en el job, solo procesar esa venta
      let pendingSales

      if (job.data?.saleId) {
        this.logger.log(`🎯 Procesando Sale específica: ${job.data.saleId}`)

        // ✅ VERIFICAR SI DEBE AUTO-ELIMINARSE
        if (await this.shouldAutoRemove(job.data.saleId)) {
          this.logger.log(`🔄 Sale ${job.data.saleId} debe auto-eliminarse`)
          await this.removeMonitoringJob(job.data.saleId)
          return {
            success: true,
            message:
              'Sale completada, job de monitoreo eliminado automáticamente',
            saleId: job.data.saleId,
            autoRemoved: true,
          }
        }

        const specificSale = await this.saleRepository.findById(job.data.saleId)

        if (!specificSale) {
          this.logger.warn(
            `⚠️ Sale ${job.data.saleId} no encontrada - eliminando job de monitoreo`,
          )
          await this.removeMonitoringJob(job.data.saleId)
          return { success: true, message: 'Sale no encontrada, job eliminado' }
        }

        // ✅ VERIFICAR SI LA SALE YA ESTÁ COMPLETADA
        if (this.isSaleCompleted(specificSale)) {
          this.logger.log(
            `✅ Sale ${specificSale.id} ya está completada - eliminando job de monitoreo`,
          )
          await this.removeMonitoringJob(specificSale.id.toString())
          return {
            success: true,
            message: 'Sale ya completada, job de monitoreo eliminado',
            saleId: specificSale.id,
            estado: specificSale.estado_sri,
            claveAcceso: specificSale.clave_acceso,
          }
        }

        pendingSales = {
          data: [specificSale],
          totalCount: 1,
          totalRecords: 1,
        }
      } else {
        // Buscar todas las ventas pendientes
        pendingSales = await this.saleRepository.findManyWithPagination({
          filterOptions: { estado_sri: 'PENDING' },
          paginationOptions: { page: 1, limit: 1000 },
        })
      }

      this.logger.log(
        `📋 Encontradas ${pendingSales.data.length} ventas pendientes para verificar`,
      )

      let updatedCount = 0
      let errorCount = 0
      let skippedCount = 0
      let completedCount = 0

      for (const sale of pendingSales.data) {
        this.logger.log(`\n🔍 ====== PROCESANDO SALE ${sale.id} ======`)
        this.logger.log(`📋 Estado actual: ${sale.estado_sri}`)
        this.logger.log(
          `📋 Comprobante ID: ${sale.comprobante_id || 'NO ASIGNADO'}`,
        )
        this.logger.log(
          `📋 Clave acceso actual: ${sale.clave_acceso || 'NO ASIGNADA'}`,
        )

        if (!sale.comprobante_id) {
          this.logger.warn(`⚠️ Sale ${sale.id} sin comprobante_id, omitiendo`)
          skippedCount++
          continue
        }

        try {
          this.logger.log(
            `🔍 Consultando estado del comprobante ${sale.comprobante_id} en la API...`,
          )

          const estadoResponse =
            await this.billingInvoiceService.getComprobanteEstadoById(
              sale.comprobante_id,
            )

          this.logger.log(
            '📋 Respuesta completa de la API:',
            JSON.stringify(estadoResponse, null, 2),
          )

          if (estadoResponse && estadoResponse.success && estadoResponse.data) {
            const comprobanteData = estadoResponse.data
            const estadoAPI = comprobanteData.estado || 'pendiente'
            const claveAccesoAPI = comprobanteData.clave_acceso || null

            this.logger.log(`🎯 ====== ANÁLISIS DE DATOS ======`)
            this.logger.log(`📊 Estado en API: '${estadoAPI}'`)
            this.logger.log(`📊 Estado en DB:  '${sale.estado_sri}'`)
            this.logger.log(`🔑 Clave en API:  '${claveAccesoAPI || 'NULL'}'`)
            this.logger.log(
              `🔑 Clave en DB:   '${sale.clave_acceso || 'NULL'}'`,
            )

            // ✅ USAR LAS UTILIDADES DE MAPEO
            const updateAnalysis = this.needsUpdate(sale, comprobanteData)

            this.logger.log(`🎯 ====== DECISIÓN DE ACTUALIZACIÓN ======`)
            this.logger.log(
              `   - 🚨 DEBE ACTUALIZAR: ${updateAnalysis.needsUpdate}`,
            )
            updateAnalysis.reasons.forEach((reason) => {
              this.logger.log(`   - 📋 Razón: ${reason}`)
            })

            if (updateAnalysis.needsUpdate) {
              // ✅ PREPARAR PAYLOAD DE ACTUALIZACIÓN
              const updatePayload: Partial<Sale> = {}

              if (updateAnalysis.newState) {
                updatePayload.estado_sri = updateAnalysis.newState
              }

              if (updateAnalysis.newClaveAcceso) {
                updatePayload.clave_acceso = updateAnalysis.newClaveAcceso
              }

              this.logger.log(`🔄 ====== EJECUTANDO ACTUALIZACIÓN ======`)
              this.logger.log(
                `📋 Payload final:`,
                JSON.stringify(updatePayload, null, 2),
              )

              // ✅ EJECUTAR LA ACTUALIZACIÓN
              const updatedSale = await this.saleRepository.update(
                sale.id,
                updatePayload,
                this.entityManager,
              )

              this.logger.log(`✅ ====== ACTUALIZACIÓN EXITOSA ======`)
              this.logger.log(`📋 Sale ${sale.id} actualizada correctamente`)
              this.logger.log(
                `📋 Estado: ${sale.estado_sri} → ${updatedSale.estado_sri}`,
              )
              this.logger.log(
                `🔑 Clave: ${sale.clave_acceso || 'NULL'} → ${updatedSale.clave_acceso || 'NULL'}`,
              )

              updatedCount++

              // ✅ VERIFICAR SI LA SALE AHORA ESTÁ COMPLETADA Y ELIMINAR JOB
              if (this.isSaleCompleted(updatedSale)) {
                this.logger.log(
                  `🎉 Sale ${sale.id} ahora está COMPLETADA - programando eliminación de job`,
                )
                // Solo programar la eliminación, no hacerla inmediatamente para evitar locks
                setTimeout(async () => {
                  await this.removeMonitoringJob(sale.id.toString())
                }, 1000) // Esperar 1 segundo
                completedCount++
              }
            } else {
              this.logger.log(`📋 ====== SIN CAMBIOS NECESARIOS ======`)
              this.logger.log(`📋 Sale ${sale.id} ya está actualizada`)

              // ✅ VERIFICAR SI YA ESTABA COMPLETADA (por si acaso)
              if (this.isSaleCompleted(sale)) {
                this.logger.log(
                  `🎉 Sale ${sale.id} ya estaba COMPLETADA - programando eliminación de job`,
                )
                setTimeout(async () => {
                  await this.removeMonitoringJob(sale.id.toString())
                }, 1000) // Esperar 1 segundo
                completedCount++
              }
            }
          } else {
            this.logger.warn(
              `⚠️ Respuesta inválida de la API para comprobante ${sale.comprobante_id}`,
            )
            this.logger.warn(
              `📋 Respuesta recibida:`,
              JSON.stringify(estadoResponse, null, 2),
            )
          }
        } catch (error) {
          this.logger.error(
            `❌ Error verificando sale ${sale.id}:`,
            error.message,
          )
          this.logger.error(`📋 Stack trace:`, error.stack)
          errorCount++
        }

        // ✅ Pequeña pausa para no saturar la API
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      const result = {
        success: true,
        message: `Verificación completada - ${updatedCount} actualizadas, ${completedCount} completadas y jobs programados para eliminación, ${errorCount} errores, ${skippedCount} omitidas`,
        processed: pendingSales.data.length,
        updated: updatedCount,
        completed: completedCount,
        errors: errorCount,
        skipped: skippedCount,
      }

      this.logger.log(`📊 ====== RESUMEN FINAL ======`)
      this.logger.log(`📋 Total procesadas: ${pendingSales.data.length}`)
      this.logger.log(`✅ Actualizadas: ${updatedCount}`)
      this.logger.log(
        `🎉 Completadas (jobs programados para eliminación): ${completedCount}`,
      )
      this.logger.log(`❌ Errores: ${errorCount}`)
      this.logger.log(`⏭️ Omitidas: ${skippedCount}`)

      return result
    } catch (error) {
      this.logger.error(
        '❌ Error general en processCheckPendingVouchers:',
        error.message,
      )
      this.logger.error('📋 Stack trace:', error.stack)
      throw error
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
      const facturaResult =
        await this.billingInvoiceService.createSimpleFactura(
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

  /**
   * Verifica si necesita actualizar la sale comparando estados y claves
   */
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

    // 2. Verificar clave de acceso
    const currentClave = sale.clave_acceso?.trim()
    const apiClave = apiData.clave_acceso?.trim()

    if (apiClave && (!currentClave || currentClave.length === 0)) {
      needsUpdate = true
      newClaveAcceso = apiClave
      reasons.push(`Nueva clave de acceso disponible`)
    }

    // 3. Verificar si el estado es autorizado pero no tenemos clave
    if (
      this.isAuthorizedState(apiData.estado) &&
      (!currentClave || currentClave.length === 0)
    ) {
      if (apiClave) {
        needsUpdate = true
        newClaveAcceso = apiClave
        reasons.push(`Comprobante autorizado requiere clave de acceso`)
      }
    }

    return {
      needsUpdate,
      newState,
      newClaveAcceso,
      reasons,
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
