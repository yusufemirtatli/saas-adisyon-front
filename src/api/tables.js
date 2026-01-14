/**
 * Tables API
 * Masa ve masa alanları ile ilgili API çağrıları
 */

import apiClient from './client';

/**
 * Tüm masaları getir
 * @returns {Promise<Object>} - { tables: Array }
 */
export const getTables = async () => {
  try {
    const response = await apiClient.get('/table');
    return {
      success: true,
      data: response.data.tables
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Masalar getirilemedi',
      errors: error.errors
    };
  }
};

/**
 * Get table by ID with items
 * @param {number} id - Table ID
 * @returns {Promise<{success: boolean, data?: object, message?: string, errors?: object}>}
 */
export const getTableById = async (id) => {
  try {
    const response = await apiClient.get(`/table/${id}`);
    return {
      success: true,
      data: response.data.table
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Masa bilgileri getirilemedi',
      errors: error.errors
    };
  }
};

/**
 * Yeni masa oluştur
 * @param {Object} data - { name, table_area_id }
 * @returns {Promise<Object>} - { table: Object }
 */
export const createTable = async (data) => {
  try {
    const response = await apiClient.post('/table', {
      name: data.name,
      table_area_id: data.table_area_id
    });
    return {
      success: true,
      data: response.data.table,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Masa oluşturulamadı',
      errors: error.errors
    };
  }
};

/**
 * Masa güncelle
 * @param {number} id - Masa ID
 * @param {Object} data - { name?, table_area_id? }
 * @returns {Promise<Object>} - { table: Object }
 */
export const updateTable = async (id, data) => {
  try {
    const response = await apiClient.put(`/table/${id}`, data);
    return {
      success: true,
      data: response.data.table,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Masa güncellenemedi',
      errors: error.errors
    };
  }
};

/**
 * Masa sil
 * @param {number} id - Masa ID
 * @returns {Promise<Object>}
 */
export const deleteTable = async (id) => {
  try {
    const response = await apiClient.delete(`/table/${id}`);
    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Masa silinemedi',
      errors: error.errors
    };
  }
};

/**
 * Tüm masa alanlarını getir
 * @returns {Promise<Object>} - { tableAreas: Array }
 */
export const getTableAreas = async () => {
  try {
    const response = await apiClient.get('/table/area');
    return {
      success: true,
      data: response.data.tableAreas
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Masa alanları getirilemedi',
      errors: error.errors
    };
  }
};

/**
 * Yeni masa alanı oluştur
 * @param {Object} data - { name }
 * @returns {Promise<Object>} - { tableArea: Object }
 */
export const createTableArea = async (data) => {
  try {
    const response = await apiClient.post('/table/area', {
      name: data.name
    });
    return {
      success: true,
      data: response.data.tableArea,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Masa alanı oluşturulamadı',
      errors: error.errors
    };
  }
};

/**
 * Masa alanı güncelle
 * @param {number} id - Alan ID
 * @param {Object} data - { name }
 * @returns {Promise<Object>} - { tableArea: Object }
 */
export const updateTableArea = async (id, data) => {
  try {
    const response = await apiClient.put(`/table/area/${id}`, data);
    return {
      success: true,
      data: response.data.tableArea,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Masa alanı güncellenemedi',
      errors: error.errors
    };
  }
};

/**
 * Masa alanı sil
 * @param {number} id - Alan ID
 * @returns {Promise<Object>}
 */
export const deleteTableArea = async (id) => {
  try {
    const response = await apiClient.delete(`/table/area/${id}`);
    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Masa alanı silinemedi',
      errors: error.errors
    };
  }
};

