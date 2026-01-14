/**
 * Products API
 * Ürün yönetimi ile ilgili API çağrıları
 */

import apiClient from './client';

/**
 * Tüm ürünleri getir
 * @returns {Promise<Object>} - { products: Array }
 */
export const getProducts = async () => {
  try {
    const response = await apiClient.get('/product');
    const data = response.data;
    
    // API response formatını handle et
    let products;
    if (data.data && Array.isArray(data.data)) {
      // Laravel pagination formatı (tüm ürünler için data.data)
      products = data.data;
    } else if (data.products && Array.isArray(data.products)) {
      // products key ile gelen format
      products = data.products;
    } else if (Array.isArray(data)) {
      // Direkt array
      products = data;
    } else {
      // Fallback: boş array
      products = [];
    }
    
    return {
      success: true,
      data: products
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Ürünler getirilemedi',
      errors: error.errors
    };
  }
};

/**
 * Tek bir ürünü getir
 * @param {number} id - Ürün ID
 * @returns {Promise<Object>} - { product: Object }
 */
export const getProduct = async (id) => {
  try {
    const response = await apiClient.get(`/product/${id}`);
    return {
      success: true,
      data: response.data.product || response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Ürün getirilemedi',
      errors: error.errors
    };
  }
};

/**
 * Tüm ürün kategorilerini getir
 * @returns {Promise<Object>} - { productCategories: Array }
 */
export const getProductCategories = async () => {
  try {
    const response = await apiClient.get('/product/category');
    return {
      success: true,
      data: response.data.productCategories || response.data
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
 * Yeni ürün oluştur
 * @param {FormData} formData - Ürün bilgileri (name, description, category_id, price, image, status)
 * @returns {Promise<Object>} - { product: Object }
 */
export const createProduct = async (formData) => {
  try {
    const response = await apiClient.post('/product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return {
      success: true,
      data: response.data.product,
      message: response.data.message || 'Ürün başarıyla oluşturuldu'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Ürün oluşturulamadı',
      errors: error.errors
    };
  }
};

/**
 * Ürün güncelle
 * @param {number} id - Ürün ID
 * @param {FormData} formData - Güncellenecek ürün bilgileri
 * @returns {Promise<Object>} - { product: Object }
 */
export const updateProduct = async (id, formData) => {
  try {
    const response = await apiClient.post(`/product/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return {
      success: true,
      data: response.data.product,
      message: response.data.message || 'Ürün başarıyla güncellendi'
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
 * Ürün sil
 * @param {number} id - Ürün ID
 * @returns {Promise<Object>}
 */
export const deleteProduct = async (id) => {
  try {
    const response = await apiClient.delete(`/product/${id}`);
    return {
      success: true,
      message: response.data.message || 'Ürün başarıyla silindi'
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
 * Yeni kategori oluştur
 * @param {Object} data - Kategori bilgileri (name, description)
 * @returns {Promise<Object>} - { productCategory: Object }
 */
export const createProductCategory = async (data) => {
  try {
    const response = await apiClient.post('/product/category', data);
    return {
      success: true,
      data: response.data.productCategory,
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