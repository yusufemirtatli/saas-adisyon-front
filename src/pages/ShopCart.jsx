import { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import AddProductModal from '../components/AddProductModal';
import { getTableById } from '../api/tables';
import { getUserData } from '../utils/auth';

const ShopCart = () => {
  // URL'den masa ID'sini al
  const pathParts = window.location.pathname.split('/');
  const tableId = parseInt(pathParts[pathParts.length - 1]);

  const [orderFilter, setOrderFilter] = useState('remaining'); // all, remaining, paid
  const [viewMode, setViewMode] = useState('grouped'); // grouped, individual
  const [showAddProductPopup, setShowAddProductPopup] = useState(false);
  const [tableData, setTableData] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Kullanıcı verisi
  const userData = useMemo(() => getUserData(), []);

  // Masa verilerini çek
  useEffect(() => {
    fetchTableData();
  }, [tableId]);

  const fetchTableData = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await getTableById(tableId);
      
      if (result.success) {
        const table = result.data;
        
        if (table) {
          // Backend'den gelen yeni veri yapısı: active_shopcart_items
          const shopcart = table.active_shopcart_items;
          
          setTableData({
            id: table.id,
            name: table.name,
            status: shopcart ? 'occupied' : 'empty',
            area: table.table_area?.name || 'Tanımlanmamış',
            openTime: shopcart?.created_at 
              ? new Date(shopcart.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
              : '--:--',
            duration: shopcart?.created_at 
              ? Math.floor((Date.now() - new Date(shopcart.created_at).getTime()) / 60000)
              : 0,
            waiter: userData?.name || 'Garson',
            shopcartId: shopcart?.id,
            totalAmount: shopcart?.total_amount ? parseFloat(shopcart.total_amount) : 0,
            paidAmount: shopcart?.paid_amount ? parseFloat(shopcart.paid_amount) : 0
          });

          // Sipariş kalemlerini dönüştür
          if (shopcart?.items && Array.isArray(shopcart.items)) {
            // Backend'den gelen item'larda product ilişkisi var
            const items = shopcart.items.map(item => {
              const product = item.product;
              
              return {
                id: item.id,
                productId: item.product_id,
                name: product?.name || `Ürün #${item.product_id}`,
                description: product?.description || '',
                quantity: 1, // Her item 1 adet olarak geldiği için
                price: parseFloat(item.price),
                total: parseFloat(item.price),
                note: item.note || '',
                status: item.kitchen_status || 'waiting',
                isPaid: Boolean(item.is_paid),
                paymentType: item.payment_type,
                image: product?.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBa2kYqZWwkzyIDnMadWdrv2PH66SpKeDJFkdYHFB9IE6fYmh3bgEvnD2sHXPtQa1ubiCEAS6uMor-HcE61thUFbS7tB8DcjiYjHrtp5Rj1Y2YO764TuqUKpwovgNJY792cKiXW8pTP8EPwt3TxS_sBbOE4UNmhgF8BkSqIjlMjs1LAdaZqki3RS1JdcNlaQDXwE7SEOoti1PGDEzCvktwiQea2m0Mer9o5tFh8RRCqOrHylyuZx4ro8AiQSRhuFW-b5p_zLyIBXI',
                createdAt: item.created_at,
                updatedAt: item.updated_at
              };
            });
            setOrderItems(items);
          } else {
            setOrderItems([]);
          }
        } else {
          setError('Masa bulunamadı');
        }
      } else {
        setError(result.message || 'Masa verileri yüklenemedi');
      }
    } catch (err) {
      setError('Bir hata oluştu');
      console.error('ShopCart fetch error:', err);
    } finally {
      setLoading(false);
    }
  };


  // Hesaplamalar
  const totalAmount = orderItems.reduce((sum, item) => sum + item.total, 0);
  const paidAmount = orderItems.filter(item => item.isPaid).reduce((sum, item) => sum + item.total, 0);
  const remainingAmount = totalAmount - paidAmount;

  // Filtrelenmiş siparişler
  const filteredOrders = orderItems.filter(item => {
    if (orderFilter === 'paid') return item.isPaid;
    if (orderFilter === 'remaining') return !item.isPaid;
    return true; // all
  });

  // Görünüm moduna göre siparişleri işle
  const displayOrders = useMemo(() => {
    if (viewMode === 'individual') {
      // Individual modda her ürünü tek tek göster (zaten backend'den tek tek geliyor)
      return filteredOrders;
    } else {
      // Grouped modda aynı productId'ye sahip ürünleri birleştir
      const groupedMap = new Map();
      
      filteredOrders.forEach(item => {
        const key = `${item.productId}-${item.isPaid}`;
        
        if (groupedMap.has(key)) {
          const existing = groupedMap.get(key);
          // Miktarı ve toplamı güncelle
          existing.quantity += 1;
          existing.total += item.price;
          // Not varsa notları birleştir (ama gruplu görünümde göstermeyeceğiz)
          if (item.note && !existing.notes) {
            existing.notes = [item.note];
          } else if (item.note && existing.notes) {
            existing.notes.push(item.note);
          }
          // Orijinal ID'leri sakla
          existing.originalIds.push(item.id);
        } else {
          groupedMap.set(key, {
            ...item,
            quantity: 1,
            total: item.price,
            notes: item.note ? [item.note] : [],
            originalIds: [item.id],
            id: `grouped-${key}` // Gruplu görünüm için benzersiz ID
          });
        }
      });
      
      return Array.from(groupedMap.values());
    }
  }, [filteredOrders, viewMode]);


  // Loading state
  if (loading) {
    return (
      <Layout currentPage="tables" headerTitle="Yükleniyor...">
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Masa bilgileri yükleniyor...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error || !tableData) {
    return (
      <Layout currentPage="tables" headerTitle="Hata">
        <div className="flex items-center justify-center h-screen">
          <div className="max-w-md w-full mx-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
              <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-5xl mb-4">error</span>
              <h3 className="text-lg font-bold text-red-900 dark:text-red-100 mb-2">
                {error || 'Masa bulunamadı'}
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                Masa verileri yüklenirken bir sorun oluştu.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => window.location.href = '/tables'}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Masalara Dön
                </button>
                <button
                  onClick={fetchTableData}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Tekrar Dene
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="tables" headerTitle={`${tableData.name} - Sipariş Detayı`}>
      <section className="flex-1 flex flex-col min-w-0 bg-white dark:bg-background-dark relative z-10 h-full overflow-hidden">
        {/* Compact Header */}
        <div className="px-4 md:px-6 lg:px-8 py-3 border-b border-[#e7edf3] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Left: Table Info */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 w-full sm:w-auto">
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg sm:text-xl font-bold text-[#0d141b] dark:text-white">
                  {tableData.name}
                </h1>
                <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-900/30 px-2 py-0.5 text-xs font-semibold text-red-700 dark:text-red-300 ring-1 ring-inset ring-red-600/10">
                  Dolu
                </span>
              </div>
              
              <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
              
              <div className="flex items-center gap-3 sm:gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  {tableData.openTime} ({tableData.duration} dk)
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">person</span>
                  {tableData.waiter}
                </span>
              </div>
            </div>

            {/* Right: Add Button */}
            <button 
              onClick={() => setShowAddProductPopup(true)}
              className="group flex items-center justify-center gap-1.5 h-9 sm:h-8 px-4 bg-primary hover:bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-500/20 transition-all active:scale-95 w-full sm:w-auto"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span className="font-semibold text-xs">Ürün Ekle</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden bg-slate-50 dark:bg-black/20">
          {/* Filter Tabs */}
          <div className="px-4 md:px-6 lg:px-8 pt-3 md:pt-4 pb-2 md:pb-3 shrink-0">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                {/* Filter Buttons */}
                <div className="flex p-0.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                  <button
                    onClick={() => setOrderFilter('remaining')}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors ${
                      orderFilter === 'remaining'
                        ? 'bg-slate-100 dark:bg-slate-700 text-[#0d141b] dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    Kalan
                  </button>
                  <button
                    onClick={() => setOrderFilter('paid')}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                      orderFilter === 'paid'
                        ? 'bg-slate-100 dark:bg-slate-700 text-[#0d141b] dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    Ödenen
                  </button>
                  <button
                    onClick={() => setOrderFilter('all')}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors ${
                      orderFilter === 'all'
                        ? 'bg-slate-100 dark:bg-slate-700 text-[#0d141b] dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    Hepsi
                  </button>
                </div>

                {/* View Mode Buttons */}
                <div className="flex p-0.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                  <button
                    onClick={() => setViewMode('grouped')}
                    className={`px-2 py-1.5 rounded-md transition-colors ${
                      viewMode === 'grouped'
                        ? 'bg-slate-100 dark:bg-slate-700 text-[#0d141b] dark:text-white shadow-sm'
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                    title="Gruplu Görünüm"
                  >
                    <span className="material-symbols-outlined text-[16px] sm:text-[18px]">grid_view</span>
                  </button>
                  <button
                    onClick={() => setViewMode('individual')}
                    className={`px-2 py-1.5 rounded-md transition-colors ${
                      viewMode === 'individual'
                        ? 'bg-slate-100 dark:bg-slate-700 text-[#0d141b] dark:text-white shadow-sm'
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                    title="Tek Tek Görünüm"
                  >
                    <span className="material-symbols-outlined text-[16px] sm:text-[18px]">view_list</span>
                  </button>
                </div>
              </div>

              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-center sm:text-left">
                Toplam <span className="font-bold text-[#0d141b] dark:text-white">{displayOrders.length}</span> {viewMode === 'individual' ? 'Ürün' : 'Kalem'}
              </div>
            </div>
          </div>

          {/* Table Header - Desktop Only */}
          <div className="hidden md:block px-4 md:px-6 lg:px-8 pb-2 shrink-0">
            <div className="grid grid-cols-12 gap-4 px-4 md:px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-white dark:bg-slate-800 rounded-t-xl border border-[#e7edf3] dark:border-slate-700 shadow-sm">
              <div className="col-span-5 pl-2">Ürün Adı</div>
              <div className="col-span-3 text-center">Birim Fiyat</div>
              <div className="col-span-2 text-center">Adet</div>
              <div className="col-span-2 text-right pr-2">Toplam</div>
            </div>
          </div>

          {/* Orders List */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 pb-4">
            <div className="flex flex-col bg-white dark:bg-slate-900 md:rounded-b-xl rounded-xl shadow-sm border border-[#e7edf3] dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
              {displayOrders.length > 0 ? (
                displayOrders.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 px-4 md:px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Mobile Layout */}
                      <div className="flex md:hidden items-center gap-3 w-full">
                        <div
                          className="size-16 rounded-lg bg-cover bg-center shrink-0 border border-slate-200 dark:border-slate-700"
                          style={{ backgroundImage: `url("${item.image}")` }}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-[#0d141b] dark:text-white font-semibold text-sm truncate">
                                {item.name}
                              </h3>
                              {item.note && viewMode === 'individual' && (
                                <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                                  <span className="material-symbols-outlined text-[12px] text-amber-500">edit_note</span>
                                  {item.note}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center justify-center min-w-[32px] h-8 rounded-lg bg-slate-100 dark:bg-slate-800 px-2 text-sm font-bold text-[#0d141b] dark:text-white">
                              {item.quantity}
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              ₺{item.price.toFixed(2)}
                            </span>
                            <span className="text-[#0d141b] dark:text-white font-bold text-base">
                              ₺{item.total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden md:contents">
                        {/* Ürün Adı ve Resim */}
                        <div className="col-span-5 flex items-center gap-4 pl-2">
                          <div
                            className="size-14 rounded-lg bg-cover bg-center shrink-0 border border-slate-200 dark:border-slate-700"
                            style={{ backgroundImage: `url("${item.image}")` }}
                          ></div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[#0d141b] dark:text-white font-semibold text-sm truncate">
                              {item.name}
                            </span>
                            {item.note && viewMode === 'individual' && (
                              <span className="text-slate-400 text-xs flex items-center gap-1 mt-0.5 truncate">
                                <span className="material-symbols-outlined text-[12px] text-amber-500">
                                  edit_note
                                </span>
                                {item.note}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Birim Fiyat */}
                        <div className="col-span-3 flex items-center justify-center">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            ₺{item.price.toFixed(2)}
                          </span>
                        </div>

                        {/* Adet */}
                        <div className="col-span-2 flex items-center justify-center">
                          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-bold text-[#0d141b] dark:text-white">
                            {item.quantity}
                          </div>
                        </div>

                        {/* Toplam */}
                        <div className="col-span-2 text-right pr-2">
                          <span className="text-[#0d141b] dark:text-white font-bold text-base">
                            ₺{item.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-6 py-12 text-center">
                  <span className="material-symbols-outlined text-[#4c739a] text-5xl mb-2">
                    receipt_long
                  </span>
                  <p className="text-[#4c739a] dark:text-slate-400 text-sm">
                    Bu filtrede sipariş bulunmuyor
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer - Summary & Actions */}
        <div className="shrink-0 bg-white dark:bg-slate-900 border-t border-[#e7edf3] dark:border-slate-800 px-4 md:px-6 lg:px-8 py-3 md:py-4 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">
                  Kalan
                </span>
                <span className="text-lg sm:text-xl font-black text-red-600 dark:text-red-400 tracking-tight">
                  ₺{remainingAmount.toFixed(2)}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">
                  Toplam
                </span>
                <span className="text-base sm:text-lg font-bold text-[#0d141b] dark:text-white">
                  ₺{totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">
                  Ödenen
                </span>
                <span className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
                  ₺{paidAmount.toFixed(2)}
                </span>
              </div>
            </div>
            <button 
              onClick={() => window.location.href = `/tables/${tableId}/payment`}
              className="flex items-center justify-center gap-2 h-11 sm:h-10 px-6 sm:px-8 bg-[#0d141b] dark:bg-white text-white dark:text-[#0d141b] hover:bg-slate-800 dark:hover:bg-slate-200 rounded-lg font-bold shadow-lg transition-colors text-sm sm:text-base"
            >
              <span className="material-symbols-outlined text-[20px]">payments</span>
              Ödeme Al
            </button>
          </div>
        </div>
      </section>


      {/* Add Product Modal */}
      <AddProductModal 
        isOpen={showAddProductPopup}
        onClose={() => setShowAddProductPopup(false)}
        tableId={tableId}
        tableName={tableData?.name}
        onSuccess={fetchTableData}
      />
    </Layout>
  );
};

export default ShopCart;

