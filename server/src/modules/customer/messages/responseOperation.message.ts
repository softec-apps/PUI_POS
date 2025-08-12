export const MESSAGE_RESPONSE = {
  READED: 'Cliente obtenido exitosamente',
  LISTED: 'Clientes obtenidos exitosamente',
  CREATED: 'Cliente creado exitosamente',
  UPDATED: 'Cliente actualizado exitosamente',
  RESTORED: 'Cliente restaurado exitosamente',
  DELETED: {
    HARD: 'Cliente eliminado permanentemente',
    SOFT: 'Cliente removido exitosamente',
  },
  CONFLICT: {
    IDENTIFICATION: 'Ya existe un cliente con este número de identificación',
    EMAIL: 'Ya existe un cliente con este correo electrónico',
  },
  VALIDATION: {
    FINAL_CONSUMER: '',
  },
  NOT_FOUND: {
    ID: 'No se encontró el cliente por su ID',
    IDENTIFICATION: 'No se encontró el cliente por su número de identificación',
    FINAL_CONSUMER: 'El consumidor final no existe en el sistema',
  },
}
