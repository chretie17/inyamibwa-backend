const db = require('../Database');
const bcrypt = require('bcrypt');

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await db.query('SELECT * FROM users');
        
        if (Array.isArray(users) && users.length > 0) {
            res.json(users);
        } else {
            res.json([]);
        }
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};





// Add a new user (Admin only)
exports.addUser = async (req, res) => {
    const { name, email, username, password, qualifications, role } = req.body;

    // Validate required fields
    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            'INSERT INTO users (name, email, username, password, qualifications, role) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, username, hashedPassword, qualifications, role]
        );

        // Ensure result is properly structured before accessing `insertId`
        const insertedId = result.insertId || (result[0] && result[0].insertId);
        if (!insertedId) {
            throw new Error('User was not inserted correctly');
        }

        res.json({ id: insertedId, name, email, username, qualifications, role });
    } catch (err) {
        console.error("Error adding user:", err);
        res.status(500).json({ error: 'Failed to add user', details: err.message });
    }
};


exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, username, password, qualifications, role } = req.body;

    try {
        // Check if a password is provided; hash it if it is
        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // Build the update query and values dynamically based on provided fields
        const fieldsToUpdate = [];
        const values = [];

        if (name) {
            fieldsToUpdate.push("name = ?");
            values.push(name);
        }
        if (email) {
            fieldsToUpdate.push("email = ?");
            values.push(email);
        }
        if (username) {
            fieldsToUpdate.push("username = ?");
            values.push(username);
        }
        if (hashedPassword) {
            fieldsToUpdate.push("password = ?");
            values.push(hashedPassword);
        }
        if (qualifications) {
            fieldsToUpdate.push("qualifications = ?");
            values.push(qualifications);
        }
        if (role) {
            fieldsToUpdate.push("role = ?");
            values.push(role);
        }

        // Ensure there’s something to update
        if (fieldsToUpdate.length === 0) {
            return res.status(400).json({ error: 'No fields provided for update' });
        }

        // Finalize query and values array
        const query = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
        values.push(id);

        // Execute the update
        await db.query(query, values);
        res.json({ message: 'User updated successfully' });
    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ error: 'Failed to update user', details: err.message });
    }
};

// Update user qualifications
exports.updateQualifications = async (req, res) => {
    const { id } = req.params;
    const { qualifications } = req.body;
    try {
        await db.query('UPDATE users SET qualifications = ? WHERE id = ?', [qualifications, id]);
        res.json({ message: 'Qualifications updated successfully' });
    } catch (err) {
        console.error("Error updating qualifications:", err); // Log error details
        res.status(500).json({ error: 'Failed to update qualifications', details: err.message });
    }
};

// Check attendance for a user
exports.checkAttendance = async (req, res) => {
    const { id } = req.params;
    try {
        const [attendanceRecords] = await db.query('SELECT * FROM attendance WHERE user_id = ?', [id]);
        res.json(attendanceRecords);
    } catch (err) {
        console.error("Error checking attendance:", err); // Log error details
        res.status(500).json({ error: 'Failed to check attendance', details: err.message });
    }
};
