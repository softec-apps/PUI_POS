import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiTags,
} from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { FastifyRequest, FastifyReply } from 'fastify'
import { MultipartFile } from '@fastify/multipart'
import { FilesLocalService } from './files.service'
import { FileResponseDto } from './dto/file-response.dto'
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util'
import * as fs from 'fs'
import * as path from 'path'

@ApiTags('Files')
@Controller({
  path: 'files',
  version: '1',
})
export class FilesLocalController {
  constructor(private readonly filesService: FilesLocalService) {}

  @Post('upload')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiCreatedResponse({ type: FileResponseDto })
  async uploadFile(@Req() req: FastifyRequest): Promise<FileResponseDto> {
    console.log('=== CONTROLLER UPLOAD DEBUG ===')

    const parts = req.parts()
    for await (const part of parts) {
      // ✅ Verificamos que sea archivo
      if (part.type === 'file') {
        console.log('File received:')
        console.log('- Original filename:', part.filename)
        console.log('- Mimetype:', part.mimetype)
        console.log('- Field name:', part.fieldname)

        // 👇 VALIDAR TIPO DE ARCHIVO
        if (!part.filename?.match(/\.(jpg|jpeg|png|gif)$/i)) {
          console.log('ERROR: Invalid file type')
          throw new HttpException(
            {
              status: HttpStatus.UNPROCESSABLE_ENTITY,
              errors: { file: 'cantUploadFileType' },
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
          )
        }

        // 👇 GENERAR NOMBRE ÚNICO
        const fileExtension = part.filename.split('.').pop()?.toLowerCase()
        const uniqueFilename = `${randomStringGenerator()}.${fileExtension}`
        console.log('Generated unique filename:', uniqueFilename)

        // 👇 CREAR DIRECTORIO SI NO EXISTE
        const uploadDir = path.resolve('./files')
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true })
          console.log('Upload directory created:', uploadDir)
        }

        // 👇 OBTENER BUFFER Y GUARDAR ARCHIVO FÍSICAMENTE
        const buffer = await part.toBuffer()
        const filePath = path.join(uploadDir, uniqueFilename)

        console.log('Saving file to:', filePath)
        fs.writeFileSync(filePath, buffer)

        // Verificar que se guardó
        const fileExists = fs.existsSync(filePath)
        const fileSize = fileExists ? fs.statSync(filePath).size : 0
        console.log('File saved successfully:', fileExists)
        console.log('File size:', fileSize, 'bytes')

        // 👇 CREAR OBJETO CON EL NOMBRE ÚNICO (NO EL ORIGINAL)
        const file: Express.Multer.File = {
          fieldname: part.fieldname,
          originalname: part.filename, // Mantener el original para referencia
          encoding: part.encoding,
          mimetype: part.mimetype,
          size: buffer.length,
          buffer,
          stream: part.file,
          destination: uploadDir,
          filename: uniqueFilename, // 👈 AQUÍ ESTÁ LA CORRECCIÓN - USAR EL NOMBRE ÚNICO
          path: filePath,
        }

        console.log('File object for service:')
        console.log('- filename (unique):', file.filename)
        console.log('- originalname:', file.originalname)
        console.log('- path:', file.path)
        console.log('============================')

        return this.filesService.create(file)
      }
    }

    console.log('ERROR: No file received')
    throw new HttpException('No file received', HttpStatus.BAD_REQUEST)
  }

  @Get(':path')
  @ApiExcludeEndpoint()
  async download(@Param('path') path: string, @Res() res: FastifyReply) {
    console.log('=== DOWNLOAD DEBUG ===')
    console.log('Requested file path:', path)

    const fullPath = `./files/${path}`
    console.log('Full file path:', fullPath)
    console.log('File exists:', fs.existsSync(fullPath))
    console.log('====================')

    // ✅ usamos reply.sendFile solo si has registrado fastify-static
    return res.sendFile(path)
  }
}
