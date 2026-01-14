/**
 * Image Helper
 * Backend'den gelen görselleri tam URL'e çevirmek için yardımcı fonksiyonlar
 */

// Backend storage base URL
const STORAGE_BASE_URL = 'http://127.0.0.1:8000/storage';

// Default placeholder image
const DEFAULT_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBa2kYqZWwkzyIDnMadWdrv2PH66SpKeDJFkdYHFB9IE6fYmh3bgEvnD2sHXPtQa1ubiCEAS6uMor-HcE61thUFbS7tB8DcjiYjHrtp5Rj1Y2YO764TuqUKpwovgNJY792cKiXW8pTP8EPwt3TxS_sBbOE4UNmhgF8BkSqIjlMjs1LAdaZqki3RS1JdcNlaQDXwE7SEOoti1PGDEzCvktwiQea2m0Mer9o5tFh8RRCqOrHylyuZx4ro8AiQSRhuFW-b5p_zLyIBXI';

/**
 * Backend'den gelen görsel path'ini tam URL'e çevirir
 * @param {string|null} imagePath - Backend'den gelen görsel path'i (örn: "products/123.jpg")
 * @returns {string} - Tam görsel URL'i veya default placeholder
 */
export const getImageUrl = (imagePath) => {
  // Eğer görsel yoksa default image döndür
  if (!imagePath) {
    return DEFAULT_IMAGE;
  }

  // Eğer zaten tam URL ise (http/https ile başlıyorsa) olduğu gibi döndür
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Backend'den gelen relative path'i tam URL'e çevir
  return `${STORAGE_BASE_URL}/${imagePath}`;
};

/**
 * Birden fazla ürün için görsel URL'lerini düzeltir
 * @param {Array} products - Ürünler dizisi
 * @returns {Array} - Görsel URL'leri düzeltilmiş ürünler dizisi
 */
export const formatProductImages = (products) => {
  return products.map(product => ({
    ...product,
    image: getImageUrl(product.image)
  }));
};
