const multer = require('multer');
const db = require('../Database'); // Database connection

// Configure multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage }).single('file'); // Use single file upload with key 'file'

// Create a new training
exports.createTraining = async (req, res) => {
    const { title, description, fileType, uploadedBy } = req.body;

    // Check if file and valid file type are provided
    if (!req.file || !['video', 'pdf'].includes(fileType)) {
        return res.status(400).json({ error: 'Invalid file type or missing file.' });
    }

    // Ensure uploadedBy is a valid integer
    if (!uploadedBy || isNaN(uploadedBy)) {
        return res.status(400).json({ error: 'Invalid uploaded_by value.' });
    }

    try {
        const sql = `INSERT INTO trainings (title, description, file_data, file_type, uploaded_by)
                     VALUES (?, ?, ?, ?, ?)`;
        
        // Execute the query and handle the result
        const result = await db.query(sql, [
            title,
            description,
            req.file.buffer,  // File binary data from multer
            fileType,
            parseInt(uploadedBy, 10) // Ensure `uploadedBy` is treated as an integer
        ]);

        // Check if the result was successful
        if (result && result.insertId) {
            res.status(201).json({ message: 'Training added successfully', trainingId: result.insertId });
        } else {
            res.status(500).json({ error: 'Failed to create training' });
        }
    } catch (error) {
        console.error('Error creating training:', error);
        res.status(500).json({ error: 'Failed to create training' });
    }
};

exports.getTrainings = async (req, res) => {
    try {
        // Modify query to join with users table to get user name
        const sql = `
            SELECT 
                trainings.id, 
                trainings.title, 
                trainings.description, 
                trainings.file_data, 
                trainings.file_type, 
                users.name AS uploaded_by,  -- Get user name instead of ID
                trainings.uploaded_at 
            FROM 
                trainings 
            JOIN 
                users 
            ON 
                trainings.uploaded_by = users.id
        `;
        
        const rows = await db.query(sql);

        console.log("Raw database response (rows):", rows); // Check structure of rows array

        // Ensure rows is an array of objects
        const trainings = Array.isArray(rows) ? rows : [rows];

        // Format file_data as Base64 for frontend compatibility
        const formattedTrainings = trainings.map(training => ({
            ...training,
            file_data: training.file_data ? Buffer.from(training.file_data).toString('base64') : null
        }));

        console.log("Fetched and formatted trainings:", formattedTrainings);
        res.status(200).json(formattedTrainings);
    } catch (error) {
        console.error('Error fetching trainings:', error);
        res.status(500).json({ error: 'Failed to fetch trainings' });
    }
};

// Get a specific training by ID
exports.getTrainingById = async (req, res) => {
    const { id } = req.params;
    try {
        const sql = 'SELECT * FROM trainings WHERE id = ?';
        const [trainings] = await db.query(sql, [id]);
        if (trainings.length === 0) {
            return res.status(404).json({ error: 'Training not found' });
        }
        res.status(200).json(trainings[0]);
    } catch (error) {
        console.error('Error fetching training:', error);
        res.status(500).json({ error: 'Failed to fetch training' });
    }
};

// Update an existing training
exports.updateTraining = async (req, res) => {
    const { id } = req.params;
    const { title, description, fileType } = req.body;

    try {
        // Build query based on fields present
        let sql = 'UPDATE trainings SET title = ?, description = ?, file_type = ? WHERE id = ?';
        const values = [title, description, fileType, id];

        if (req.file) {
            sql = 'UPDATE trainings SET title = ?, description = ?, file_data = ?, file_type = ? WHERE id = ?';
            values.splice(2, 0, req.file.buffer); // Insert file_data in the third position
        }

        const result = await db.query(sql, values);
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Training updated successfully' });
        } else {
            res.status(404).json({ error: 'Training not found' });
        }
    } catch (error) {
        console.error('Error updating training:', error);
        res.status(500).json({ error: 'Failed to update training' });
    }
};

// Delete a training by ID
exports.deleteTraining = async (req, res) => {
    const { id } = req.params;

    try {
        const sql = 'DELETE FROM trainings WHERE id = ?';
        const result = await db.query(sql, [id]);
        
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Training deleted successfully' });
        } else {
            res.status(404).json({ error: 'Training not found' });
        }
    } catch (error) {
        console.error('Error deleting training:', error);
        res.status(500).json({ error: 'Failed to delete training' });
    }
};
