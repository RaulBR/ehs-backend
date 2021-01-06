module.exports = {
    name: 'default',
    type: 'postgres',
    host: 'ec2-54-228-250-82.eu-west-1.compute.amazonaws.com',
    port: 5432,
    username: 'yhgbefvpubaszl',
    password: '615ec815f556a28aa918b6f5e1cc1514d018b5a371637fcf06e4baef4b602ea9',
    database: 'd710o49bke68if',
    synchronize: false,
    dropSchema: false,
    logging: false,
    entities:  ["dist/**/*.entity{.ts,.js}"],
  };

//     DB_HOST : 'ec2-54-228-250-82.eu-west-1.compute.amazonaws.com',
//     DB_PASSWORD : '615ec815f556a28aa918b6f5e1cc1514d018b5a371637fcf06e4baef4b602ea9',
//     DB_DATABASE:'d710o49bke68if',
//     DB_NAME:  'default',
//     DB_USER: 'yhgbefvpubaszl',
//     DB_PORT :5432,
  