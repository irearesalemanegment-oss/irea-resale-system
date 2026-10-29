require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./routes/auth');
const developerRoutes = require('./routes/developers');
const compoundRoutes = require('./routes/compounds');
const unitRoutes = require('./routes/units');
const notificationRoutes = require('./routes/notifications');
const reportRoutes = require('./routes/reports');
const exportRoutes = require('./routes/export');
const featureRoutes = require('./routes/features');
const teamRoutes = require('./routes/teams');
const dropdownRoutes = require('./routes/dropdowns');
const visibilityRoutes = require('./routes/visibility');
const auditRoutes = require('./routes/audit');
const userRoutes = require('./routes/users');
const roleRoutes = require('./routes/roles');

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'IREA Resale Management API is running', timestamp: new Date().toISOString() });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'IREA Resale Management API', 
    health: '/health',
    apiBase: '/api'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/developers', developerRoutes);
app.use('/api/compounds', compoundRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/features', featureRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/dropdowns', dropdownRoutes);
app.use('/api/visibility', visibilityRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`IREA Server running on port ${PORT}`);
});
