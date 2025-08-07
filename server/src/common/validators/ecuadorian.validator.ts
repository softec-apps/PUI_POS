import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import {
  validateCedula,
  validateEcuadorianRUC,
} from '@/common/utils/ecuadorianValidation-util'

// RUC
@ValidatorConstraint({ name: 'IsEcuadorianRUC', async: false })
export class IsEcuadorianRUCConstraint implements ValidatorConstraintInterface {
  validate(ruc: string | number, args: ValidationArguments): boolean {
    console.log('RUC recibido:', ruc)

    // Convertir a string si es número
    if (typeof ruc === 'number') ruc = ruc.toString()

    // Asegurar que es string
    if (typeof ruc !== 'string') return false

    // Corregir si vino con 12 dígitos (posiblemente perdió el 0 inicial)
    if (ruc.length === 12) {
      ruc = '0' + ruc
    }

    // Si no tiene 13 caracteres, ya no es válido
    if (ruc.length !== 13) return false

    return validateEcuadorianRUC(ruc)
  }

  defaultMessage(args: ValidationArguments) {
    return 'El RUC proporcionado no es válido para Ecuador'
  }
}

export function IsEcuadorianRUC(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEcuadorianRUCConstraint,
    })
  }
}

///////////////////////////////////////////////////////////////////

// CEDULA
@ValidatorConstraint({ name: 'IsEcuadorianCedula', async: false })
export class IsEcuadorianCedulaConstraint
  implements ValidatorConstraintInterface
{
  validate(cedula: string, args: ValidationArguments) {
    return validateCedula(cedula)
  }

  defaultMessage(args: ValidationArguments) {
    return 'La cédula proporcionada no es válida para Ecuador'
  }
}

export function IsEcuadorianCedula(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEcuadorianCedulaConstraint,
    })
  }
}
