export const MESSAGE_RESPONSE = {
  READED: 'Usuario obtenida exitosamente',
  LISTED: 'Usuarios obtenidos exitosamente',
  CREATED: 'Usuario creado exitosamente',
  UPDATED: 'Usuario actualizado exitosamente',
  RESTORED: 'Usuario restaurado exitosamente',
  DELETED: {
    HARD: 'Usuario eliminado permanente',
    SOFT: 'Usuario removido exitosamente',
  },
  CONFLIC: {
    EMAIL: 'Ya existe una usuario con ese e-mail',
    PHOTO: 'Ya existe una usuario con ese e-mail',
    HARD_DELETE: 'No pudes eliminar tu propio usuario',
  },
  NOT_FOUND: {
    ID: 'No se encontro la usuario',
    IMAGE: 'No se encontro la imagen de la usuario',
    ROL: 'No se encontro el rol',
    STATUS: 'No se encontro el rol',
    ID_IMAGE: 'No se encontro el id de la imagen de la usuario',
    EMAIL: 'No se encontro el usuario',
  },
}
