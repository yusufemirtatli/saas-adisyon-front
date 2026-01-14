import { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import { getTableById } from '../api/tables';
import { getUserData } from '../utils/auth';
import { payProductToShopcart, getShopcartById } from '../api/shopcart';

const Payment = () => {
  // URL'den masa ID'sini al
  const pathParts = window.location.pathname.split('/');
  const tableId = parseInt(pathParts[2]);

  const [tableData, setTableData] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Kullanıcı verisi
  const userData = useMemo(() => getUserData(), []);

  // Masa ve sepet verilerini çek
  useEffect(() => {
    fetchPaymentData();
  }, [tableId]);

  const fetchPaymentData = async () => {
    setLoading(true);
    setError('');

    try {
      // Önce table'dan shopcartId'yi öğren
      const tableResult = await getTableById(tableId);
      
      if (!tableResult.success) {
        setError(tableResult.message || 'Masa verileri yüklenemedi');
        setLoading(false);
        return;
      }

      const table = tableResult.data;
      const shopcart = table.active_shopcart_items;
      
      if (!table || !shopcart) {
        setError('Masa bulunamadı veya aktif sepet yok');
        setLoading(false);
        return;
      }

      const shopcartId = shopcart.id;

      // Şimdi shopcart detaylarını çek
      const shopcartResult = await getShopcartById(shopcartId);
      
      if (shopcartResult.success) {
        const shopcart = shopcartResult.data.shopcart;
        const items = shopcartResult.data.items;

        setTableData({
          id: table.id,
          name: table.name,
          waiter: userData?.name || 'Garson',
          duration: Math.floor((Date.now() - new Date(shopcart.created_at).getTime()) / 60000),
          shopcartId: shopcart.id
        });

        // Sepet kalemlerini grupla (aynı product_id olanları birleştir)
        if (items && Array.isArray(items)) {
          const groupedItems = {};
          
          // Önce ödenmemiş ürünleri grupla
          items
            .filter(item => !item.is_paid) // Sadece ödenmemiş olanlar
            .forEach(item => {
              const key = item.product_id;
              
              if (groupedItems[key]) {
                groupedItems[key].maxQuantity += 1;
                groupedItems[key].itemIds.push(item.id);
                // Notları birleştir
                if (item.note && !groupedItems[key].notes.includes(item.note)) {
                  groupedItems[key].notes.push(item.note);
                }
              } else {
                groupedItems[key] = {
                  productId: item.product_id,
                  name: item.product?.name || `Ürün #${item.product_id}`,
                  description: item.product?.description || '',
                  maxQuantity: 1,
                  selectedQuantity: 0,
                  unitPrice: parseFloat(item.price),
                  image: item.product?.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBa2kYqZWwkzyIDnMadWdrv2PH66SpKeDJFkdYHFB9IE6fYmh3bgEvnD2sHXPtQa1ubiCEAS6uMor-HcE61thUFBs7tB8DcjiYjHrtp5Rj1Y2YO764TuqUKpwovgNJY792cKiXW8pTP8EPwt3TxS_sBbOE4UNmhgF8BkSqIjlMjs1LAdaZqki3RS1JdcNlaQDXwE7SEOoti1PGDEzCvktwiQea2m0Mer9o5tFh8RRCqOrHylyuZx4ro8AiQSRhuFW-b5p_zLyIBXI',
                  itemIds: [item.id], // Backend item ID'lerini sakla
                  notes: item.note ? [item.note] : []
                };
              }
            });

          // Object'i array'e çevir
          const itemsArray = Object.values(groupedItems).map((item) => ({
            ...item,
            id: `product-${item.productId}`, // Frontend için benzersiz ID
            description: item.notes.length > 0 ? item.notes.join(', ') : item.description
          }));

          setOrderItems(itemsArray);
        } else {
          setOrderItems([]);
        }
      } else {
        setError(shopcartResult.message || 'Sepet verileri yüklenemedi');
      }
    } catch (err) {
      setError('Bir hata oluştu');
      console.error('Payment fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Ödeme işlemi
  const handlePayment = async (paymentType) => {
    // Seçili ürün var mı kontrol et
    if (selectedItems.length === 0) {
      alert('Lütfen ödeme yapılacak ürünleri seçin');
      return;
    }

    // Backend item ID'lerini topla
    const itemIdsToCharge = [];
    selectedItems.forEach(item => {
      // Her ürün için seçilen miktara göre item ID'leri ekle
      const itemIds = item.itemIds.slice(0, item.selectedQuantity);
      itemIdsToCharge.push(...itemIds);
    });

    if (itemIdsToCharge.length === 0) {
      alert('Ödeme yapılacak ürün bulunamadı');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const result = await payProductToShopcart(tableData.shopcartId, {
        items: itemIdsToCharge,
        payment_type: paymentType // 'cash' veya 'credit_card'
      });

      if (result.success) {
        setPaymentSuccess(true);

        // Eğer masa kapatıldıysa masalar sayfasına yönlendir
        if (result.data.shopcart?.status === 'closed') {
          window.location.href = '/tables';
        } else {
          // Değilse ödeme sayfasını yenile
          fetchPaymentData();
        }
      } else {
        setError(result.message || 'Ödeme işlemi başarısız');
        alert(result.message || 'Ödeme işlemi başarısız');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Ödeme işlemi sırasında bir hata oluştu');
      alert('Ödeme işlemi sırasında bir hata oluştu');
    } finally {
      setProcessing(false);
    }
  };

  // Miktar artır
  const increaseQuantity = (id) => {
    setOrderItems(orderItems.map(item => {
      if (item.id === id && item.selectedQuantity < item.maxQuantity) {
        return { ...item, selectedQuantity: item.selectedQuantity + 1 };
      }
      return item;
    }));
  };

  // Miktar azalt
  const decreaseQuantity = (id) => {
    setOrderItems(orderItems.map(item => {
      if (item.id === id && item.selectedQuantity > 0) {
        return { ...item, selectedQuantity: item.selectedQuantity - 1 };
      }
      return item;
    }));
  };

  // Tümünü seç/seçimi kaldır (toggle)
  const toggleSelectAll = () => {
    // Tüm ürünler maksimum seçili mi kontrol et
    const allSelected = orderItems.every(item => item.selectedQuantity === item.maxQuantity);
    
    if (allSelected) {
      // Hepsi seçiliyse, hepsini sıfırla
      setOrderItems(orderItems.map(item => ({
        ...item,
        selectedQuantity: 0
      })));
    } else {
      // Değilse, hepsini seç
      setOrderItems(orderItems.map(item => ({
        ...item,
        selectedQuantity: item.maxQuantity
      })));
    }
  };

  // Tek ürünün tamamını seç/seçimi kaldır
  const toggleItemSelection = (id) => {
    setOrderItems(orderItems.map(item => {
      if (item.id === id) {
        // Eğer tam seçiliyse 0 yap, değilse max yap
        const newQuantity = item.selectedQuantity === item.maxQuantity ? 0 : item.maxQuantity;
        return { ...item, selectedQuantity: newQuantity };
      }
      return item;
    }));
  };

  // Hesaplamalar
  const selectedItems = orderItems.filter(item => item.selectedQuantity > 0);
  const total = selectedItems.reduce((sum, item) => sum + (item.selectedQuantity * item.unitPrice), 0);

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
            <p className="text-slate-500 dark:text-slate-400 text-sm">Ödeme bilgileri yükleniyor...</p>
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
                {error || 'Ödeme bilgileri bulunamadı'}
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                Ödeme verileri yüklenirken bir sorun oluştu.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => window.location.href = `/tables/${tableId}`}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Siparişe Dön
                </button>
                <button
                  onClick={fetchPaymentData}
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
    <Layout currentPage="tables" headerTitle={`${tableData.name} - Ödeme`}>
      <div className="flex flex-col md:flex-row h-full overflow-hidden">
        {/* Sol Panel - Sipariş Detayı */}
        <section className="flex-1 flex flex-col min-w-0 bg-surface-light dark:bg-surface-dark relative z-10 max-h-[50vh] md:max-h-none">
          {/* Header */}
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white flex items-center gap-1.5 sm:gap-2">
              <span className="material-symbols-outlined text-primary text-[16px] sm:text-[18px]">list_alt</span>
              Sipariş Detayı
            </h3>
            {orderItems.length > 0 && (
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary text-[10px] sm:text-xs font-semibold hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors active:scale-95"
              >
                <span className="material-symbols-outlined text-[14px] sm:text-[16px]">
                  {orderItems.every(item => item.selectedQuantity === item.maxQuantity) ? 'remove_done' : 'done_all'}
                </span>
                {orderItems.every(item => item.selectedQuantity === item.maxQuantity) ? 'Seçimi Kaldır' : 'Tümünü Seç'}
              </button>
            )}
          </div>

          {/* Sipariş Listesi */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 bg-slate-50 dark:bg-[#162032]">
            {orderItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-6xl mb-4">
                  receipt_long
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-sm text-center">
                  Ödenmemiş ürün bulunmuyor
                </p>
                <button
                  onClick={() => window.location.href = `/tables/${tableId}`}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  Siparişe Dön
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 sm:gap-2">
                {orderItems.map((item) => (
                <div
                  key={item.id}
                  className={`group relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 bg-white dark:bg-surface-dark rounded-lg shadow-sm transition-all ${
                    item.selectedQuantity > 0
                      ? 'border-2 border-primary ring-2 ring-primary/20'
                      : 'border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 w-full sm:w-auto">
                    {/* Checkbox - Tamamını Seç */}
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0 transition-all cursor-pointer"
                        checked={item.selectedQuantity === item.maxQuantity}
                        onChange={() => toggleItemSelection(item.id)}
                      />
                    </div>
                    {/* Ürün Görseli */}
                    <div
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-cover bg-center shrink-0 border border-slate-200 dark:border-slate-700"
                      style={{ backgroundImage: `url("${item.image}")` }}
                    ></div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate">
                        {item.name}
                      </span>
                      <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
                        {item.description}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto mt-2 sm:mt-0 justify-between sm:justify-end">
                    {/* Miktar Kontrolü */}
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-md p-0.5">
                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        disabled={item.selectedQuantity === 0}
                        className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded hover:bg-white dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                      >
                        <span className="material-symbols-outlined text-xs sm:text-sm">remove</span>
                      </button>
                      <span className="min-w-[44px] sm:min-w-[52px] text-center font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {item.selectedQuantity} / {item.maxQuantity}
                      </span>
                      <button
                        onClick={() => increaseQuantity(item.id)}
                        disabled={item.selectedQuantity >= item.maxQuantity}
                        className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded hover:bg-white dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                      >
                        <span className="material-symbols-outlined text-xs sm:text-sm">add</span>
                      </button>
                    </div>
                    {/* Fiyat */}
                    <div className="text-right">
                      <div className="font-bold text-sm sm:text-base text-slate-900 dark:text-white whitespace-nowrap">
                        {(item.selectedQuantity * item.unitPrice).toFixed(2)} ₺
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-500 whitespace-nowrap">
                        {item.unitPrice.toFixed(2)} ₺ / adet
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        </section>

        {/* Sağ Panel - Ödeme İşlemleri */}
        <section className="w-full md:w-[340px] lg:w-[380px] bg-white dark:bg-surface-dark border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 shadow-xl z-20 flex flex-col">
          {/* Header */}
          <div className="flex-none px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white">
              Ödeme İşlemleri
            </h3>
          </div>

          {/* Content */}
          <div className="flex-1 p-2.5 sm:p-3 md:p-4 flex flex-col gap-2.5 sm:gap-3 md:gap-4 overflow-y-auto">
            {/* Ürünler ve Toplam Özeti - Birleştirilmiş */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 sm:p-3 md:p-4 border border-slate-100 dark:border-slate-700 shadow-sm">
              {/* Ürünler Listesi */}
              {selectedItems.length > 0 ? (
                <>
                  <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                    {selectedItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {item.selectedQuantity}x
                          </span>
                          <span className="text-slate-700 dark:text-slate-300 truncate">
                            {item.name}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white ml-2 whitespace-nowrap">
                          {(item.selectedQuantity * item.unitPrice).toFixed(2)} ₺
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Genel Toplam */}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-2.5 sm:pt-3 text-center">
                    <div className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Genel Toplam
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {total.toFixed(2)} <span className="text-lg sm:text-xl text-slate-400 font-bold">₺</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-4xl sm:text-5xl mb-2">
                    shopping_cart
                  </span>
                  <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                    Ödeme için ürün seçin
                  </p>
                </div>
              )}
            </div>

            {/* Ek İşlemler */}
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <button className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 p-2 sm:p-2.5 h-14 sm:h-16 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-700 dark:text-slate-200 shadow-sm group active:scale-95">
                <span className="material-symbols-outlined text-purple-600 text-base sm:text-lg group-hover:scale-110 transition-transform">
                  sticky_note_2
                </span>
                <span className="font-medium text-[10px] sm:text-xs">Veresiye</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 p-2 sm:p-2.5 h-14 sm:h-16 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-700 dark:text-slate-200 shadow-sm group active:scale-95">
                <span className="material-symbols-outlined text-teal-600 text-base sm:text-lg group-hover:scale-110 transition-transform">
                  post_add
                </span>
                <span className="font-medium text-[10px] sm:text-xs">Tutar Ekle</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 p-2 sm:p-2.5 h-14 sm:h-16 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-700 dark:text-slate-200 shadow-sm group active:scale-95">
                <span className="material-symbols-outlined text-orange-500 text-base sm:text-lg group-hover:scale-110 transition-transform">
                  call_split
                </span>
                <span className="font-medium text-[10px] sm:text-xs">Kişiye Böl</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 p-2 sm:p-2.5 h-14 sm:h-16 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-700 dark:text-slate-200 shadow-sm group active:scale-95">
                <span className="material-symbols-outlined text-blue-500 text-base sm:text-lg group-hover:scale-110 transition-transform">
                  pie_chart
                </span>
                <span className="font-medium text-[10px] sm:text-xs">Tutara Böl</span>
              </button>
            </div>


            {/* Ödeme Butonları */}
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <button 
                onClick={() => handlePayment('cash')}
                disabled={selectedItems.length === 0 || processing}
                className="group relative flex flex-col items-center justify-center p-2 sm:p-2.5 h-14 sm:h-16 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-500"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {processing ? (
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-white text-lg sm:text-xl mb-0.5 group-hover:scale-110 transition-transform">
                      payments
                    </span>
                    <span className="text-white font-bold text-xs sm:text-sm tracking-wide leading-none">
                      NAKİT
                    </span>
                  </>
                )}
              </button>
              <button 
                onClick={() => handlePayment('credit_card')}
                disabled={selectedItems.length === 0 || processing}
                className="group relative flex flex-col items-center justify-center p-2 sm:p-2.5 h-14 sm:h-16 rounded-lg bg-primary hover:bg-blue-600 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {processing ? (
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-white text-lg sm:text-xl mb-0.5 group-hover:scale-110 transition-transform">
                      credit_card
                    </span>
                    <span className="text-white font-bold text-xs sm:text-sm tracking-wide leading-none">
                      KART
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Payment;

