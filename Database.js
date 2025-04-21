const mysql = require('mysql2');

class Database {
    constructor() {
        this.db = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Admin@123',
            database: 'inyamibwa'
        });

        this.db.connect(err => {
            if (err) {
                console.error('MySQL connection error:', err);
                throw err;
            }
            console.log('MySQL connected');

            // Set max_allowed_packet to 100MB (104857600 bytes)
            this.db.query('SET GLOBAL max_allowed_packet = 104857600', (err) => {
                if (err) {
                    console.error('Error setting max_allowed_packet:', err);
                } else {
                    console.log('max_allowed_packet set to 100MB');
                }
            });
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
