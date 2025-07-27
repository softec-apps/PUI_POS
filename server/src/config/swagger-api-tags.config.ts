import { PATH_SOURCE } from '@/common/constants/pathSource.const'

export const API_TAGS_CONFIG = [
  {
    name: PATH_SOURCE.FILES,
    description:
      'Gestión de archivos multimedia: subida segura (imágenes, documentos, videos), almacenamiento en CDN, redimensionamiento automático de imágenes y control de accesos por roles. Límite de 50MB por archivo.',
    externalDocs: {
      description: 'Guía de manejo de archivos y formatos soportados',
      url: 'https://docs.example.com/files',
    },
  },
  {
    name: PATH_SOURCE.AUTH,
    description:
      'Endpoints para autenticación JWT, registro de usuarios, recuperación de contraseñas y gestión de sesiones. Incluye OAuth2 para integraciones externas',
    externalDocs: {
      description: 'Complete guide to authentication and security',
      url: 'https://docs.example.com/auth',
    },
  },
  {
    name: PATH_SOURCE.USER,
    description:
      'Complete user management: CRUD, role assignment. Supports pagination and advanced filters',
    externalDocs: {
      description: 'User and roles administration manual',
      url: 'https://docs.example.com/users',
    },
  },
  {
    name: PATH_SOURCE.CATEGORY,
    description: 'Product category management',
    externalDocs: {
      description: 'Complete guide to categories',
      url: 'https://docs.example.com/categories',
    },
  },
  {
    name: PATH_SOURCE.ATRIBUTE,
    description:
      'Definition and management of product attributes. Allows the creation of custom attributes (color, size, material)',
    externalDocs: {
      description: 'Product attribute system documentation',
      url: 'https://docs.example.com/attributes',
    },
  },
  {
    name: PATH_SOURCE.TEMPLATE,
    description:
      'Product template system: creation, updating, deletion, and publishing. Supports dynamic templates with customizable variables and real-time preview',
    externalDocs: {
      description: 'Advanced template creation guide',
      url: 'https://docs.example.com/templates',
    },
  },
  {
    name: PATH_SOURCE.SUPPLIER,
    description: 'provvedores',
    externalDocs: {
      description: 'Supplier Template Management Guide',
      url: 'https://docs.example.com/suppliers/templates',
    },
  },
  {
    name: PATH_SOURCE.BRAND,
    description: 'marcas',
    externalDocs: {
      description: 'Brand Management Guide',
      url: 'https://docs.example.com/brand/templates',
    },
  },
  {
    name: PATH_SOURCE.PRODUCT,
    description: 'prodctuos',
    externalDocs: {
      description: 'prodctuos Management Guide',
      url: 'https://docs.example.com/prodctuos/templates',
    },
  },
]
