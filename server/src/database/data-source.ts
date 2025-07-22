import 'reflect-metadata'
import { DataSource, DataSourceOptions } from 'typeorm'

export const AppDataSource = new DataSource({
  type: process.env.DATABASE_TYPE as any,
  url: process.env.DATABASE_URL,
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT
    ? parseInt(process.env.DATABASE_PORT, 10)
    : 5432,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
  dropSchema: false,
  keepConnectionAlive: true,
  logging: process.env.NODE_ENV !== 'production',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  cli: {
    entitiesDir: 'src',
    subscribersDir: 'subscriber',
  },
  extra: {
    // based on https://node-postgres.com/api/pool
    // max connection pool size
    max: process.env.DATABASE_MAX_CONNECTIONS
      ? parseInt(process.env.DATABASE_MAX_CONNECTIONS, 10)
      : 100,

    // Configuración de zona horaria
    timezone: 'UTC', // Mantener UTC en la BD
    dateStrings: false, // TypeORM maneje las fechas como objetos Date

    // Configuración SSL
    ssl:
      process.env.DATABASE_SSL_ENABLED === 'true'
        ? {
            rejectUnauthorized:
              process.env.DATABASE_REJECT_UNAUTHORIZED === 'true',
            ca: process.env.DATABASE_CA ?? undefined,
            key: process.env.DATABASE_KEY ?? undefined,
            cert: process.env.DATABASE_CERT ?? undefined,
          }
        : undefined,
  },

  // Configuración adicional para TypeORM
  cache: {
    type: 'database',
    duration: 30000, // 30 segundos de cache
  },

  // Para PostgreSQL específicamente
  ...(process.env.DATABASE_TYPE === 'postgres' && {
    extra: {
      ...(process.env.DATABASE_SSL_ENABLED === 'true' && {
        ssl: {
          rejectUnauthorized:
            process.env.DATABASE_REJECT_UNAUTHORIZED === 'true',
          ca: process.env.DATABASE_CA ?? undefined,
          key: process.env.DATABASE_KEY ?? undefined,
          cert: process.env.DATABASE_CERT ?? undefined,
        },
      }),
      max: process.env.DATABASE_MAX_CONNECTIONS
        ? parseInt(process.env.DATABASE_MAX_CONNECTIONS, 10)
        : 100,
      // Configuraciones específicas de PostgreSQL
      timezone: 'UTC',
      parseInputDatesAsUTC: true, // Parsear fechas como UTC
      options: '-c timezone=UTC', // Forzar UTC en la sesión
    },
  }),
} as DataSourceOptions)
