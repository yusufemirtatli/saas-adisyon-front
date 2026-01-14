import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import { getProducts, getProductCategories, deleteProduct } from '../api/products';
import AddProductToMenuModal from '../components/AddProductToMenuModal';
import EditProductModal from '../components/EditProductModal';
import AddCategoryModal from '../components/AddCategoryModal';
import ConfirmModal from '../components/ConfirmModal';
import { getImageUrl } from '../utils/imageHelper';

const Menu = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Her sayfada 5 ürün

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const [productsResult, categoriesResult] = await Promise.all([
        getProducts(),
        getProductCategories()
      ]);

      if (productsResult.success) {
        const formattedProducts = productsResult.data.map(product => ({
          id: product.id,
          name: product.name,
          price: parseFloat(product.price),
          category_id: parseInt(product.category_id),
          image: getImageUrl(product.image),
          description: product.description,
          status: product.status
        }));
        setProducts(formattedProducts);
      }

      if (categoriesResult.success) {
        setCategories(categoriesResult.data);
      }

      if (!productsResult.success || !categoriesResult.success) {
        setError('Veriler yüklenirken bir hata oluştu');
      }
    } catch (err) {
      setError('Bir hata oluştu');
      console.error('Menu fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtreleme (önce filtrele)
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination (filtrelenmiş ürünleri sayfalara böl)
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Kategori sayıları
  const getCategoryCount = (categoryId) => {
    if (categoryId === 'all') return products.length;
    return products.filter(p => p.category_id === categoryId).length;
  };

  // Kategori veya arama değiştiğinde sayfa 1'e dön
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowEditProductModal(true);
  };

  const handleDeleteProduct = (product) => {
    setProductToDelete(product);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setLoading(true);
    const result = await deleteProduct(productToDelete.id);
    
    if (result.success) {
      toast.success('Ürün başarıyla silindi!');
      fetchData();
    } else {
      toast.error(result.message || 'Ürün silinemedi');
    }
    setLoading(false);
    setProductToDelete(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-500"></span>
            Aktif
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <span className="size-1.5 rounded-full bg-slate-400"></span>
            Pasif
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <span className="size-1.5 rounded-full bg-slate-400"></span>
            Bilinmiyor
          </span>
        );
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Kategori Yok';
  };

  return (
    <Layout currentPage="menu" headerTitle="Menü ve Ürün Yönetimi">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          className: '',
          style: {
            background: 'var(--toast-bg, #fff)',
            color: 'var(--toast-text, #0d141b)',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          success: {
            iconTheme: {
              primary: '#137fec',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      {/* Main Container with Full Height */}
      <div className="flex flex-col h-full -m-4 md:-m-8">
        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
        {/* Product Table Area */}
        <section className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 overflow-y-auto">
          {/* Search and Action Buttons */}
          <div className="mb-4 md:mb-6 flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-0 md:justify-between">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#4c739a]">
                <span className="material-symbols-outlined text-xl">search</span>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={loading}
                className="block w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={loading ? "Yükleniyor..." : "Ürünlerde ara..."}
              />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button 
                onClick={() => setShowAddCategoryModal(true)}
                disabled={loading}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-[#0d141b] dark:text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-800"
              >
                {loading ? (
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-base">category</span>
                )}
                <span className="hidden sm:inline">Kategori Ekle</span>
                <span className="sm:hidden">Kategori</span>
              </button>
              <button 
                onClick={() => setShowAddProductModal(true)}
                disabled={loading}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
              >
                {loading ? (
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-base">add_circle</span>
                )}
                <span className="hidden sm:inline">Ürün Ekle</span>
                <span className="sm:hidden">Ürün</span>
              </button>
            </div>
          </div>

          {/* Category Filter - All Devices */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                disabled={loading}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary dark:hover:text-primary'
                }`}
              >
                <span>Tümü</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedCategory === 'all'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  {getCategoryCount('all')}
                </span>
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  disabled={loading}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedCategory === category.id
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary dark:hover:text-primary'
                  }`}
                >
                  <span>{category.name}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedCategory === category.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    {getCategoryCount(category.id)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <Loading />
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-[#4c739a]">
                        Görsel
                      </th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-[#4c739a]">
                        Kategori
                      </th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-[#4c739a]">
                        Ürün Adı
                      </th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-[#4c739a]">
                        Açıklama
                      </th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-[#4c739a]">
                        Fiyat
                      </th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-[#4c739a]">
                        Durum
                      </th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-[#4c739a] text-right">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {currentProducts.length > 0 ? (
                      currentProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <div
                              className="size-12 rounded-lg bg-slate-200 dark:bg-slate-800 bg-cover bg-center"
                              style={{ backgroundImage: `url("${product.image}")` }}
                            ></div>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#4c739a]">
                            {getCategoryName(product.category_id)}
                          </td>
                          <td className="px-6 py-4 font-bold text-sm">
                            {product.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                            {product.description || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                            {product.price.toFixed(2)} ₺
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(product.status)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                disabled={loading}
                                className="p-1.5 text-[#4c739a] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                              >
                                <span className="material-symbols-outlined text-lg">edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product)}
                                disabled={loading}
                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                              >
                                <span className="material-symbols-outlined text-lg">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">
                              inventory_2
                            </span>
                            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
                              Ürün bulunamadı
                            </p>
                            <p className="text-slate-400 dark:text-slate-500 text-sm">
                              Farklı bir kategori veya arama terimi deneyin
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4">
                {currentProducts.length > 0 ? (
                  currentProducts.map((product) => (
                    <div 
                      key={product.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm"
                    >
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div
                          className="w-20 h-20 flex-shrink-0 rounded-lg bg-slate-200 dark:bg-slate-800 bg-cover bg-center"
                          style={{ backgroundImage: `url("${product.image}")` }}
                        ></div>
                        
                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                                {product.name}
                              </h3>
                              <p className="text-xs text-[#4c739a] mt-0.5">
                                {getCategoryName(product.category_id)}
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              {getStatusBadge(product.status)}
                            </div>
                          </div>
                          
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                            {product.description || 'Açıklama yok'}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-primary">
                              {product.price.toFixed(2)} ₺
                            </span>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                disabled={loading}
                                className="p-2 text-[#4c739a] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <span className="material-symbols-outlined text-lg">edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product)}
                                disabled={loading}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <span className="material-symbols-outlined text-lg">delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-3">
                      inventory_2
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-medium">
                      Ürün bulunamadı
                    </p>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                      Farklı bir kategori veya arama terimi deneyin
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {filteredProducts.length > 0 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-[#4c739a] text-center sm:text-left">
                    <span className="hidden sm:inline">Toplam {filteredProducts.length} üründen </span>
                    {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)}
                    <span className="hidden sm:inline"> arası gösteriliyor</span>
                    <span className="sm:hidden"> / {filteredProducts.length}</span>
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1 || loading}
                      className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[#4c739a] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-base">chevron_left</span>
                    </button>
                    {/* Desktop: Show all pages */}
                    <div className="hidden sm:flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          disabled={loading}
                          className={`size-8 flex items-center justify-center rounded-lg font-bold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            currentPage === page
                              ? 'bg-primary text-white'
                              : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[#0d141b] dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    {/* Mobile: Show current page only */}
                    <div className="sm:hidden">
                      <span className="px-3 py-1 text-xs font-bold text-slate-900 dark:text-white">
                        {currentPage} / {totalPages}
                      </span>
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages || loading}
                      className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[#4c739a] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-base">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
      </div>

      {/* Modals */}
      <AddProductToMenuModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onSuccess={fetchData}
      />

      <EditProductModal
        isOpen={showEditProductModal}
        onClose={() => {
          setShowEditProductModal(false);
          setSelectedProduct(null);
        }}
        onSuccess={fetchData}
        product={selectedProduct}
      />

      <AddCategoryModal
        isOpen={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        onSuccess={fetchData}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Ürünü Sil"
        message={`"${productToDelete?.name}" ürününü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="Vazgeç"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        icon="danger"
      />
    </Layout>
  );
};

export default Menu;
