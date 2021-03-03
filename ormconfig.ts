module.exports = {
    name: process.env.DB_NAME,
    type: 'postgres',
    host:  process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username:  process.env.DB_USER,
    password:  process.env.DB_PASSWORD,
    database:  process.env.DB_DATABASE,
    synchronize: false,
    dropSchema: false,
    logging: true,
    entities:  ["dist/**/*.entity{.ts,.js}"],
  };


  