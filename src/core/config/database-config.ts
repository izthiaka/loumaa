export default () => ({
  uri: process.env.DATABASE_URL,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
});
