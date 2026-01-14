import apiClient from './client';

/**
 * Get shopcart by ID
 * @param {number} id - Shopcart ID
 * @returns {Promise<{success: boolean, data?: object, message?: string, errors?: object}>}
 */
export const getShopcartById = async (id) => {
  try {
    const response = await apiClient.get(`/shopcart/${id}`);
    // Backend'den { data: { shopcart: {...}, items: [...] } } şeklinde geliyor
    return {
      success: true,
      data: response.data.data || response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Sepet bilgileri getirilemedi',
      errors: error.errors
    };
  }
};

/**
 * Create a new shopcart
 * @param {object} data - Shopcart data
 * @returns {Promise<{success: boolean, data?: object, message?: string, errors?: object}>}
 */
export const createShopcart = async (data) => {
  try {
    const response = await apiClient.post('/shopcart', data);
    return {
      success: true,
      data: response.data.shopcart || response.data,
      message: response.data.message || 'Sepet oluşturuldu'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Sepet oluşturulamadı',
      errors: error.errors
    };
  }
};

/**
 * Add items to shopcart
 * @param {object} data - { table_id: number, items: [{ product_id: number, note?: string }] }
 * @returns {Promise<{success: boolean, data?: object, message?: string, errors?: object}>}
 */
export const addToShopcart = async (data) => {
  try {
    const response = await apiClient.post('/shopcart/add', data);
    return {
      success: true,
      data: response.data,
      message: response.data.message || 'Ürünler sepete eklendi'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Ürünler sepete eklenemedi',
      errors: error.errors
    };
  }
};

/**
 * Add item to shopcart
 * @param {number} shopcartId - Shopcart ID
 * @param {object} data - Item data
 * @returns {Promise<{success: boolean, data?: object, message?: string, errors?: object}>}
 */
export const addShopcartItem = async (shopcartId, data) => {
  try {
    const response = await apiClient.post(`/shopcart/${shopcartId}/items`, data);
    return {
      success: true,
      data: response.data.item || response.data,
      message: response.data.message || 'Ürün eklendi'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Ürün eklenemedi',
      errors: error.errors
    };
  }
};

/**
 * Update shopcart item
 * @param {number} shopcartId - Shopcart ID
 * @param {number} itemId - Item ID
 * @param {object} data - Item data to update
 * @returns {Promise<{success: boolean, data?: object, message?: string, errors?: object}>}
 */
export const updateShopcartItem = async (shopcartId, itemId, data) => {
  try {
    const response = await apiClient.put(`/shopcart/${shopcartId}/items/${itemId}`, data);
    return {
      success: true,
      data: response.data.item || response.data,
      message: response.data.message || 'Ürün güncellendi'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Ürün güncellenemedi',
      errors: error.errors
    };
  }
};

/**
 * Delete shopcart item
 * @param {number} shopcartId - Shopcart ID
 * @param {number} itemId - Item ID
 * @returns {Promise<{success: boolean, message?: string, errors?: object}>}
 */
export const deleteShopcartItem = async (shopcartId, itemId) => {
  try {
    const response = await apiClient.delete(`/shopcart/${shopcartId}/items/${itemId}`);
    return {
      success: true,
      message: response.data.message || 'Ürün silindi'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Ürün silinemedi',
      errors: error.errors
    };
  }
};

/**
 * Pay for selected products in shopcart
 * @param {number} shopcartId - Shopcart ID
 * @param {object} data - Payment data { items: [itemId1, itemId2, ...], payment_type: 'cash' | 'credit_card' }
 * @returns {Promise<{success: boolean, data?: object, message?: string, errors?: object}>}
 */
export const payProductToShopcart = async (shopcartId, data) => {
  try {
    const response = await apiClient.post(`/shopcart/${shopcartId}/pay-product`, data);
    return {
      success: true,
      data: response.data,
      message: response.data.message || 'Ödeme başarılı'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Ödeme işlemi başarısız',
      errors: error.errors
    };
  }
};

/**
 * Close shopcart (complete payment)
 * @param {number} shopcartId - Shopcart ID
 * @param {object} data - Payment data
 * @returns {Promise<{success: boolean, data?: object, message?: string, errors?: object}>}
 */
export const closeShopcart = async (shopcartId, data) => {
  try {
    const response = await apiClient.post(`/shopcart/${shopcartId}/close`, data);
    return {
      success: true,
      data: response.data,
      message: response.data.message || 'Sepet kapatıldı'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Sepet kapatılamadı',
      errors: error.errors
    };
  }
};

