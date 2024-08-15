const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// Initialize Express app and PostgreSQL connection pool
const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());

app.use(cors({
    origin: 'http://localhost:3001', // Replace with your React app's URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
  }));


const pool = new Pool({
  user: 'uzkxykte',
  host: 'drona.db.elephantsql.com',
  database: 'uzkxykte',
  password: 'RhujQZ0cMp63B3BTeyCsmU2LIvcb6xdX',
  port: 5432,
});
const JWT_SECRET = 'shhhhh';

app.post('/mentor/signup', async (req, res) => {
    const { name, email, password, area_of_interest } = req.body;

    try {
        // Check if the mentor already exists
        const existingMentor = await pool.query('SELECT * FROM mentors WHERE email = $1', [email]);
        if (existingMentor.rows.length > 0) {
            return res.status(400).json({ error: 'Mentor already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new mentor into the database
        const newMentor = await pool.query(
            'INSERT INTO mentors (mentor_id, name, email, password, area_of_interest) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [uuidv4(), name, email, hashedPassword, area_of_interest]
        );

        // Generate JWT token
        const token = jwt.sign({ mentor_id: newMentor.rows[0].mentor_id }, JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(201).json({ token, mentor: newMentor.rows[0] });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/mentor/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the mentor exists
        const mentor = await pool.query('SELECT * FROM mentors WHERE email = $1', [email]);
        if (mentor.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, mentor.rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ mentor_id: mentor.rows[0].mentor_id }, JWT_SECRET, {
            expiresIn: '1h',
        });

        res.json({ token, mentor: mentor.rows[0] });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/mentors', async (req, res) => {
    try {
        // Query to get all mentors
        const result = await pool.query('SELECT mentor_id, name, email, area_of_interest FROM mentors');
        
        // Respond with mentor details
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching mentors:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/student/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if the student already exists
        const existingStudent = await pool.query('SELECT * FROM students WHERE email = $1', [email]);
        if (existingStudent.rows.length > 0) {
            return res.status(400).json({ error: 'Student already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new student into the database
        const newStudent = await pool.query(
            'INSERT INTO students (student_id, name, email, password) VALUES ($1, $2, $3, $4) RETURNING *',
            [uuidv4(), name, email, hashedPassword]
        );

        // Generate JWT token
        const token = jwt.sign({ student_id: newStudent.rows[0].student_id }, JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(201).json({ token, student: newStudent.rows[0] });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/student/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the student exists
        const student = await pool.query('SELECT * FROM students WHERE email = $1', [email]);
        if (student.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, student.rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ student_id: student.rows[0].student_id }, JWT_SECRET, {
            expiresIn: '1h',
        });

        res.json({ token, student: student.rows[0] });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        user = user;
        next();
    });
};
app.get('/mentor/dashboard', authenticateToken, (req, res) => {
    res.json({ message: 'Welcome to your dashboard!' });
});

app.post('/mentor/mentor_availability', async (req, res) => {
    const { events, mentorId } = req.body;

    try {
        // Check if mentorId is provided
        if (!mentorId) {
            return res.status(400).json({ error: 'Mentor ID is required' });
        }

        // Begin a transaction
        await pool.query('BEGIN');

        // Delete existing availability for the mentor
        await pool.query('DELETE FROM mentor_availability WHERE mentor_id = $1', [mentorId]);

        // Insert new availability records
        for (const event of events) {
            const { id, title, start, end } = event;

            await pool.query(
                'INSERT INTO mentor_availability (id, mentor_id, title, start, end_time) VALUES ($1, $2, $3, $4, $5)',
                [id, mentorId, title, new Date(start), new Date(end)]
            );
        }

        // Commit the transaction
        await pool.query('COMMIT');

        res.status(200).json({ message: 'Availability saved successfully' });
    } catch (error) {
        console.error('Error saving availability:', error);
        await pool.query('ROLLBACK');
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/get-availability/:mentorId', async (req, res) => {
    const { mentorId } = req.params;

    try {
        const result = await pool.query(
            'SELECT id, title, start, end_time FROM mentor_availability WHERE mentor_id = $1',
            [mentorId]
        );

        // Send the fetched availability data back to the frontend
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching mentor availability:', error);
        res.status(500).json({ error: 'Failed to fetch mentor availability' });
    }
});

app.get('/available-mentors', async (req, res) => {
    const { areaOfInterest, date, startTime, duration } = req.query;

    try {
        const endTime = new Date(`1970-01-01T${startTime}Z`);
        endTime.setMinutes(endTime.getMinutes() + parseInt(duration));

        const mentors = await pool.query(`
            SELECT mentors.id, mentors.name, mentors.area_of_interest 
            FROM mentors 
            INNER JOIN mentor_availability 
            ON mentors.id = mentor_availability.mentor_id
            WHERE mentors.area_of_interest = $1 
            AND mentor_availability.available_date = $2
            AND mentor_availability.start_time <= $3
            AND mentor_availability.end_time >= $4
            AND mentor_availability.available = true
            ORDER BY mentor_availability.start_time
        `, [areaOfInterest, date, startTime, endTime.toISOString().substring(11, 19)]);

        res.json(mentors.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch available mentors' });
    }
});

// Endpoint to get available mentors for a given area of interest
app.get('/mentorss', async (req, res) => {
  const { areaOfInterest } = req.query;
  try {
    const result = await pool.query('SELECT * FROM mentors WHERE area_of_interest = $1 AND available = true ORDER BY preferred_back_to_back DESC', [areaOfInterest]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mentors' });
  }
});

// Endpoint to schedule a session
app.post('/schedule', async (req, res) => {
    const { studentId, mentorId, date, startTime, duration, premiumService } = req.body;

    try {
        // Calculate the end time based on the duration
        const endTime = new Date(`1970-01-01T${startTime}Z`);
        endTime.setMinutes(endTime.getMinutes() + parseInt(duration));

        // Check if the mentor is available at the specified time
        const availability = await pool.query(
            `SELECT * FROM mentor_availability 
             WHERE mentor_id = $1 
             AND available_date = $2 
             AND start_time <= $3 
             AND end_time >= $4 
             AND available = true`,
            [mentorId, date, startTime, endTime.toISOString().substring(11, 19)]
        );

        if (availability.rows.length === 0) {
            return res.status(400).json({ error: 'Mentor is not available at the requested time' });
        }

        // Check for nearby slots for back-to-back preference
        const previousSlot = await pool.query(
            `SELECT * FROM schedules 
             WHERE mentor_id = $1 
             AND schedule_date = $2 
             AND end_time = $3`,
            [mentorId, date, startTime]
        );

        const nextSlot = await pool.query(
            `SELECT * FROM schedules 
             WHERE mentor_id = $1 
             AND schedule_date = $2 
             AND start_time = $3`,
            [mentorId, date, endTime.toISOString().substring(11, 19)]
        );

        if (previousSlot.rows.length === 0 && nextSlot.rows.length === 0 && availability.rows[0].preferred_back_to_back) {
            return res.status(400).json({ error: 'Mentor prefers back-to-back sessions. Please choose a different time slot.' });
        }

        // Calculate the price
        let price = 0;
        switch (parseInt(duration)) {
            case 30:
                price = 2000;
                break;
            case 45:
                price = 3000;
                break;
            case 60:
                price = 4000;
                break;
        }

        if (premiumService) {
            price += 1000; // Additional charge for premium service
        }

        // Save the schedule
        const scheduleId = uuidv4();
        await pool.query(
            `INSERT INTO schedules (id, student_id, mentor_id, schedule_date, start_time, end_time, price) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [scheduleId, studentId, mentorId, date, startTime, endTime.toISOString().substring(11, 19), price]
        );

        // Update mentor availability
        await pool.query(
            `UPDATE mentor_availability 
             SET available = false 
             WHERE mentor_id = $1 
             AND available_date = $2 
             AND start_time <= $3 
             AND end_time >= $4`,
            [mentorId, date, startTime, endTime.toISOString().substring(11, 19)]
        );

        res.json({ message: 'Session scheduled successfully', price });
    } catch (error) {
        res.status(500).json({ error: 'Failed to schedule session' });
    }
});

// Endpoint to generate payment page
app.get('/payment/:scheduleId', async (req, res) => {
  const { scheduleId } = req.params;
  try {
    const result = await pool.query('SELECT price FROM schedules WHERE id = $1', [scheduleId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const { price } = result.rows[0];
    res.json({ paymentLink: `https://paymentgateway.com/pay?amount=${price}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate payment page' });
  }
});

// Start the server

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
