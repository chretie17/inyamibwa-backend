const db = require('../Database');

// Add or Update Event Type with Fee
exports.addOrUpdateEventType = async (req, res) => {
    const { event_type, fee } = req.body;
    try {
        const query = `
            INSERT INTO event_types (event_type, fee)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE fee = VALUES(fee)
        `;
        await db.query(query, [event_type, fee]);
        res.status(201).json({ message: 'Event type saved successfully' });
    } catch (error) {
        console.error('Error saving event type:', error);
        res.status(500).json({ error: 'Failed to save event type' });
    }
};

// Get all event types
exports.getAllEventTypes = async (req, res) => {
    try {
        const results = await db.query('SELECT * FROM event_types');
        res.json(results);
    } catch (error) {
        console.error('Error fetching event types:', error);
        res.status(500).json({ error: 'Failed to fetch event types' });
    }
};

// Book an Event (for public users)
exports.bookEvent = async (req, res) => {
    const { user_name, user_email, phone_number, event_type_id, event_date, event_time, additional_notes } = req.body;
    try {
        const query = `
            INSERT INTO bookings (user_name, user_email, phone_number, event_type_id, event_date, event_time, additional_notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(query, [user_name, user_email, phone_number, event_type_id, event_date, event_time, additional_notes]);
        res.status(201).json({ message: 'Booking created successfully' });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
};

// Get all bookings (Admin view)
exports.getAllBookings = async (req, res) => {
    try {
        const results = await db.query(`
            SELECT bookings.id, bookings.user_name, bookings.user_email, bookings.phone_number, bookings.event_date, bookings.event_time, 
                   bookings.additional_notes, event_types.event_type, event_types.fee
            FROM bookings
            JOIN event_types ON bookings.event_type_id = event_types.id
        `);
        res.json(results);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
};
