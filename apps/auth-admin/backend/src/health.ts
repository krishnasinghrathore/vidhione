import { api } from 'encore.dev/api';

type HealthResponse = {
  status: 'ok';
};

export const health = api(
  { method: 'GET', path: '/health', expose: true },
  async (): Promise<HealthResponse> => {
    return { status: 'ok' };
  }
);
