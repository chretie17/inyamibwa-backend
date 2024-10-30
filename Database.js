const mysql = require('mysql2');

class Database {
    constructor() {
        this.db = mysql.createConnection({
            host: 'localhost',       // Replace with your MySQL host, e.g., 'localhost'
            user: 'root',   // Replace with your MySQL username
            password: 'Admin@123', // Replace with your MySQL password
            database: 'inyamibwa'    // Replace with your database name
        });

        this.db.connect(err => {
            if (err) {
                console.error('MySQL connection error:', err);
                throw err;
            }
            console.log('MySQL connected');
        });
    }

    query(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.query(sql, params, (err, results) => {
                if (err) {
                    console.error('Query error:', err);
                    return reject(err);
                }
                resolve(results);
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.db.end(err => {
                if (err) {
                    console.error('Error closing the database connection:', err);
                    return reject(err);
                }
                console.log('MySQL connection closed');
                resolve();
            });
        });
    }
}

module.exports = new Database();
