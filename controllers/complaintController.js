// controllers/complaintsController.js

const db = require('../Database');

// Add a new complaint
exports.submitComplaint = async (req, res) => {
    const { user_id, complaint_text } = req.body;

    try {
        await db.query('INSERT INTO complaints (user_id, complaint_text) VALUES (?, ?)', [user_id, complaint_text]);
        res.status(201).json({ message: 'Complaint submitted successfully' });
    } catch (error) {
        console.error('Error submitting complaint:', error);
        res.status(500).json({ error: 'Failed to submit complaint' });
    }
};
exports.fileComplaint = async (req, res) => {
    const { user_id, complaint_text } = req.body;

    try {
        await db.query('INSERT INTO complaints (user_id, complaint_text, status) VALUES (?, ?, ?)', [user_id, complaint_text, 'pending']);
        res.status(201).json({ message: 'Complaint filed successfully' });
    } catch (error) {
        console.error('Error filing complaint:', error);
        res.status(500).json({ error: 'Failed to file complaint' });
    }
};

// Get all complaints (for admin view)
exports.getAllComplaints = async (req, res) => {
    try {
        const results = await db.query(`
            SELECT complaints.id, complaints.complaint_text, complaints.status, complaints.created_at, users.name AS user_name 
            FROM complaints
            JOIN users ON complaints.user_id = users.id
            ORDER BY complaints.created_at DESC
        `);
        res.json(results);
    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
};

// Update complaint status (resolve or reject)

// Update complaint status and add a response
// Update complaint status and add a response
exports.updateComplaintStatus = async (req, res) => {
    const { id } = req.params;
    const { status, response } = req.body;

    try {
        await db.query('UPDATE complaints SET status = ?, response = ? WHERE id = ?', [status, response, id]);
        res.status(200).json({ message: `Complaint ${status} successfully` });
    } catch (error) {
        console.error('Error updating complaint status:', error);
        res.status(500).json({ error: 'Failed to update complaint status' });
    }
};

// Get all complaints with user responses (for user view)
exports.getUserComplaints = async (req, res) => {
    const userId = req.userId || req.params.userId; // assuming `req.userId` from a middleware or get from params

    try {
        const results = await db.query(`
            SELECT id, complaint_text, status, response, created_at
            FROM complaints
            WHERE user_id = ?
            ORDER BY created_at DESC
        `, [userId]);

        res.json(results);
    } catch (error) {
        console.error('Error fetching user complaints:', error);
        res.status(500).json({ error: 'Failed to fetch user complaints' });
    }
};
// Reappeal a resolved or rejected complaint
exports.reappealComplaint = async (req, res) => {
    const { id } = req.params;

    try {
        // Only allow reappeals for complaints that are resolved or rejected
        const [existingComplaint] = await db.query('SELECT status FROM complaints WHERE id = ?', [id]);
        
        if (!existingComplaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }
        
        if (existingComplaint.status !== 'resolved' && existingComplaint.status !== 'rejected') {
            return res.status(400).json({ error: 'Only resolved or rejected complaints can be reappealed' });
        }

        // Update complaint status to 'reappealed'
        await db.query('UPDATE complaints SET status = ? WHERE id = ?', ['reappealed', id]);
        res.status(200).json({ message: 'Complaint reappealed successfully' });
    } catch (error) {
        console.error('Error reappealing complaint:', error);
        res.status(500).json({ error: 'Failed to reappeal complaint' });
    }
};