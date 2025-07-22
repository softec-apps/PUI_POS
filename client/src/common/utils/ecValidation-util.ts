// Validación manual del RUC ecuatoriano
export const validateEcuadorianRUC = (ruc: string): boolean => {
	// Verificar que tenga exactamente 13 dígitos
	if (!/^\d{13}$/.test(ruc)) return false

	// Extraer componentes del RUC
	const provincia = parseInt(ruc.substring(0, 2))
	const tercerDigito = parseInt(ruc.substring(2, 3))
	const establecimiento = ruc.substring(10, 13)

	// Validar provincia (01-24)
	if (provincia < 1 || provincia > 24) return false

	// Validar que termine en 001 (establecimiento matriz)
	if (establecimiento !== '001') return false

	// Validar según el tipo de RUC (tercer dígito)
	if (tercerDigito >= 0 && tercerDigito <= 5) {
		// Persona natural - validar como cédula
		return validateCedula(ruc.substring(0, 10))
	} else if (tercerDigito === 6) {
		// Entidad pública
		return validateEntidadPublica(ruc)
	} else if (tercerDigito === 9) {
		// Persona jurídica (empresas)
		return validatePersonaJuridica(ruc)
	}

	return false
}

// Validar cédula (para RUC de persona natural)
export const validateCedula = (cedula: string): boolean => {
	if (cedula.length !== 10) return false

	const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2]
	let suma = 0

	for (let i = 0; i < 9; i++) {
		let resultado = parseInt(cedula[i]) * coeficientes[i]
		if (resultado >= 10) resultado = resultado - 9
		suma += resultado
	}

	const digitoVerificador = suma % 10 === 0 ? 0 : 10 - (suma % 10)
	return digitoVerificador === parseInt(cedula[9])
}

// Validar RUC de persona jurídica
export const validatePersonaJuridica = (ruc: string): boolean => {
	const coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2]
	let suma = 0

	for (let i = 0; i < 9; i++) suma += parseInt(ruc[i]) * coeficientes[i]

	const residuo = suma % 11
	const digitoVerificador = residuo === 0 ? 0 : 11 - residuo
	return digitoVerificador === parseInt(ruc[9])
}

// Validar RUC de entidad pública
export const validateEntidadPublica = (ruc: string): boolean => {
	const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2]
	let suma = 0

	for (let i = 0; i < 8; i++) suma += parseInt(ruc[i]) * coeficientes[i]

	const residuo = suma % 11
	const digitoVerificador = residuo === 0 ? 0 : 11 - residuo
	return digitoVerificador === parseInt(ruc[8])
}
