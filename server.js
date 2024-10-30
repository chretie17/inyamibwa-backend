const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const trainingRoutes = require('./routes/trainingRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and body parsing for JSON
app.use(cors());
app.use(bodyParser.json());

// Route Definitions - Directly connecting route files
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/schedule', scheduleRoutes);
// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});