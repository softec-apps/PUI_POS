export const translateRoleName = (roleName: string) => {
	switch (roleName.toLowerCase()) {
		case 'admin':
			return 'Administrador'
		case 'manager':
			return 'Gerente'
		case 'inventory':
			return 'Inventario'
		case 'cashier':
			return 'Cajero'
		default:
			return roleName
	}
}

export const translateStatusName = (statusName: string) => {
	switch (statusName.toLowerCase()) {
		case 'active':
			return 'Activo'
		case 'inactive':
			return 'Inactivo'
		default:
			return statusName
	}
}
