const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();
const db = new sqlite3.Database(':memory:'); // For a file-based database, use 'mydatabase.db'
const employees = [
    ['John Doe', 'john@example.com', '1234567890', '123 Elm Street', '2020-01-01'],
    ['Jane Smith', 'jane@example.com', '0987654321', '456 Oak Street', '2019-05-15'],
    ['Bob Johnson', 'bob@example.com', '1231231234', '789 Pine Street', '2021-07-23'],
    ['Alice Brown', 'alice@example.com', '2345678901', '234 Maple Street', '2022-02-10'],
    ['Charlie Davis', 'charlie@example.com', '3456789012', '567 Birch Street', '2018-11-30'],
    ['Diana Evans', 'diana@example.com', '4567890123', '890 Cedar Street', '2017-08-20'],
    ['Ethan Foster', 'ethan@example.com', '5678901234', '123 Spruce Street', '2021-06-14'],
    ['Fiona Green', 'fiona@example.com', '6789012345', '456 Fir Street', '2020-12-25'],
    ['George Harris', 'george@example.com', '7890123456', '789 Redwood Street', '2019-09-05'],

];


// Initialize SQLite3 database and create employees table
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        joining_date INTEGER NOT NULL
    )`, (err) => {
        if (err) {
            console.error('Error initializing database:', err);
        } else {
            console.log('Database initialized successfully');
            // Insert a test record
            employees.forEach(employee => {
                db.run(`INSERT INTO employees (name, email, phone, address, joining_date) VALUES (?, ?, ?, ?, ?)`,
                    employee, (err) => {
                        if (err) {
                            console.error('Error inserting record:', err);
                        } else {
                            console.log('Record inserted successfully');
                        }
                    });
            });
        }
    });
});

// Define route to get all employees
/**
 * @swagger
 * /employees:
 *   get:
 *     summary: Retrieve a list of employees
 *     responses:
 *       200:
 *         description: A list of employees
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: Alice
 *                   age:
 *                     type: integer
 *                     example: 25
 */
router.get('/', (req, res) => {
    db.all('SELECT * FROM employees', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});
//
// // Define route to get a specific employee by ID
// /**
//  * @swagger
//  * /employees/{id}:
//  *   get:
//  *     summary: Retrieve a single employee by ID
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       200:
//  *         description: A single employee
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 id:
//  *                   type: integer
//  *                 name:
//  *                   type: string
//  *                 age:
//  *                   type: integer
//  *       404:
//  *         description: Employee not found
//  */
// router.get('/:id', (req, res) => {
//     const id = req.params.id;
//     db.get('SELECT * FROM employees WHERE id = ?', [id], (err, row) => {
//         if (err) {
//             res.status(500).json({ error: err.message });
//             return;
//         }
//         if (!row) {
//             res.status(404).json({ error: 'Employee not found' });
//             return;
//         }
//         res.json(row);
//     });
// });

/**
 * @swagger
 * /employees:
 *   post:
 *     summary: Create a new employee
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - address
 *               - joining_date
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               joining_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Employee created
 */
router.post('/', (req, res) => {
    const { name, email, phone, address, joining_date } = req.body;
    const stmt = db.prepare('INSERT INTO employees (name, email, phone, address, joining_date) VALUES (?, ?, ?, ?, ?)');
    stmt.run(name, email, phone, address, joining_date, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: this.lastID });
    });
    stmt.finalize();
});
/**
 * @swagger
 * /employees/{id}:
 *   put:
 *     summary: Update an existing employee
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               joining_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Employee updated
 *       404:
 *         description: Employee not found
 */
router.put('/:id', (req, res) => {
    const { name, email, phone, address, joining_date } = req.body;
    const id = req.params.id;
    db.run(
        'UPDATE employees SET name = ?, email = ?, phone = ?, address = ?, joining_date = ? WHERE id = ?',
        [name, email, phone, address, joining_date, id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: 'Employee not found' });
                return;
            }
            res.json({ message: 'Employee updated' });
        }
    );
});

// Define route to delete an employee
/**
 * @swagger
 * /employees/{id}:
 *   delete:
 *     summary: Delete an employee
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employee deleted
 *       404:
 *         description: Employee not found
 */
router.delete('/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM employees WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Employee not found' });
            return;
        }
        res.json({ message: 'Employee deleted' });
    });
});

module.exports = router;
