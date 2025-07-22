export const MESSAGE_RESPONSE = {
  READED: 'Proveedor obtenido exitosamente',
  LISTED: 'Proveedores obtenidos exitosamente',
  CREATED: 'Proveedor creado exitosamente',
  UPDATED: 'Proveedor actualizado exitosamente',
  RESTORED: 'Proveedor restaurado exitosamente',
  DELETED: {
    HARD: 'Proveedor eliminado permanente',
    SOFT: 'Proveedor removido exitosamente',
  },
  CONFLIC: {
    RUC: 'Ya existe un proveedor con ese ruc',
    LEGAL_NAME: 'Ya existe un proveedor con ese nombre legal',
  },
  NOT_FOUND: {
    ID: 'No se encontro el proveedor',
    NAME: 'No se encontro el ruc del proveedor',
    LEGAL_NAME: 'No se encontro el nombre legal del proveedor',
  },
}
