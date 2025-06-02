const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Parser } = require('json2csv');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

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
    io.emit('new_log', {
      _id: log._id.toString(),
      count,
      timestamp: new Date(timestamp).toISOString()
    });
    res.sendStatus(200);
  } catch (error) {
    console.error('Error saving log:', error);
    res.status(500).send('Error saving log');
  }
});

// GET: All logs
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await Log.find();
    res.json(logs.map(log => ({
      _id: log._id.toString(),
      count: log.count,
      timestamp: new Date(log.timestamp).toISOString()
    })));
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).send('Error fetching logs');
  }
});

// GET: Export CSV
app.get('/api/export', async (req, res) => {
  try {
    const logs = await Log.find();
    const fields = ['count', 'timestamp'];
    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(logs.map(log => ({
      count: log.count,
      timestamp: new Date(log.timestamp)
      // .toISOString()
    })));
    res.header('Content-Type', 'text/csv');
    res.attachment('attendance_logs.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting logs:', error);
    res.status(500).send('Error exporting logs');
  }
});


// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));