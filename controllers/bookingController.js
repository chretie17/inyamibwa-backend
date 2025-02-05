const db = require('../Database');
const nodemailer = require('nodemailer');

// Setup nodemailer transport
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'turachretien@gmail.com', // Replace with your Gmail
        pass: 'ruix vmny qntx ywos', // Replace with your app password
    }
});

// Utility functions for formatting
const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const formatTime = (timeStr) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', {
        style: 'currency',
        currency: 'RWF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

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
        const results = await db.query('SELECT * FROM event_types ORDER BY event_type ASC');
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
        // Validate date isn't in the past
        const eventDateTime = new Date(event_date + 'T' + event_time);
        if (eventDateTime < new Date()) {
            return res.status(400).json({ error: 'Cannot book an event in the past' });
        }

        const query = `
            INSERT INTO bookings (user_name, user_email, phone_number, event_type_id, event_date, event_time, additional_notes, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
        `;
        
        const result = await db.query(query, [
            user_name, 
            user_email, 
            phone_number, 
            event_type_id, 
            event_date, 
            event_time, 
            additional_notes
        ]);

        // Send confirmation email to user
        const mailOptions = {
            from: 'Inyamibwa AERG <inyamibwaaerg@gmail.com>',
            to: user_email,
            subject: '🎵 Booking Request Received - Inyamibwa AERG',
            html: getBookingConfirmationTemplate({
                user_name,
                event_date,
                event_time,
                phone_number,
                additional_notes
            }),
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ 
            message: 'Booking request submitted successfully',
            booking_id: result.insertId 
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
};

