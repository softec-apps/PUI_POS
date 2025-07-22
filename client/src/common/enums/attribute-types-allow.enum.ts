export enum AttributeTypeAllow {
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

// Traslate AttributeTypeAllow (ES)
export const typeLabelsTraslateToEs: Record<AttributeTypeAllow, string> = {
	[AttributeTypeAllow.TEXT]: 'Texto',
	[AttributeTypeAllow.INTEGER]: 'Número entero',
	[AttributeTypeAllow.BIGINT]: 'Número grande',
	[AttributeTypeAllow.DECIMAL]: 'Número decimal',
	[AttributeTypeAllow.MONEY]: 'Dinero',
	[AttributeTypeAllow.DATE]: 'Fecha',
	[AttributeTypeAllow.TIMESTAMP]: 'Fecha y hora',
	[AttributeTypeAllow.TIME]: 'Hora',
	[AttributeTypeAllow.BOOLEAN]: 'Verdadero/Falso',
	[AttributeTypeAllow.ENUM]: 'Lista de opciones',
	[AttributeTypeAllow.JSON]: 'JSON',
	[AttributeTypeAllow.ARRAY]: 'Lista de valores',
}
