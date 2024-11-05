const db = require('../Database');

exports.getAdminDashboardData = async (req, res) => {
  try {
    // Initialize variables to hold the values
    let totalComplaints = 0;
    let resolvedComplaints = 0;
    let pendingComplaints = 0;
    let totalBookings = 0;
    let approvedBookings = 0;
    let totalTrainings = 0;
    let totalEvents = 0;
    let complaintsTrends = [];
    let bookingsByEventType = [];
    let trainingsUploadsOverTime = [];

    // Execute each query and store the result in the respective variable
    const totalComplaintsResult = await db.query('SELECT COUNT(*) as count FROM complaints');
    if (totalComplaintsResult && totalComplaintsResult[0]) {
      totalComplaints = totalComplaintsResult[0].count;
    }

    const resolvedComplaintsResult = await db.query('SELECT COUNT(*) as count FROM complaints WHERE status = "resolved"');
    if (resolvedComplaintsResult && resolvedComplaintsResult[0]) {
      resolvedComplaints = resolvedComplaintsResult[0].count;
    }

    const pendingComplaintsResult = await db.query('SELECT COUNT(*) as count FROM complaints WHERE status = "pending"');
    if (pendingComplaintsResult && pendingComplaintsResult[0]) {
      pendingComplaints = pendingComplaintsResult[0].count;
    }

    const totalBookingsResult = await db.query('SELECT COUNT(*) as count FROM bookings');
    if (totalBookingsResult && totalBookingsResult[0]) {
      totalBookings = totalBookingsResult[0].count;
    }

    const approvedBookingsResult = await db.query('SELECT COUNT(*) as count FROM bookings WHERE status = "approved"');
    if (approvedBookingsResult && approvedBookingsResult[0]) {
      approvedBookings = approvedBookingsResult[0].count;
    }

    const totalTrainingsResult = await db.query('SELECT COUNT(*) as count FROM trainings');
    if (totalTrainingsResult && totalTrainingsResult[0]) {
      totalTrainings = totalTrainingsResult[0].count;
    }

    const totalEventsResult = await db.query('SELECT COUNT(*) as count FROM schedule');
    if (totalEventsResult && totalEventsResult[0]) {
      totalEvents = totalEventsResult[0].count;
    }

    // Queries for chart data
    complaintsTrends = await db.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM complaints
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) DESC
      LIMIT 10
    `) || [];

    bookingsByEventType = await db.query(`
      SELECT event_types.event_type, COUNT(*) as count
      FROM bookings
      JOIN event_types ON bookings.event_type_id = event_types.id
      GROUP BY event_types.event_type
    `) || [];

    trainingsUploadsOverTime = await db.query(`
      SELECT DATE(uploaded_at) as date, COUNT(*) as count
      FROM trainings
      GROUP BY DATE(uploaded_at)
      ORDER BY DATE(uploaded_at) DESC
      LIMIT 10
    `) || [];

    // Send the response with all data
    res.json({
      totalComplaints,
      resolvedComplaints,
      pendingComplaints,
      totalBookings,
      approvedBookings,
      totalTrainings,
      totalEvents,
      complaintsTrends,
      bookingsByEventType,
      trainingsUploadsOverTime,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};
