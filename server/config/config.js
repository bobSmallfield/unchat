module.exports = {
  "development": {
    "username": "root",
    "password": "hahah u thought u were gonna hack my db?",
    "database": "chat",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": process.env.DB_USER,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "dialect": "mysql"
  }
};
