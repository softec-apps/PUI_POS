export enum AtributeTypeAllow {
  // Texto
  TEXT = 'text', // Nombre, descripción (varchar, text)

  // Números
  INTEGER = 'integer', // Stock, cantidad (integer)
  BIGINT = 'bigint', // ID externos (bigint)
  DECIMAL = 'decimal', // Precio (numeric/decimal)
  MONEY = 'money', // Precio en formato monetario (money)

  // Fechas/Horas
  DATE = 'date', // Fecha de caducidad (date)
  TIMESTAMP = 'timestamp', // Fecha de registro (timestamp)
  TIME = 'time', // Hora de promoción (time)

  // Lógicos
  BOOLEAN = 'boolean', // ¿Está activo? (bool)

  // Listas/Opciones
  ENUM = 'enum', // Talla (S/M/L), Color (enum)
  JSON = 'json', // Atributos compuestos (jsonb)
  ARRAY = 'array', // Lista de tags (ej: ["ofertas", "nuevo"])
}
