const db = require('../Database'); // Ensure this is the correct path
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = '04dea15ca1a9353f275e2b202ca27ebd0fc86ab4ac661306cf5adc9995b4fab9e73b35b87f98790c37387118e78fc2cbd6e0c4631c013db01b2cc17cf02b07d6';

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        // Directly assign the query result to `user`
        const [user] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

        // Check if a user was found
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Log user to confirm
        console.log("User found:", user);

        // Compare the password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

        // Generate token
        const token = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });

        res.json({ 
            message: 'Login successful', 
            token,
            userId: user.id, 
            userRole: user.role 
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
};
