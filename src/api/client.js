/**
 * API Client
 * Axios instance ve interceptor'lar
 */

import axios from 'axios';
import { getApiConfig } from './config';
import { getAuthToken, clearAuthData } from '../utils/auth';

// Axios instance oluştur
const apiClient = axios.create(getApiConfig());

// Pending request'leri takip et (duplicate request engelleme)
const pendingRequests = new Map();

// Request key oluştur
const getRequestKey = (config) => {
  return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
};

// Request interceptor - Her isteğe token ekle ve duplicate engelle
apiClient.interceptors.request.use(
  (config) => {
    // Token ekle
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Request timing başlat
    config.metadata = { startTime: Date.now() };

    // Duplicate request kontrolü
    const requestKey = getRequestKey(config);
    
    // Aynı request zaten beklemedeyse, mevcut promise'i döndür
    if (pendingRequests.has(requestKey)) {
      console.warn(`⚠️ Duplicate request engellendi: ${requestKey}`);
      const controller = new AbortController();
      controller.abort();
      config.signal = controller.signal;
    } else {
      // Yeni request'i kaydet
      pendingRequests.set(requestKey, config);
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Hata yönetimi ve timing
apiClient.interceptors.response.use(
  (response) => {
    // Request timing hesapla
    const duration = Date.now() - response.config.metadata.startTime;
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`);

    // Pending request'i temizle
    const requestKey = getRequestKey(response.config);
    pendingRequests.delete(requestKey);

    return response;
  },
  (error) => {
    // Request timing hesapla (hata durumunda)
    if (error.config?.metadata?.startTime) {
      const duration = Date.now() - error.config.metadata.startTime;
      console.error(`❌ API Error: ${error.config.method?.toUpperCase()} ${error.config.url} (${duration}ms)`);
    }

    // Pending request'i temizle
    if (error.config) {
      const requestKey = getRequestKey(error.config);
      pendingRequests.delete(requestKey);
    }

    // AbortError'u görmezden gel
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      console.log(`🚫 Request iptal edildi: ${error.config?.url}`);
      return Promise.reject(error);
    }

    // 401 Unauthorized - Token geçersiz veya süresi dolmuş
    if (error.response?.status === 401) {
      clearAuthData();
      window.location.href = '/login';
    }

    // 422 Validation Error
    if (error.response?.status === 422) {
      return Promise.reject({
        message: 'Validation failed',
        errors: error.response.data.errors
      });
    }

    // Diğer hatalar
    return Promise.reject({
      message: error.response?.data?.message || 'Bir hata oluştu',
      status: error.response?.status
    });
  }
);

export default apiClient;

