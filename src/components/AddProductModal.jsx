import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getProducts, getProductCategories } from '../api/products';
import { addToShopcart } from '../api/shopcart';
import { getImageUrl } from '../utils/imageHelper';

const AddProductModal = ({ isOpen, onClose, tableId, onSuccess }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]); // [{ product_id, note, product }]
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [productsResult, categoriesResult] = await Promise.all([
        getProducts(),
        getProductCategories()
      ]);

      if (productsResult.success) {
        setProducts(productsResult.data);
      }

      if (categoriesResult.success) {
        setCategories(categoriesResult.data);
      }
    } catch (error) {
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoadingData(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedProducts([]);
      setSearchTerm('');
      setSelectedCategory('all');
      onClose();
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category_id === parseInt(selectedCategory);
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && product.status === 'active';
  });

  const toggleProduct = (product) => {
    const exists = selectedProducts.find(p => p.product_id === product.id);
    if (exists) {
      setSelectedProducts(prev => prev.filter(p => p.product_id !== product.id));
    } else {
      setSelectedProducts(prev => [...prev, { product_id: product.id, note: '', product }]);
    }
  };

  const updateNote = (productId, note) => {
    setSelectedProducts(prev => 
      prev.map(p => p.product_id === productId ? { ...p, note } : p)
    );
  };

  const handleSubmit = async () => {
    if (selectedProducts.length === 0) {
      toast.error('Lütfen en az bir ürün seçin');
      return;
    }

    setLoading(true);
    try {
      const items = selectedProducts.map(p => ({
        product_id: p.product_id,
        note: p.note || undefined
      }));

      const result = await addToShopcart({
        table_id: tableId,
        items
      });

      if (result.success) {
        toast.success('Ürünler başarıyla eklendi!');
        if (onSuccess) {
          onSuccess();
        }
        handleClose();
      } else {
        toast.error(result.message || 'Ürünler eklenemedi');
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
      console.error('Add to shopcart error:', error);
    } finally {
      setLoading(false);
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
        className="bg-white dark:bg-[#1a2632] w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{ animation: 'slideUp 0.3s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#e7edf3] dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold">Ürün Ekle</h3>
              <p className="text-sm text-[#4c739a] mt-1">Sepete eklemek istediğiniz ürünleri seçin</p>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-[#4c739a] hover:text-red-500 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Ürün ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-[#f0f2f5] dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-[#f0f2f5] dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="all">Tüm Kategoriler</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {loadingData ? (
            <div className="flex items-center justify-center py-12">
              <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-[#4c739a]">
              <span className="material-symbols-outlined text-5xl mb-2">search_off</span>
              <p>Ürün bulunamadı</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map(product => {
                const isSelected = selectedProducts.find(p => p.product_id === product.id);
                return (
                  <div
                    key={product.id}
                    onClick={() => toggleProduct(product)}
                    className={`relative cursor-pointer rounded-lg border-2 transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                    }`}
                  >
                    <div className="p-3">
                      {product.image && (
                        <div className="w-full h-32 rounded-lg overflow-hidden mb-2 bg-slate-100 dark:bg-slate-800">
                          <img 
                            src={getImageUrl(product.image)} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <h4 className="font-semibold text-sm mb-1 line-clamp-1">{product.name}</h4>
                      <p className="text-xs text-[#4c739a] mb-2 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-primary">₺{product.price}</span>
                        {isSelected && (
                          <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Products & Notes */}
        {selectedProducts.length > 0 && (
          <div className="p-6 border-t border-[#e7edf3] dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 max-h-48 overflow-y-auto">
            <h4 className="text-sm font-semibold mb-3">Seçili Ürünler ({selectedProducts.length})</h4>
            <div className="space-y-2">
              {selectedProducts.map(item => (
                <div key={item.product_id} className="bg-white dark:bg-[#1a2632] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm flex-1">{item.product.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleProduct(item.product);
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Not ekle (opsiyonel)"
                    value={item.note}
                    onChange={(e) => updateNote(item.product_id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-3 py-1.5 bg-[#f0f2f5] dark:bg-slate-800 border-none rounded text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

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
            type="button"
            onClick={handleSubmit}
            disabled={loading || selectedProducts.length === 0}
            className="flex-1 bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                <span>Ekleniyor...</span>
              </>
            ) : (
              <>
                <span>Sepete Ekle</span>
                {selectedProducts.length > 0 && (
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {selectedProducts.length}
                  </span>
                )}
              </>
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

export default AddProductModal;
