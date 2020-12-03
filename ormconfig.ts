module.exports = {
    name: env.DB_NAME,
    type: 'postgres',
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
    synchronize: false,
    dropSchema: false,
    logging: false,
    entities:  ["dist/**/*.entity{.ts,.js}"],
  };