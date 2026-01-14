/**
 * Expense API
 * Gider yönetimi ile ilgili API çağrıları
 */

import apiClient from './client';

/**
 * Tüm giderleri getir
 * @returns {Promise<Object>} - { expenses: Array }
 */
export const getExpenses = async () => {
  try {
    const response = await apiClient.get('/expense');
    return {
      success: true,
      data: response.data.expenses || response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Giderler getirilemedi',
      errors: error.errors
    };
  }
};

/**
 * Yeni gider oluştur
 * @param {Object} data - Gider bilgileri
 * @param {number} data.category_id - Kategori ID (required)
 * @param {string} data.name - Gider adı (required)
 * @param {string} data.description - Açıklama (optional)
 * @param {number} data.amount - Tutar (required)
 * @param {string} data.payment_status - Ödeme durumu (optional)
 * @param {string} data.payment_date - Ödeme tarihi (optional)
 * @param {string} data.payment_time - Ödeme saati (optional)
 * @returns {Promise<Object>} - { expense: Object }
 */
export const createExpense = async (data) => {
  try {
    const response = await apiClient.post('/expense', data);
    return {
      success: true,
      data: response.data.expense,
      message: response.data.message || 'Gider başarıyla oluşturuldu'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Gider oluşturulamadı',
      errors: error.errors
    };
  }
};

/**
 * Gider güncelle
 * @param {number} id - Gider ID
 * @param {Object} data - Güncellenecek gider bilgileri
 * @returns {Promise<Object>} - { expense: Object }
 */
export const updateExpense = async (id, data) => {
  try {
    const response = await apiClient.put(`/expense/${id}`, data);
    return {
      success: true,
      data: response.data.expense,
      message: response.data.message || 'Gider başarıyla güncellendi'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Gider güncellenemedi',
      errors: error.errors
    };
  }
};

/**
 * Gider sil
 * @param {number} id - Gider ID
 * @returns {Promise<Object>}
 */
export const deleteExpense = async (id) => {
  try {
    const response = await apiClient.delete(`/expense/${id}`);
    return {
      success: true,
      message: response.data.message || 'Gider başarıyla silindi'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Gider silinemedi',
      errors: error.errors
    };
  }
};

/**
 * Tüm gider kategorilerini getir
 * @returns {Promise<Object>} - { expenseCategories: Array }
 */
export const getExpenseCategories = async () => {
  try {
    const response = await apiClient.get('/expense/categories');
    return {
      success: true,
      data: response.data.expenseCategories || response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Kategoriler getirilemedi',
      errors: error.errors
    };
  }
};

/**
 * Yeni gider kategorisi oluştur
 * @param {Object} data - Kategori bilgileri
 * @param {string} data.name - Kategori adı (required)
 * @param {string} data.description - Açıklama (optional)
 * @returns {Promise<Object>} - { expenseCategory: Object }
 */
export const createExpenseCategory = async (data) => {
  try {
    const response = await apiClient.post('/expense/categories', data);
    return {
      success: true,
      data: response.data.expenseCategory,
      message: response.data.message || 'Kategori başarıyla oluşturuldu'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Kategori oluşturulamadı',
      errors: error.errors
    };
  }
};

/**
 * Gider kategorisi güncelle
 * @param {number} id - Kategori ID
 * @param {Object} data - Güncellenecek kategori bilgileri
 * @returns {Promise<Object>} - { expenseCategory: Object }
 */
export const updateExpenseCategory = async (id, data) => {
  try {
    const response = await apiClient.put(`/expense/categories/${id}`, data);
    return {
      success: true,
      data: response.data.expenseCategory,
      message: response.data.message || 'Kategori başarıyla güncellendi'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Kategori güncellenemedi',
      errors: error.errors
    };
  }
};

/**
 * Gider kategorisi sil
 * @param {number} id - Kategori ID
 * @returns {Promise<Object>}
 */
export const deleteExpenseCategory = async (id) => {
  try {
    const response = await apiClient.delete(`/expense/categories/${id}`);
    return {
      success: true,
      message: response.data.message || 'Kategori başarıyla silindi'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Kategori silinemedi',
      errors: error.errors
    };
  }
};
