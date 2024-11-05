const db = require('../Database');

// Fetch user profile
// controllers/publicuserController.js

exports.getProfile = async (req, res) => {
    const userId = req.body.userId || req.query.userId; // Retrieve userId from request
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const [user] = await db.query('SELECT id, name, email, role, qualifications FROM users WHERE id = ?', [userId]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};


// Fetch trainings
exports.getTrainings = async (req, res) => {
    try {
        const trainings = await db.query('SELECT * FROM trainings');
        res.json(trainings);
    } catch (error) {
        console.error('Error fetching trainings:', error);
        res.status(500).json({ error: 'Failed to fetch trainings' });
    }
};

// Submit a complaint
exports.submitComplaint = async (req, res) => {
    const userId = req.user.id; // Assuming user ID is stored in session or token
    const { complaint } = req.body;
    try {
        await db.query('INSERT INTO complaints (user_id, complaint_text) VALUES (?, ?)', [userId, complaint]);
        res.status(201).json({ message: 'Complaint submitted successfully' });
    } catch (error) {
        console.error('Error submitting complaint:', error);
        res.status(500).json({ error: 'Failed to submit complaint' });
    }
};
