const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:'); // In-memory database for example; replace with your database connection

// Initialize tasks table if not exists
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        assigned_to TEXT NOT NULL,
        priority TEXT NOT NULL,
        status TEXT NOT NULL,
        deadline TEXT NOT NULL
    )`, (err) => {
        if (err) {
            console.error('Error initializing tasks table:', err);
        } else {
            console.log('Tasks table initialized successfully');
        }
    });
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - assigned_to
 *         - priority
 *         - status
 *         - deadline
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the task
 *         name:
 *           type: string
 *           description: The name of the task
 *         description:
 *           type: string
 *           description: The description of the task
 *         assigned_to:
 *           type: string
 *           description: The person assigned to the task
 *         priority:
 *           type: string
 *           description: The priority level of the task
 *         status:
 *           type: string
 *           description: The status of the task
 *         deadline:
 *           type: string
 *           description: The deadline of the task
 */

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Retrieve a list of tasks
 *     responses:
 *       200:
 *         description: A list of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */

router.get('/', (req, res) => {
    db.all('SELECT * FROM tasks', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Retrieve a task by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A single task object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 */

router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (!row) {
            res.status(404).json({ message: 'Task not found' });
        } else {
            res.json(row);
        }
    });
});

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 */

router.post('/', (req, res) => {
    const { name, description, assigned_to, priority, status, deadline } = req.body;
    const sql = 'INSERT INTO tasks (name, description, assigned_to, priority, status, deadline) VALUES (?, ?, ?, ?, ?, ?)';
    const params = [name, description, assigned_to, priority, status, deadline];

    db.run(sql, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(201).json({
                id: this.lastID,
                name,
                description,
                assigned_to,
                priority,
                status,
                deadline
            });
        }
    });
});

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a task by ID
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
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 */

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, assigned_to, priority, status, deadline } = req.body;
    const sql = 'UPDATE tasks SET name = ?, description = ?, assigned_to = ?, priority = ?, status = ?, deadline = ? WHERE id = ?';
    const params = [name, description, assigned_to, priority, status, deadline, id];

    db.run(sql, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                } else {
                    res.status(200).json(row);
                }
            });
        }
    });
});

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task deleted successfully
 */

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM tasks WHERE id = ?';

    db.run(sql, id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: 'Task deleted successfully', changes: this.changes });
        }
    });
});

module.exports = router;
