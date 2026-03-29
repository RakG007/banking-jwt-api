const serverless = require('serverless-http');
const app = require('../server'); // This imports your express app from server.js

// This exports the app as a Netlify function
module.exports.handler = serverless(app);