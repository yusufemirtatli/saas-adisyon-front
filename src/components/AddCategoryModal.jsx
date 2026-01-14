import { useState } from 'react';
import toast from 'react-hot-toast';
import { createProductCategory } from '../api/products';

const AddCategoryModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const result = await createProductCategory(formData);

      if (result.success) {
        setFormData({ name: '', description: '' });
        toast.success('Kategori başarıyla oluşturuldu!');
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          toast.error(result.message || 'Kategori oluşturulamadı');
        }
      }
    } catch (err) {
      toast.error('Bir hata oluştu');
      console.error('Create category error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ name: '', description: '' });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      style={{ animation: 'fadeIn 0.2s ease-out' }}
      onClick={handleClose}
    >
      <div 
        className="bg-white dark:bg-[#1a2632] w-full max-w-md rounded-xl shadow-2xl overflow-hidden"
        style={{ animation: 'slideUp 0.3s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#e7edf3] dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-bold">Yeni Kategori Ekle</h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-[#4c739a] hover:text-red-500 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Kategori Adı */}
          <div>
            <label className="block text-sm font-medium text-[#4c739a] mb-1">
              Kategori Adı *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Örn: Ana Yemekler, İçecekler"
              className={`w-full px-4 py-2 bg-[#f0f2f5] dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none ${
                errors.name ? 'ring-1 ring-red-500' : ''
              }`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
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
              placeholder="Kategori hakkında kısa bir açıklama yazın..."
              className={`w-full px-4 py-2 bg-[#f0f2f5] dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none resize-none ${
                errors.description ? 'ring-1 ring-red-500' : ''
              }`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description[0]}</p>}
          </div>

          {/* Buttons */}
          <div className="pt-4 flex gap-3">
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
              disabled={loading || !formData.name || !formData.description}
              className="flex-1 bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  <span>Oluşturuluyor...</span>
                </>
              ) : (
                'Kategori Oluştur'
              )}
            </button>
          </div>
        </form>
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

export default AddCategoryModal;
