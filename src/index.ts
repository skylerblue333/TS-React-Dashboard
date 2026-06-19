import express from 'express';
import { z } from 'zod';

export const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'TS-React-Dashboard' });
});

app.get('/api/dashboard/metrics', (req, res) => {
  res.json({
    activeUsers: 1250,
    revenue: 45000,
    uptime: 99.99,
    charts: {
      daily: [10, 20, 15, 30, 25, 40, 35]
    }
  });
});


if (require.main === module) {
  app.listen(3000, () => console.log('Server running on port 3000'));
}
