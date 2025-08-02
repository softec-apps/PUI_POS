export const MESSAGE_RESPONSE = {
  READED: 'Producto obtenido exitosamente',
  LISTED: 'Productos obtenidos exitosamente',
  CREATED: 'Producto creado exitosamente',
  UPDATED: 'Producto actualizado exitosamente',
  RESTORED: 'Producto restaurado exitosamente',
  DELETED: {
    HARD: 'Producto eliminado permanente',
    SOFT: 'Producto removido exitosamente',
  },
  CONFLIC: {
    NAME: 'Ya existe una producto con ese nombre',
    INSUFFICIENT_SCTOCK: 'Stock insuficiente',
  },
  NOT_FOUND: {
    ID: 'No se encontro el producto por su ID',
    NAME: 'No se encontro el producto por su nombre',
    IMAGE: 'No se encontro la imagen',
    BRAND: 'Marca no encontrada',
    TEMPLATE: 'Plantilla no encontrada',
    CATEGORY: 'Categoria no encontrada',
    SUPPLIER: 'Proveedor no encontrado',
    USER: 'Usuario no encontrado',
  },
}
