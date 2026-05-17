require('dotenv').config();
const app = require('./src/app');

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 5000;

app.listen(PORT, HOST, () => {
  console.log(`🚀 OpenJob API running at http://${HOST}:${PORT}`);
});
