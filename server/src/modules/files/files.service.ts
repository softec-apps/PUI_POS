import * as path from 'path'
import * as fs from 'fs/promises'
import { Injectable } from '@nestjs/common'
import { FileType } from '@/modules/files/domain/file'
import { NullableType } from '@/utils/types/nullable.type'
import { FileRepository } from '@/modules/files/infrastructure/persistence/file.repository'

@Injectable()
export class FilesService {
  constructor(private readonly fileRepository: FileRepository) {}

  findById(id: FileType['id']): Promise<NullableType<FileType>> {
    return this.fileRepository.findById(id)
  }

  findByIds(ids: FileType['id'][]): Promise<FileType[]> {
    return this.fileRepository.findByIds(ids)
  }

  async deleteFileToStorage(fileUrl: string): Promise<void> {
    if (!fileUrl) {
      console.warn('Intento de eliminar archivo sin URL proporcionada')
      return
    }

    const filename = fileUrl.split('/').pop()
    if (!filename) {
      console.warn('No se pudo extraer nombre de archivo de la URL:', fileUrl)
      return
    }

    // Busca dinámicamente la carpeta server desde la ubicación actual
    let currentDir = __dirname
    while (currentDir !== path.dirname(currentDir)) {
      if (
        path.basename(currentDir) === 'server' ||
        (await fs
          .access(path.join(currentDir, 'server'))
          .then(() => true)
          .catch(() => false))
      ) {
        break
      }
      currentDir = path.dirname(currentDir)
    }

    // Si estamos dentro de server, usar directamente; si no, entrar a server
    const serverDir =
      path.basename(currentDir) === 'server'
        ? currentDir
        : path.join(currentDir, 'server')
    const uploadsDir = path.join(serverDir, 'files')
    const filePath = path.join(uploadsDir, filename)

    try {
      await fs.access(filePath)
      await fs.unlink(filePath)
      console.log(`Archivo físico eliminado: ${filename}`)
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.warn(`Archivo no encontrado: ${filePath}`)
      } else {
        console.error(`Error al eliminar archivo ${filename}:`, err.message)
        throw new Error(`No se pudo eliminar el archivo físico: ${err.message}`)
      }
    }
  }

  async deleteFileRecord(id: FileType['id']): Promise<void> {
    const file = await this.findById(id)
    if (!file) return

    await this.deleteFileToStorage(file.path)
    await this.fileRepository.delete(id)
  }
}
