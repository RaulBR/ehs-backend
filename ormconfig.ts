module.exports = {
    name: 'default',
    type: 'postgres',
    host: 'ec2-54-228-250-82.eu-west-1.compute.amazonaws.com',
    port: 5432,
    username: 'yhgbefvpubaszl',
    password: '615ec815f556a28aa918b6f5e1cc1514d018b5a371637fcf06e4baef4b602ea9',
    database: 'd710o49bke68if',
    synchronize: true,
    dropSchema: true,
    logging: true,
    entities:  ["dist/**/*.entity{.ts,.js}"],
  };