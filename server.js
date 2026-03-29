const express = require('express');
const serverless = require('serverless-http');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Connect your routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/banking', require('./routes/banking'));

// This lets you test locally using `npm run dev`
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Local development server running on port ${PORT}`);
    });
}

// This is the crucial line for Netlify deployment
module.exports = app;