/**
 * Auth API
 * Kimlik doğrulama ile ilgili API çağrıları
 */

import apiClient from './client';
import { saveAuthData, clearAuthData } from '../utils/auth';

/**
 * Kullanıcı girişi
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} - { user, token }
 */
export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/login', {
      email: credentials.email,
      password: credentials.password
    });

    const { user, token } = response.data;
    
    // Token ve kullanıcı bilgisini kaydet
    saveAuthData(token, user);

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Giriş yapılamadı',
      errors: error.errors
    };
  }
};

/**
 * Kullanıcı kaydı
 * @param {Object} data - { name, email, tenant_name, tenant_slug, password }
 * @returns {Promise<Object>} - { user, token }
 */
export const register = async (data) => {
  try {
    const response = await apiClient.post('/register', {
      name: data.name,
      email: data.email,
      tenant_name: data.tenant_name,
      tenant_slug: data.tenant_slug,
      slug: data.tenant_slug,  // Backend'in beklediği field adına göre
      password: data.password
    });

    const { user, token } = response.data;
    
    // Token ve kullanıcı bilgisini kaydet
    saveAuthData(token, user);

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Kayıt oluşturulamadı',
      errors: error.errors
    };
  }
};

/**
 * Kullanıcı çıkışı
 */
export const logout = () => {
  clearAuthData();
  window.location.href = '/login';
};

/**
 * Şifre sıfırlama isteği
 * @param {string} email
 */
export const forgotPassword = async (email) => {
  try {
    const response = await apiClient.post('/forgot-password', { email });
    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Şifre sıfırlama isteği gönderilemedi',
      errors: error.errors
    };
  }
};

