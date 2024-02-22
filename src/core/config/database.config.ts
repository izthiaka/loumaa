export default () => ({
  uri: process.env.DATABASE_URL || 'mongodb://localhost:27017/DB_INVOIKA',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
});
