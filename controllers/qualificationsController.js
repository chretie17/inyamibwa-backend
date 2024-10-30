const db = require('../Database');

// Fetch qualifications for all users (with qualifications from the users table)
exports.getAllQualifications = async (req, res) => {
    try {
        console.log('Fetching all users with their qualifications...');  // Log start of fetching

        // Select all users with their qualifications from the users table directly
        const results = await db.query(`
            SELECT id AS user_id, name AS user_name, qualifications AS qualification
            FROM users
            WHERE role = 'user'
        `);

        console.log('Fetched users with qualifications:', results);  // Log fetched results
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching qualifications:', error);
        res.status(500).json({ error: 'Failed to fetch qualifications' });
    }
};

// Add or update a qualification for a specific user
exports.addOrUpdateQualification = async (req, res) => {
    const { user_id, qualification } = req.body;
    console.log('Received request to add or update qualification:', { user_id, qualification });  // Log request data

    try {
        const query = `
            UPDATE users
            SET qualifications = ?
            WHERE id = ?
        `;
        const result = await db.query(query, [qualification, user_id]);
        console.log('Qualification saved successfully:', result);  // Log result of update
        res.status(201).json({ message: 'Qualification saved successfully' });
    } catch (error) {
        console.error('Error saving qualification:', error);
        res.status(500).json({ error: 'Failed to save qualification' });
    }
};
