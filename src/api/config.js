/**
 * API Configuration
 * Ortamlar arası geçiş için merkezi konfigürasyon
 */

const ENV = {
  LOCAL: 'local',
  PRODUCTION: 'production'
};

// Mevcut ortamı buradan değiştirin
const CURRENT_ENV = ENV.LOCAL;

const API_CONFIG = {
  [ENV.LOCAL]: {
    baseURL: 'http://127.0.0.1:8000/api',
    timeout: 10000
  },
  [ENV.PRODUCTION]: {
    baseURL: '', // Production URL'i buraya eklenecek (örn: 'https://api.yourdomain.com/api')
    timeout: 15000
  }
};

export const getApiConfig = () => {
  return API_CONFIG[CURRENT_ENV];
};

export const setEnvironment = (env) => {
  if (!Object.values(ENV).includes(env)) {
    throw new Error(`Invalid environment: ${env}`);
  }
  return env;
};

export { ENV, CURRENT_ENV };

