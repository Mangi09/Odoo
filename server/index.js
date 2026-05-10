const express = require('express');


const app = express();

// Middleware
app.use(express.json());

// Test Route
app.get('/', (req, res) => {
  res.send('Server is running successfully');
});

// Example API Route
app.get('/api', (req, res) => {
  res.json({ message: 'API working successfully' });
});


// Port
const PORT = 5000;

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
