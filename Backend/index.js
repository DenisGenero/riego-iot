require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors')
const db = require('./config/db');
const mqtt = require('./config/mqtt');

const apiRoutes = require('./routes/api');

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});