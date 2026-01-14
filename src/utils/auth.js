/**
 * Auth Utility Functions
 * Token ve kullanıcı bilgisi yönetimi
 */

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

/**
 * Token'ı localStorage'a kaydet
 */
export const setAuthToken = (token) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

/**
 * Token'ı localStorage'dan al
 */
export const getAuthToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Kullanıcı verisini localStorage'a kaydet
 */
export const setUserData = (userData) => {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
};

/**
 * Kullanıcı verisini localStorage'dan al
 */
export const getUserData = () => {
  const userData = localStorage.getItem(USER_DATA_KEY);
  return userData ? JSON.parse(userData) : null;
};

/**
 * Tüm auth verilerini temizle (logout)
 */
export const clearAuthData = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
};

/**
 * Kullanıcının giriş yapmış olup olmadığını kontrol et
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Login işlemi sonrası verileri kaydet
 */
export const saveAuthData = (token, userData) => {
  setAuthToken(token);
  setUserData(userData);
};

