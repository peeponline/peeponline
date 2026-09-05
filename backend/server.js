const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const app = require('./src/app');
const connectDB = require('./src/config/database');

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});