import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getProducts, getProductCategories } from '../api/products';
import { addToShopcart } from '../api/shopcart';
import { getImageUrl } from '../utils/imageHelper';

const AddProductModal = ({ isOpen, onClose, tableId, tableName, onSuccess }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]); // [{ product_id, quantity, note, product }]
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

  const addProduct = (product) => {
    const exists = selectedProducts.find(p => p.product_id === product.id);
    if (exists) {
      setSelectedProducts(prev => 
        prev.map(p => p.product_id === product.id ? { ...p, quantity: p.quantity + 1 } : p)
      );
    } else {
      setSelectedProducts(prev => [...prev, { product_id: product.id, quantity: 1, note: '', product }]);
    }
  };

  const decreaseProduct = (product) => {
    const exists = selectedProducts.find(p => p.product_id === product.id);
    if (exists && exists.quantity > 1) {
      setSelectedProducts(prev => 
        prev.map(p => p.product_id === product.id ? { ...p, quantity: p.quantity - 1 } : p)
      );
    } else {
      setSelectedProducts(prev => prev.filter(p => p.product_id !== product.id));
    }
  };

  const removeProduct = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.product_id !== productId));
  };

  const updateNote = (productId, note) => {
    setSelectedProducts(prev => 
      prev.map(p => p.product_id === productId ? { ...p, note } : p)
    );
  };

  const getTotalAmount = () => {
    return selectedProducts.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const getTotalItems = () => {
    return selectedProducts.reduce((total, item) => {
      return total + item.quantity;
    }, 0);
  };

  const handleSubmit = async () => {
    if (selectedProducts.length === 0) {
      toast.error('Lütfen en az bir ürün seçin');
      return;
    }

    setLoading(true);
    try {
      const items = selectedProducts.flatMap(p => {
        // Her bir quantity için ayrı item oluştur
        return Array(p.quantity).fill(null).map(() => ({
          product_id: p.product_id,
          note: p.note || undefined
        }));
      });

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

  const totalAmount = getTotalAmount();
  const totalItems = getTotalItems();

  return (
    <div 
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      style={{ animation: 'fadeIn 0.2s ease-out' }}
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-[1200px] h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden"
        style={{ animation: 'slideUp 0.3s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="flex-none bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10">
          {/* Title & Close */}
          <div className="px-4 py-3 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                {tableName || `Masa ${tableId}`} - Ürün Ekle
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                Sipariş oluşturmak için listeden ürün seçin
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="px-4 pb-3 flex flex-col gap-3">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <span className="material-symbols-outlined text-[18px]">search</span>
              </div>
              <input
                type="text"
                placeholder="Ürün adı veya kodu ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-100 dark:bg-slate-800 border-none text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
              />
            </div>

            {/* Chips / Categories */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide items-center -mx-4 px-4">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 h-8 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Tümü
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id.toString())}
                  className={`px-3 h-8 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category.id.toString()
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-4">
          {loadingData ? (
            <div className="flex items-center justify-center py-8">
              <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined text-5xl mb-2">search_off</span>
              <p className="text-sm font-medium">Ürün bulunamadı</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filteredProducts.map(product => {
                const selectedItem = selectedProducts.find(p => p.product_id === product.id);
                const isSelected = !!selectedItem;
                
                return (
                  <div
                    key={product.id}
                    className={`group relative flex flex-col bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                      isSelected 
                        ? 'border-2 border-primary' 
                        : 'border border-transparent hover:border-primary/50'
                    }`}
                  >
                    {/* Quantity Badge */}
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 z-10">
                        <span className="w-5 h-5 flex items-center justify-center bg-primary text-white rounded-full text-[10px] font-bold">
                          {selectedItem.quantity}
                        </span>
                      </div>
                    )}

                    {/* Product Image */}
                    <div 
                      className="h-24 w-full bg-cover bg-center"
                      style={{ 
                        backgroundImage: product.image 
                          ? `url(${getImageUrl(product.image)})` 
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }}
                    />

                    {/* Product Info */}
                    <div className="p-2 flex flex-col flex-1">
                      <h3 className="text-slate-900 dark:text-white font-semibold text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
                        {product.name}
                      </h3>
                      <p className={`font-bold text-xs mt-1 ${isSelected ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}>
                        {parseFloat(product.price).toFixed(2)} ₺
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto p-2 pt-0">
                      {isSelected ? (
                        <div className="flex items-center gap-1">
                          <div className="flex items-center justify-between w-full bg-slate-100 dark:bg-slate-900 rounded-md p-0.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                decreaseProduct(product);
                              }}
                              className="w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">remove</span>
                            </button>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {selectedItem.quantity}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addProduct(product);
                              }}
                              className="w-6 h-6 flex items-center justify-center rounded bg-primary text-white shadow-sm hover:bg-blue-600 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">add</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addProduct(product);
                          }}
                          className="w-full py-1.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-medium text-xs hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-1 group-hover:bg-primary group-hover:text-white"
                        >
                          <span className="material-symbols-outlined text-[16px]">add</span> Ekle
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer / Action Bar */}
        <div className="flex-none bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-3 md:px-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Toplam Tutar ({totalItems} Ürün)
              </span>
              <span className="text-lg font-bold text-primary">
                {totalAmount.toFixed(2)} ₺
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClose}
                disabled={loading}
                className="hidden md:flex h-9 px-4 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                İptal
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || selectedProducts.length === 0}
                className="h-9 px-5 flex items-center justify-center gap-1.5 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-blue-600 shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    <span>Ekleniyor...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                    <span>Sepete Ekle</span>
                  </>
                )}
              </button>
            </div>
          </div>
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
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
    </div>
  );
};

export default AddProductModal;
