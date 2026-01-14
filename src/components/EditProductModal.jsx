import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { updateProduct, getProductCategories } from '../api/products';
import { getImageUrl } from '../utils/imageHelper';

const EditProductModal = ({ isOpen, onClose, onSuccess, product }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    price: '',
    status: 'active',
    image: null
  });
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category_id: product.category_id || '',
        price: product.price || '',
        status: product.status || 'active',
        image: null
      });
      
      // Mevcut ürün görseli varsa preview olarak göster
      if (product.image) {
        setImagePreview(getImageUrl(product.image));
      } else {
        setImagePreview(null);
      }
      
      fetchCategories();
    }
  }, [isOpen, product]);

  const fetchCategories = async () => {
    const result = await getProductCategories();
    if (result.success) {
      setCategories(result.data);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Preview oluştur
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // FormData oluştur
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('category_id', formData.category_id);
      submitData.append('price', formData.price);
      submitData.append('status', formData.status);
      submitData.append('_method', 'PUT'); // Laravel için PUT method spoofing
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      const result = await updateProduct(product.id, submitData);

      if (result.success) {
        setFormData({
          name: '',
          description: '',
          category_id: '',
          price: '',
          status: 'active',
          image: null
        });
        setImagePreview(null);
        toast.success('Ürün başarıyla güncellendi!');
        
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          toast.error(result.message || 'Ürün güncellenemedi');
        }
      }
    } catch (err) {
      toast.error('Bir hata oluştu');
      console.error('Update product error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        description: '',
        category_id: '',
        price: '',
        status: 'active',
        image: null
      });
      setImagePreview(null);
      setErrors({});
      onClose();
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      style={{ animation: 'fadeIn 0.2s ease-out' }}
      onClick={handleClose}
    >
      <div 
        className="bg-white dark:bg-[#1a2632] w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{ animation: 'slideUp 0.3s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#e7edf3] dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Ürün Düzenle</h3>
            <p className="text-sm text-[#4c739a] mt-1">Ürün bilgilerini güncelleyin</p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-[#4c739a] hover:text-red-500 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Ürün Görseli */}
            <div>
              <label className="block text-sm font-medium text-[#4c739a] mb-2">
                Ürün Görseli
              </label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, image: null }));
                        setImagePreview(null);
                      }}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-slate-800">
                    <span className="material-symbols-outlined text-slate-400 text-3xl">image</span>
                  </div>
                )}
                <label className="flex-1 cursor-pointer">
                  <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-center">
                    {imagePreview ? 'Görseli Değiştir' : 'Görsel Seç'}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-[#4c739a] mt-2">
                JPG, PNG veya GIF formatında, maksimum 4MB
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Ürün Adı */}
              <div>
                <label className="block text-sm font-medium text-[#4c739a] mb-1">
                  Ürün Adı *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Örn: Dana Bonfile Izgara"
                  className={`w-full px-4 py-2 bg-[#f0f2f5] dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none ${
                    errors.name ? 'ring-1 ring-red-500' : ''
                  }`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-sm font-medium text-[#4c739a] mb-1">
                  Kategori *
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 bg-[#f0f2f5] dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none ${
                    errors.category_id ? 'ring-1 ring-red-500' : ''
                  }`}
                >
                  <option value="">Kategori Seçin</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id[0]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Fiyat */}
              <div>
                <label className="block text-sm font-medium text-[#4c739a] mb-1">
                  Fiyat (₺) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={`w-full px-4 py-2 bg-[#f0f2f5] dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none ${
                    errors.price ? 'ring-1 ring-red-500' : ''
                  }`}
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price[0]}</p>}
              </div>

              {/* Durum */}
              <div>
                <label className="block text-sm font-medium text-[#4c739a] mb-1">
                  Durum *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-[#f0f2f5] dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                </select>
              </div>
            </div>

            {/* Açıklama */}
            <div>
              <label className="block text-sm font-medium text-[#4c739a] mb-1">
                Açıklama *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Ürün hakkında detaylı bilgi..."
                className={`w-full px-4 py-2 bg-[#f0f2f5] dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none resize-none ${
                  errors.description ? 'ring-1 ring-red-500' : ''
                }`}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description[0]}</p>}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#e7edf3] dark:border-slate-800 flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-[#e7edf3] dark:border-slate-700 text-[#4c739a] rounded-lg font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            İptal
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !formData.name || !formData.description || !formData.category_id || !formData.price}
            className="flex-1 bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                <span>Güncelleniyor...</span>
              </>
            ) : (
              'Güncelle'
            )}
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translateY(20px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default EditProductModal;
