module.exports = {
    name: 'default',
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'Serpentina',
    database: 'ehsfocus',
    synchronize: false,
    dropSchema: false,
    logging: false,
    entities:  ["dist/**/*.entity{.ts,.js}"],
  };