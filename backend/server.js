const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Parser } = require('json2csv');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Schema and model
const logSchema = new mongoose.Schema({
  count: Number,
  timestamp: Number
});
const Log = mongoose.model('Log', logSchema);

// POST: Save log
app.post('/api/log', async (req, res) => {
  try {
    const { count, timestamp } = req.body;
    const log = new Log({ count, timestamp });
    await log.save();
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error saving log');
  }
});

// GET: All logs
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await Log.find();
    res.json(logs);
  } catch (error) {
    res.status(500).send('Error fetching logs');
  }
});

// GET: Export CSV
app.get('/api/export', async (req, res) => {
  try {
    const logs = await Log.find();
    const fields = ['count', 'timestamp'];
    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(logs);
    res.header('Content-Type', 'text/csv');
    res.attachment('attendance_logs.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).send('Error exporting logs');
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
