const express = require('express');
const cors = require('cors');
const apiRoutes = require('./api-boilerplate');

const app = express();
app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api', apiRoutes);

// Health check
app.get('/', (req, res) => res.send('API running'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
