const db = require('../Database');

// Get all complaints
exports.getAllComplaints = async (req, res) => {
    try {
        const complaints = await db.query('SELECT * FROM complaints');
        res.json(complaints);
    } catch (err) {
        res.status(500).send(err);
    }
};

// Add a complaint
exports.addComplaint = async (req, res) => {
    const { userId, content } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO complaints (user_id, content) VALUES (?, ?)',
            [userId, content]
        );
        res.json({ id: result.insertId, userId, content });
    } catch (err) {
        res.status(500).send(err);
    }
};

// Respond to a complaint
exports.respondToComplaint = async (req, res) => {
    const { id } = req.params;
    const { response } = req.body;
    try {
        await db.query('UPDATE complaints SET response = ? WHERE id = ?', [response, id]);
        res.json({ message: 'Response sent successfully' });
    } catch (err) {
        res.status(500).send(err);
    }
};
