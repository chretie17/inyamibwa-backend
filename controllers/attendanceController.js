const db = require('../Database');

// Mark attendance for multiple users
exports.markAttendance = async (req, res) => {
    const attendanceData = req.body; // [{ user_id, status }, ...]
    const today = new Date().toISOString().split('T')[0];

    try {
        // Start a transaction
        await db.query('START TRANSACTION');

        // Fetch existing attendance for today and these user IDs
        const [existingAttendance] = await db.query(
            'SELECT user_id FROM attendance WHERE date = ? AND user_id IN (?)',
            [today, attendanceData.map(entry => entry.user_id)]
        );

        // Ensure existingAttendance is an array before mapping
        const existingUserIds = Array.isArray(existingAttendance)
            ? existingAttendance.map(entry => entry.user_id)
            : [];

        // Filter out users whose attendance has already been marked today
        const newAttendanceData = attendanceData.filter(entry => !existingUserIds.includes(entry.user_id));
        
        // If there are new attendance records to insert
        if (newAttendanceData.length > 0) {
            const insertQuery = 'INSERT INTO attendance (user_id, status, date) VALUES ?';
            const values = newAttendanceData.map(entry => [entry.user_id, entry.status, today]);
            await db.query(insertQuery, [values]);
            await db.query('COMMIT');
            res.status(201).json({ message: 'Attendance marked successfully!' });
        } else {
            await db.query('ROLLBACK');
            res.status(200).json({ message: 'Attendance already recorded for today' });
        }
    } catch (error) {
        await db.query('ROLLBACK');

        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ message: 'Duplicate attendance entry detected for today.' });
        } else {
            console.error('Error marking attendance:', error);
            res.status(500).json({ error: 'Failed to mark attendance' });
        }
    }
};



// Get all attendance records with user names
exports.getAllAttendanceWithUserNames = async (req, res) => {
    try {
        const results = await db.query(`
            SELECT attendance.id, attendance.date, attendance.status, users.name AS user_name 
            FROM attendance 
            JOIN users ON attendance.user_id = users.id 
            ORDER BY attendance.date DESC
        `);
        res.json(results);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ error: 'Failed to fetch attendance' });
    }
};