// Get all bookings (Admin view)
exports.getAllBookings = async (req, res) => {
    try {
        const results = await db.query(`
            SELECT 
                bookings.id,
                bookings.user_name,
                bookings.user_email,
                bookings.phone_number,
                DATE_FORMAT(bookings.event_date, '%Y-%m-%d') AS event_date,
                TIME_FORMAT(bookings.event_time, '%H:%i:%s') AS event_time,
                bookings.additional_notes,
                bookings.status,
                event_types.event_type,
                event_types.fee,
                bookings.created_at
            FROM bookings
            JOIN event_types ON bookings.event_type_id = event_types.id
            ORDER BY bookings.event_date DESC, bookings.event_time ASC
        `);
        res.json(results);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
};

// Get booking request confirmation template
const getBookingConfirmationTemplate = (booking) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FFF8E1; font-family: Arial, sans-serif;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <!-- Header -->
        <tr>
            <td align="center" style="padding: 40px 0; background: linear-gradient(45deg, #B8860B, #DAA520); color: white;">
                <img src="https://igihe.com/IMG/logo/itorero_inyamibwa_ryishimiwe_ku_rwego_rukomeye.jpg?1700894683" alt="Inyamibwa AERG Logo" style="width: 150px; margin-bottom: 20px; border-radius: 8px;">
                <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Booking Request Received</h1>
            </td>
        </tr>
        
        <!-- Content -->
        <tr>
            <td style="padding: 40px 30px;">
                <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear ${booking.user_name},</p>
                <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
                    Thank you for choosing Inyamibwa AERG! We have received your booking request for ${formatDate(booking.event_date)} at ${formatTime(booking.event_time)}.
                </p>
                
                <!-- Booking Details Box -->
                <div style="background-color: #FFF8E1; border-radius: 12px; padding: 25px; margin: 30px 0; border: 1px solid #DAA520;">
                    <h2 style="color: #B8860B; font-size: 20px; margin: 0 0 20px 0;">Booking Details</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px 0; color: #666;">Date:</td>
                            <td style="padding: 10px 0; color: #333; font-weight: bold;">${formatDate(booking.event_date)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #666;">Time:</td>
                            <td style="padding: 10px 0; color: #333; font-weight: bold;">${formatTime(booking.event_time)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #666;">Phone:</td>
                            <td style="padding: 10px 0; color: #333; font-weight: bold;">${booking.phone_number}</td>
                        </tr>
                        ${booking.additional_notes ? `
                        <tr>
                            <td style="padding: 10px 0; color: #666;">Notes:</td>
                            <td style="padding: 10px 0; color: #333;">${booking.additional_notes}</td>
                        </tr>
                        ` : ''}
                    </table>
                </div>

                <!-- Next Steps Box -->
                <div style="background-color: #FAFAFA; border-radius: 12px; padding: 25px; margin: 30px 0;">
                    <h2 style="color: #B8860B; font-size: 20px; margin: 0 0 20px 0;">What's Next?</h2>
                    <ul style="color: #4a5568; margin: 0; padding-left: 20px; line-height: 1.8;">
                        <li>Our team will review your request within 24 hours</li>
                        <li>You'll receive a confirmation email with payment details</li>
                        <li>Feel free to contact us with any questions</li>
                        <li>We recommend saving our contact number</li>
                    </ul>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                    <a href="tel:+250788888888" style="display: inline-block; background: linear-gradient(45deg, #B8860B, #DAA520); color: white; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-weight: bold; margin: 10px;">
                        📞 Contact Us: +250788888888
                    </a>
                </div>
            </td>
        </tr>
        
        <!-- Footer -->
        <tr>
            <td style="background-color: #2C2C2C; padding: 30px; text-align: center; color: white;">
                <p style="margin: 0 0 10px 0; font-size: 16px;">Inyamibwa AERG Dance Troupe</p>
                <p style="margin: 0; font-size: 14px; color: #B8860B;">
                    📍 Kigali, Rwanda<br>
                    📧 inyamibwaaerg@gmail.com<br>
                    📱 +250788888888
                </p>
                <p style="margin: 20px 0 0 0; font-size: 12px; color: #888;">
                    © ${new Date().getFullYear()} Inyamibwa AERG. All rights reserved.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
`;

// Get approval email template
const getApprovalTemplate = (booking) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FFF8E1; font-family: Arial, sans-serif;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <!-- Header -->
        <tr>
            <td align="center" style="padding: 40px 0; background: linear-gradient(45deg, #B8860B, #DAA520); color: white;">
                <img src="https://igihe.com/IMG/logo/itorero_inyamibwa_ryishimiwe_ku_rwego_rukomeye.jpg?1700894683" alt="Inyamibwa AERG Logo" style="width: 150px; margin-bottom: 20px; border-radius: 8px;">
                <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Booking Confirmed! 🎉</h1>
            </td>
        </tr>
        
        <!-- Content -->
        <tr>
            <td style="padding: 40px 30px;">
                <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear ${booking.user_name},</p>
                <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
                    We're excited to confirm your booking with Inyamibwa AERG! Your event has been approved and we're looking forward to making it special.
                </p>
                
                <!-- Booking Details Box -->
                <div style="background-color: #FFF8E1; border-radius: 12px; padding: 25px; margin: 30px 0; border: 1px solid #DAA520;">
                    <h2 style="color: #B8860B; font-size: 20px; margin: 0 0 20px 0;">Your Booking Details</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px 0; color: #666;">Event Type:</td>
                            <td style="padding: 10px 0; color: #333; font-weight: bold;">${booking.event_type}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #666;">Date:</td>
                            <td style="padding: 10px 0; color: #333; font-weight: bold;">${formatDate(booking.event_date)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #666;">Time:</td>
                            <td style="padding: 10px 0; color: #333; font-weight: bold;">${formatTime(booking.event_time)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #666;">Fee:</td>
                            <td style="padding: 10px 0; color: #333; font-weight: bold;">${formatCurrency(booking.fee)}</td>
                        </tr>
                        ${booking.additional_notes ? `
                        <tr>
                            <td style="padding: 10px 0; color: #666;">Notes:</td>
                            <td style="padding:10px 0; color: #333;">${booking.additional_notes}</td>
                        </tr>
                        ` : ''}
                    </table>
                </div>

                <!-- Next Steps Box -->
                <div style="background-color: #FAFAFA; border-radius: 12px; padding: 25px; margin: 30px 0;">
                    <h2 style="color: #B8860B; font-size: 20px; margin: 0 0 20px 0;">Next Steps</h2>
                    <ul style="color: #4a5568; margin: 0; padding-left: 20px; line-height: 1.8;">
                        <li>Save the date and time in your calendar</li>
                        <li>Make the payment to MTN mobile money: 0788888888</li>
                        <li>Send the payment screenshot to our WhatsApp: +250788888888</li>
                        <li>Our team will contact you for final arrangements</li>
                    </ul>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                    <a href="tel:+250788888888" style="display: inline-block; background: linear-gradient(45deg, #B8860B, #DAA520); color: white; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-weight: bold; margin: 10px;">
                        📞 Call Us: +250788888888
                    </a>
                </div>
            </td>
        </tr>
        
        <!-- Footer -->
        <tr>
            <td style="background-color: #2C2C2C; padding: 30px; text-align: center; color: white;">
                <p style="margin: 0 0 10px 0; font-size: 16px;">Inyamibwa AERG Dance Troupe</p>
                <p style="margin: 0; font-size: 14px; color: #B8860B;">
                    📍 Kigali, Rwanda<br>
                    📧 inyamibwaaerg@gmail.com<br>
                    📱 +250788888888
                </p>
                <p style="margin: 20px 0 0 0; font-size: 12px; color: #888;">
                    © ${new Date().getFullYear()} Inyamibwa AERG. All rights reserved.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
`;

// Rejection email template
const getRejectionTemplate = (booking) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FFF8E1; font-family: Arial, sans-serif;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <!-- Header -->
        <tr>
            <td align="center" style="padding: 40px 0; background: linear-gradient(45deg, #B8860B, #DAA520); color: white;">
                <img src="https://igihe.com/IMG/logo/itorero_inyamibwa_ryishimiwe_ku_rwego_rukomeye.jpg?1700894683" alt="Inyamibwa AERG Logo" style="width: 150px; margin-bottom: 20px; border-radius: 8px;">
                <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Booking Update</h1>
            </td>
        </tr>
        
        <!-- Content -->
        <tr>
            <td style="padding: 40px 30px;">
                <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear ${booking.user_name},</p>
                <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
                    Thank you for considering Inyamibwa AERG for your event. After careful review of your request for 
                    ${formatDate(booking.event_date)} at ${formatTime(booking.event_time)}, we regret to inform you 
                    that we are unable to accommodate your booking at this time.
                </p>

                <!-- Alternative Options Box -->
                <div style="background-color: #FFF8E1; border-radius: 12px; padding: 25px; margin: 30px 0; border: 1px solid #DAA520;">
                    <h2 style="color: #B8860B; font-size: 20px; margin: 0 0 20px 0;">We're Here to Help</h2>
                    <ul style="color: #4a5568; margin: 0; padding-left: 20px; line-height: 1.8;">
                        <li>Consider booking for alternative dates</li>
                        <li>Explore our different performance packages</li>
                        <li>Contact us for personalized assistance</li>
                        <li>Check our availability calendar for other dates</li>
                    </ul>
                </div>

                <!-- Original Booking Details -->
                <div style="background-color: #FAFAFA; border-radius: 12px; padding: 25px; margin: 30px 0;">
                    <h2 style="color: #B8860B; font-size: 20px; margin: 0 0 20px 0;">Original Request Details</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px 0; color: #666;">Event Type:</td>
                            <td style="padding: 10px 0; color: #333; font-weight: bold;">${booking.event_type}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #666;">Date:</td>
                            <td style="padding: 10px 0; color: #333; font-weight: bold;">${formatDate(booking.event_date)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #666;">Time:</td>
                            <td style="padding: 10px 0; color: #333; font-weight: bold;">${formatTime(booking.event_time)}</td>
                        </tr>
                    </table>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                    <a href="tel:+250788888888" style="display: inline-block; background: linear-gradient(45deg, #B8860B, #DAA520); color: white; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-weight: bold; margin: 10px;">
                        📞 Contact Us: +250788888888
                    </a>
                </div>
            </td>
        </tr>
        
        <!-- Footer -->
        <tr>
            <td style="background-color: #2C2C2C; padding: 30px; text-align: center; color: white;">
                <p style="margin: 0 0 10px 0; font-size: 16px;">Inyamibwa AERG Dance Troupe</p>
                <p style="margin: 0; font-size: 14px; color: #B8860B;">
                    📍 Kigali, Rwanda<br>
                    📧 inyamibwaaerg@gmail.com<br>
                    📱 +250788888888
                </p>
                <p style="margin: 20px 0 0 0; font-size: 12px; color: #888;">
                    © ${new Date().getFullYear()} Inyamibwa AERG. All rights reserved.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
`;

// Approve booking controller
exports.approveBooking = async (req, res) => {
    const { id } = req.params;
    
    try {
        await db.query('UPDATE bookings SET status = ? WHERE id = ?', ['approved', id]);
        
        const [booking] = await db.query(
            'SELECT b.*, et.event_type, et.fee FROM bookings b JOIN event_types et ON b.event_type_id = et.id WHERE b.id = ?', 
            [id]
        );
        
        const mailOptions = {
            from: 'Inyamibwa AERG <inyamibwaaerg@gmail.com>',
            to: booking.user_email,
            subject: '🎉 Your Booking with Inyamibwa AERG is Confirmed!',
            html: getApprovalTemplate(booking),
            text: `Hello ${booking.user_name},\n\nYour booking has been approved! Event Date: ${formatDate(booking.event_date)} at ${formatTime(booking.event_time)}`
        };
        
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Booking approved and confirmation email sent.' });
    } catch (error) {
        console.error('Error approving booking:', error);
        res.status(500).json({ error: 'Failed to approve booking' });
    }
};

// Reject booking controller
exports.rejectBooking = async (req, res) => {
    const { id } = req.params;
    
    try {
        await db.query('UPDATE bookings SET status = ? WHERE id = ?', ['rejected', id]);
        
        const [booking] = await db.query(
            'SELECT b.*, et.event_type FROM bookings b JOIN event_types et ON b.event_type_id = et.id WHERE b.id = ?',
            [id]
        );
        
        const mailOptions = {
            from: 'Inyamibwa AERG <inyamibwaaerg@gmail.com>',
            to: booking.user_email,
            subject: 'Update Regarding Your Inyamibwa AERG Booking Request',
            html: getRejectionTemplate(booking),
            text: `Hello ${booking.user_name},\n\nWe regret to inform you that your booking for ${formatDate(booking.event_date)} cannot be accommodated at this time.`
        };
        
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Booking rejected and notification email sent.' });
    } catch (error) {
        console.error('Error rejecting booking:', error);
        res.status(500).json({ error: 'Failed to reject booking' });
    }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
    const { id } = req.params;
    try {
        const [booking] = await db.query(
            `SELECT b.*, et.event_type, et.fee 
             FROM bookings b 
             JOIN event_types et ON b.event_type_id = et.id 
             WHERE b.id = ?`,
            [id]
        );
        
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        res.json(booking);
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ error: 'Failed to fetch booking' });
    }
};

// Delete booking
exports.deleteBooking = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM bookings WHERE id = ?', [id]);
        res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ error: 'Failed to delete booking' });
    }
};

module.exports = exports;