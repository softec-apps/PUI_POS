import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common'
import { validate } from 'class-validator'
import { plainToClass } from 'class-transformer'

/**
 * CustomValidationPipe - Pipe personalizado para validación de datos en NestJS.
 *
 * Este pipe transforma y valida los datos entrantes (como body, query o params)
 * utilizando class-validator y class-transformer.
 * Si la validación falla, lanza una BadRequestException con los errores.
 */
@Injectable() // Decorador que permite inyección de dependencias en NestJS
export class CustomValidationPipe implements PipeTransform<any> {
  /**
   * Método principal que se ejecuta cuando el pipe es usado.
   * @param value - El valor entrante a validar (ej: body de una solicitud POST).
   * @param metadata - Metadatos del argumento (tipo, decorador, etc.).
   * @returns El valor original si pasa la validación.
   * @throws BadRequestException si la validación falla
   */
  async transform(value: any, { metatype }: ArgumentMetadata) {
    // Si no hay metatype (tipo de clase) o es un tipo nativo, no validamos
    if (!metatype || !this.toValidate(metatype)) return value

    // Transforma el objeto plano (JSON) a una instancia de la clase con decoradores
    const object = plainToClass(metatype, value)

    // Valida el objeto usando class-validator
    const errors = await validate(object, {
      whitelist: true, // Elimina propiedades no decoradas
      forbidNonWhitelisted: true, // Lanza error si hay propiedades no decoradas
    })

    // Si hay errores, lanza una excepción con los detalles
    if (errors.length > 0) throw new BadRequestException(errors)

    // Retorna el valor original (no el objeto transformado)
    return value
  }

  /**
   * Verifica si el tipo de dato necesita validación.
   * @param metatype - Tipo de dato a verificar.
   * @returns False si es un tipo nativo (no necesita validación), true en caso contrario.
   */
  private toValidate(metatype: any): boolean {
    // Tipos nativos que no requieren validación
    const types = [String, Boolean, Number, Array, Object]
    return !types.includes(metatype)
  }
}
