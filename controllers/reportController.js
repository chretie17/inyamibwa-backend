const db = require('../Database');

exports.getReportData = async (req, res) => {
    let { startDate, endDate } = req.query;
    const isDateRangeProvided = startDate && endDate;

    try {
        console.log("Start Date:", startDate);
        console.log("End Date:", endDate);

        // ✅ Convert dates to proper MySQL format
        if (isDateRangeProvided) {
            startDate = `${startDate} 00:00:00`;
            endDate = `${endDate} 23:59:59`;
        }

        // Fetch all event details
        const eventResults = await db.query(`
            SELECT 
                id, 
                title, 
                description, 
                venue, 
                DATE_FORMAT(date, '%Y-%m-%d') AS event_date, 
                TIME_FORMAT(time, '%H:%i') AS event_time
            FROM schedule
            ${isDateRangeProvided ? 'WHERE date BETWEEN STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s") AND STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s")' : ''}
            ORDER BY date DESC, time ASC;
        `, isDateRangeProvided ? [startDate, endDate] : []);

        // Fetch all booking details
        const bookingResults = await db.query(`
            SELECT 
                bookings.id,
                bookings.user_name,
                bookings.user_email,
                bookings.phone_number,
                DATE_FORMAT(bookings.event_date, '%Y-%m-%d') AS event_date,
                TIME_FORMAT(bookings.event_time, '%H:%i') AS event_time,
                bookings.additional_notes,
                bookings.status,
                event_types.event_type,
                event_types.fee,
                DATE_FORMAT(bookings.created_at, '%Y-%m-%d %H:%i:%s') AS created_at
            FROM bookings
            JOIN event_types ON bookings.event_type_id = event_types.id
            ${isDateRangeProvided ? 'WHERE bookings.created_at BETWEEN STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s") AND STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s")' : ''}
            ORDER BY bookings.event_date DESC, bookings.event_time ASC;
        `, isDateRangeProvided ? [startDate, endDate] : []);

        // Fetch all attendance records
        const attendanceResults = await db.query(`
            SELECT 
                attendance.id,
                users.name AS user_name,
                DATE_FORMAT(attendance.date, '%Y-%m-%d') AS attendance_date,
                attendance.status,
                DATE_FORMAT(attendance.created_at, '%Y-%m-%d %H:%i:%s') AS created_at
            FROM attendance
            JOIN users ON attendance.user_id = users.id
            ${isDateRangeProvided ? 'WHERE attendance.created_at BETWEEN STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s") AND STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s")' : ''}
            ORDER BY attendance.date DESC, attendance.created_at DESC;
        `, isDateRangeProvided ? [startDate, endDate] : []);

        // Fetch all complaint reports
        const complaintResults = await db.query(`
            SELECT 
                id, 
                user_id, 
                status, 
                DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at
            FROM complaints
            ${isDateRangeProvided ? 'WHERE created_at BETWEEN STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s") AND STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s")' : ''}
            ORDER BY created_at DESC;
        `, isDateRangeProvided ? [startDate, endDate] : []);

        // Fetch all training reports
        const trainingResults = await db.query(`
            SELECT 
                id, 
                title, 
                description, 
                file_type, 
                DATE_FORMAT(uploaded_at, '%Y-%m-%d %H:%i:%s') AS uploaded_at
            FROM trainings
            ${isDateRangeProvided ? 'WHERE uploaded_at BETWEEN STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s") AND STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s")' : ''}
            ORDER BY uploaded_at DESC;
        `, isDateRangeProvided ? [startDate, endDate] : []);

        // ✅ Debugging: Log fetched data count
        console.log(`Events Count: ${eventResults.length}`);
        console.log(`Bookings Count: ${bookingResults.length}`);
        console.log(`Attendance Count: ${attendanceResults.length}`);
        console.log(`Complaints Count: ${complaintResults.length}`);
        console.log(`Trainings Count: ${trainingResults.length}`);

        // ✅ Ensure the results are always arrays
        res.status(200).json({ 
            events: eventResults, 
            bookings: bookingResults, 
            attendance: attendanceResults, 
            complaints: complaintResults, 
            trainings: trainingResults
        });

    } catch (error) {
        console.error('Error fetching report data:', error);
        res.status(500).json({ error: 'Failed to fetch report data' });
    }
};
