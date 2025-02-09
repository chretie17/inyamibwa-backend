const db = require('../Database'); // Import your database connection
const nodemailer = require('nodemailer');

// Email setup
const transporter = nodemailer.createTransport({
    service: 'Gmail', // Update to your email service
    auth: {
        user: 'turachretien@gmail.com',
        pass: 'ruix vmny qntx ywos'
    }
});

// Create a new event

exports.createEvent = async (req, res) => {
    const { title, description, venue, date, time, created_by } = req.body;
    const creatorId = created_by || 'default_user_id';  // Replace 'default_user_id' as necessary

    const query = `INSERT INTO schedule (title, description, venue, date, time, created_by) VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [title, description, venue, date, time, creatorId];

    try {
        await db.query(query, values);
        res.status(201).json({ message: 'Event created successfully' });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
};


// Get all events
exports.getAllEvents = async (req, res) => {
    try {
        const events = await db.query('SELECT * FROM schedule ORDER BY date, time');
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
};

// Get a single event by ID
exports.getEventById = async (req, res) => {
    const { id } = req.params;
    try {
        const events = await db.query('SELECT * FROM schedule WHERE id = ?', [id]);
        if (events.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(events[0]);
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ error: 'Failed to fetch event' });
    }
};

// Update an event by ID
exports.updateEvent = async (req, res) => {
    const { id } = req.params;
    const { title, description, venue, date, time } = req.body;
    try {
        await db.query(
            'UPDATE schedule SET title = ?, description = ?, venue = ?, date = ?, time = ? WHERE id = ?',
            [title, description, venue, date, time, id]
        );
        res.json({ message: 'Event updated successfully' });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: 'Failed to update event' });
    }
};

// Delete an event by ID
exports.deleteEvent = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM schedule WHERE id = ?', [id]);
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
};

// Daily cron job to send notifications for today's events
const cron = require('node-cron');

cron.schedule('0 8 * * *', async () => { // Runs at 8:00 AM server time every day
    const today = new Date().toLocaleDateString('en-CA'); // Formats 'YYYY-MM-DD' in server's timezone
    console.log("Today's date (server timezone):", today);

    try {
        // Fetch events for today, adjusting for potential timezone differences
        const events = await db.query("SELECT * FROM schedule WHERE DATE(date) = ?", [today]);
        console.log("Today's events:", events);

        if (events.length > 0) {
            const users = await db.query("SELECT email FROM users");
            console.log("User emails:", users);

            users.forEach(user => {
                const mailOptions = {
                    from: 'turachretien@gmail.com',
                    to: user.email,
                    subject: `Today's Event Reminder`,
                    text: `Hi, here are the events scheduled for today:\n\n${events.map(event => `${event.title} at ${event.venue} - ${event.time}`).join('\n')}`
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('Error sending email:', error);
                    } else {
                        console.log(`Email sent to ${user.email}:`, info.response);
                    }
                });
            });
        } else {
            console.log("No events for today.");
        }
    } catch (error) {
        console.error('Error in daily cron job:', error);
    }
});
exports.getAllScheduledEvents = async (req, res) => {
    try {
        const events = await db.query(
            'SELECT * FROM schedule ORDER BY date, time'
        );
        res.json(events);
    } catch (error) {
        console.error('Error fetching scheduled events:', error);
        res.status(500).json({ error: 'Failed to fetch scheduled events' });
    }
};
