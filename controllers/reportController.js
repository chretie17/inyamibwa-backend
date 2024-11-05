const db = require('../Database');

// Fetch report data based on a date range with error handling and validation
exports.getReportData = async (req, res) => {
    const { startDate, endDate } = req.query;
    const isDateRangeProvided = startDate && endDate;

    try {
        // Complaints Report
        const [complaints] = await db.query(`
            SELECT status, COUNT(*) AS count
            FROM complaints
            ${isDateRangeProvided ? 'WHERE created_at BETWEEN ? AND ?' : ''}
            GROUP BY status
        `, isDateRangeProvided ? [startDate, endDate] : []);

        // Trainings Report
        const [trainings] = await db.query(`
            SELECT file_type, COUNT(*) AS count
            FROM trainings
            ${isDateRangeProvided ? 'WHERE uploaded_at BETWEEN ? AND ?' : ''}
            GROUP BY file_type
        `, isDateRangeProvided ? [startDate, endDate] : []);

        // Bookings Report
        const [bookings] = await db.query(`
            SELECT event_types.event_type, bookings.status, COUNT(*) AS count
            FROM bookings
            JOIN event_types ON bookings.event_type_id = event_types.id
            ${isDateRangeProvided ? 'WHERE event_date BETWEEN ? AND ?' : ''}
            GROUP BY event_types.event_type, bookings.status
        `, isDateRangeProvided ? [startDate, endDate] : []);

        // Events Report with formatted date and time
        const [events] = await db.query(`
            SELECT title, description, venue, DATE_FORMAT(date, '%Y-%m-%d') AS date, 
                   TIME_FORMAT(time, '%H:%i') AS time
            FROM schedule
            ${isDateRangeProvided ? 'WHERE date BETWEEN ? AND ?' : ''}
        `, isDateRangeProvided ? [startDate, endDate] : []);

        // Attendance Report with user details
        const [attendance] = await db.query(`
            SELECT attendance.id, DATE_FORMAT(attendance.date, '%Y-%m-%d') AS date, 
                   attendance.status, users.name AS user_name
            FROM attendance
            JOIN users ON attendance.user_id = users.id
            ${isDateRangeProvided ? 'WHERE attendance.date BETWEEN ? AND ?' : ''}
            ORDER BY attendance.date DESC
        `, isDateRangeProvided ? [startDate, endDate] : []);

        // Send all reports in a structured response
        res.status(200).json({ complaints, trainings, bookings, events, attendance });
    } catch (error) {
        console.error('Error fetching report data:', error);
        res.status(500).json({ error: 'Failed to fetch report data' });
    }
};
