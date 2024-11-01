const db = require('../Database');

// Add or Update Event Type with Fee
exports.addOrUpdateEventType = async (req, res) => {
    const { event_type, fee } = req.body;
    try {
        const query = `
            INSERT INTO event_types (event_type, fee)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE fee = VALUES(fee)
        `;
        await db.query(query, [event_type, fee]);
        res.status(201).json({ message: 'Event type saved successfully' });
    } catch (error) {
        console.error('Error saving event type:', error);
        res.status(500).json({ error: 'Failed to save event type' });
    }
};

// Get all event types
exports.getAllEventTypes = async (req, res) => {
    try {
        const results = await db.query('SELECT * FROM event_types');
        res.json(results);
    } catch (error) {
        console.error('Error fetching event types:', error);
        res.status(500).json({ error: 'Failed to fetch event types' });
    }
};

// Book an Event (for public users)
exports.bookEvent = async (req, res) => {
    const { user_name, user_email, phone_number, event_type_id, event_date, event_time, additional_notes } = req.body;
    try {
        const query = `
            INSERT INTO bookings (user_name, user_email, phone_number, event_type_id, event_date, event_time, additional_notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(query, [user_name, user_email, phone_number, event_type_id, event_date, event_time, additional_notes]);
        res.status(201).json({ message: 'Booking created successfully' });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
};

// Get all bookings (Admin view)
exports.getAllBookings = async (req, res) => {
    try {
        const results = await db.query(`
            SELECT bookings.id, bookings.user_name, bookings.user_email, bookings.phone_number, 
                   DATE_FORMAT(bookings.event_date, '%Y-%m-%d') AS event_date, 
                   TIME_FORMAT(bookings.event_time, '%H:%i:%s') AS event_time, 
                   bookings.additional_notes, bookings.status, event_types.event_type, event_types.fee
            FROM bookings
            JOIN event_types ON bookings.event_type_id = event_types.id
        `);
        res.json(results);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
};


// controllers/bookingController.js
const nodemailer = require('nodemailer');

// Setup nodemailer transport for email notifications
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'turachretien@gmail.com', // Replace with your Gmail
        pass: 'ruix vmny qntx ywos', // Replace with your app password
    }
});

// Approve booking
const getApprovalTemplate = (userName, eventDetails) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: Arial, sans-serif;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <!-- Header -->
        <tr>
            <td align="center" style="padding: 40px 0; background: linear-gradient(45deg, #4CAF50, #45a049); color: white;">
                <img src="https://igihe.com/IMG/logo/itorero_inyamibwa_ryishimiwe_ku_rwego_rukomeye.jpg?1700894683" alt="Logo" style="width: 150px; margin-bottom: 20px;">
                <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Booking Confirmed!</h1>
            </td>
        </tr>
        
        <!-- Content -->
        <tr>
            <td style="padding: 40px 30px;">
                <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear ${userName},</p>
                <p style="font-size: 16px; color: #333; line-height: 1.5; margin-bottom: 20px;">Great news! Your booking has been approved. We're excited to host your event and will ensure everything is perfect for your special day.</p>
                
                <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 30px 0;">
                    <h2 style="color: #2d3748; font-size: 18px; margin: 0 0 15px 0;">Next Steps</h2>
                    <ul style="color: #4a5568; margin: 0; padding-left: 20px; line-height: 1.6;">
                        <li>Save the date in your calendar</li>
                        <li>Review your booking details</li>
                        <li>Contact us if you need to make any changes on +25078888888</li>
                        <li>Share the event details with your guests</li>
                    </ul>
                </div>

                <a href="tel:+25078888888" style="display: inline-block; background-color: #4CAF50; color: white; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: bold; margin-top: 20px;">Thank you for working with Us</a>
            </td>
        </tr>
        
        <!-- Footer -->
        <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
                <p style="margin: 0 0 10px 0; color: #666;">Need help? Contact our support team</p>
                <p style="margin: 0; font-size: 14px; color: #999;">
                    © 2024 Inyamibwa AERG<br>
                    +25078888888
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
`;

// HTML template for rejected bookings
const getRejectionTemplate = (userName) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: Arial, sans-serif;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <!-- Header -->
        <tr>
            <td align="center" style="padding: 40px 0; background: linear-gradient(45deg, #5c6bc0, #3949ab); color: white;">
                <img src="https://igihe.com/IMG/logo/itorero_inyamibwa_ryishimiwe_ku_rwego_rukomeye.jpg?1700894683" alt="Logo" style="width: 150px; margin-bottom: 20px;">
                <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Booking Update</h1>
            </td>
        </tr>
        
        <!-- Content -->
        <tr>
            <td style="padding: 40px 30px;">
                <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear ${userName},</p>
                <p style="font-size: 16px; color: #333; line-height: 1.5; margin-bottom: 20px;">Thank you for considering our venue for your event. After careful review, we regret to inform you that we are unable to accommodate your booking at this time.</p>
                
                <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 30px 0;">
                    <h2 style="color: #2d3748; font-size: 18px; margin: 0 0 15px 0;">Alternative Options</h2>
                    <ul style="color: #4a5568; margin: 0; padding-left: 20px; line-height: 1.6;">
                        <li>Consider alternative dates</li>
                        <li>Explore our other Dance Troupes</li>
                        <li>Contact our team for personalized assistance</li>
                        <li>Check our availability calendar</li>
                    </ul>
                </div>

                <a href="tel:+25078888888"" style="display: inline-block; background-color: #5c6bc0; color: white; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: bold; margin-top: 20px;">Contact Us for more</a>
            </td>
        </tr>
        
        <!-- Footer -->
        <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
                <p style="margin: 0 0 10px 0; color: #666;">Our team is here to help</p>
                <p style="margin: 0; font-size: 14px; color: #999;">
                    © 2024 Inyamibwa AERG<br>
                    +2507888888
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
`;

// Updated approve booking controller
exports.approveBooking = async (req, res) => {
    const { id } = req.params;
    
    try {
        // Update booking status to "approved"
        await db.query('UPDATE bookings SET status = ? WHERE id = ?', ['approved', id]);
        
        // Fetch the booking details
        const [booking] = await db.query(
            'SELECT b.*, et.event_type, et.fee FROM bookings b JOIN event_types et ON b.event_type_id = et.id WHERE b.id = ?', 
            [id]
        );
        
        const mailOptions = {
            from: 'your-email@gmail.com',
            to: booking.user_email,
            subject: '🎉 Your Booking Has Been Approved!',
            html: getApprovalTemplate(booking.user_name, booking),
            text: `Hello ${booking.user_name},\n\nYour booking has been approved!` // Fallback plain text
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });
        
        res.status(200).json({ message: 'Booking approved and email sent.' });
    } catch (error) {
        console.error('Error approving booking:', error);
        res.status(500).json({ error: 'Failed to approve booking' });
    }
};

// Updated reject booking controller
exports.rejectBooking = async (req, res) => {
    const { id } = req.params;
    
    try {
        // Update booking status to "rejected"
        await db.query('UPDATE bookings SET status = ? WHERE id = ?', ['rejected', id]);
        
        // Fetch the booking details
        const [booking] = await db.query('SELECT * FROM bookings WHERE id = ?', [id]);
        
        const mailOptions = {
            from: 'your-email@gmail.com',
            to: booking.user_email,
            subject: 'Update Regarding Your Booking Request',
            html: getRejectionTemplate(booking.user_name),
            text: `Hello ${booking.user_name},\n\nWe regret to inform you that your booking has been rejected.` // Fallback plain text
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });
        
        res.status(200).json({ message: 'Booking rejected and email sent.' });
    } catch (error) {
        console.error('Error rejecting booking:', error);
        res.status(500).json({ error: 'Failed to reject booking' });
    }
};