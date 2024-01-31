export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  databaseUrl:
    process.env.DATABASE_URL || 'mongodb://localhost:27017/DB_INVOICA',
});
