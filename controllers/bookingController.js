const db = require('../Database');

// Get all bookings
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await db.query('SELECT * FROM bookings');
        res.json(bookings);
    } catch (err) {
        res.status(500).send(err);
    }
};

// Add a booking
exports.addBooking = async (req, res) => {
    const { userId, eventType, amount } = req.body; // eventType can be 'type1', 'type2', etc.
    try {
        const result = await db.query(
            'INSERT INTO bookings (user_id, event_type, amount) VALUES (?, ?, ?)',
            [userId, eventType, amount]
        );
        res.json({ id: result.insertId, userId, eventType, amount });
    } catch (err) {
        res.status(500).send(err);
    }
};
