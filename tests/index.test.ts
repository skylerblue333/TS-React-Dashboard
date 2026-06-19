import request from 'supertest';
import { app } from '../src/index';

describe('TS-React-Dashboard', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('should return dashboard metrics', async () => {
    const res = await request(app).get('/api/dashboard/metrics');
    expect(res.status).toBe(200);
    expect(res.body.activeUsers).toBe(1250);
  });

});
