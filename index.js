const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const employeesRouter = require('./src/EmployeesSection/employees');
const tasksRouter = require('./src/TasksSection/tasks'); // Import tasks router
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const app = express();
const port = 3000;

// Initialize SQLite3 database (in-memory for example)
const db = new sqlite3.Database(':memory:');

// Middleware to parse JSON bodies
app.use(express.json());

// Use CORS middleware
app.use(cors());

// Mount the employees router
app.use('/employees', employeesRouter);

// Mount the tasks router
app.use('/tasks', tasksRouter);

// Swagger setup for API documentation
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Employee and Task Management API',
            version: '1.0.0',
            description: 'APIs for managing employees and tasks',
        },
        servers: [{ url: `http://localhost:${port}` }],
    },
    apis: ['./src/EmployeesSection/employees.js', './src/TasksSection/tasks.js'], // Include both employees and tasks route files
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Root route
app.get('/', (req, res) => {
    res.send('Welcome to the Employee and Task Management System');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
});
