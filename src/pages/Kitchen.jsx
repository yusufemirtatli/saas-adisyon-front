import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const Kitchen = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    newOrders: 12,
    inProgress: 5,
    avgWaitTime: '14:20'
  });

  // Sample data
  useEffect(() => {
    setOrders([
      {
        id: 1,
        tableNumber: 5,
        status: 'new',
        time: '04:20',
        isUrgent: false,
        items: [
          { id: 1, name: 'Klasik Burger', note: 'Az pişmiş olsun.' },
          { id: 2, name: 'Klasik Burger', note: 'Çok pişmiş, turşusuz.' },
          { id: 3, name: 'Büyük Boy Patates', note: null }
        ]
      },
      {
        id: 2,
        tableNumber: 12,
        status: 'new',
        time: '08:15',
        isUrgent: true,
        items: [
          { id: 4, name: 'Karışık Pizza', note: null },
          { id: 5, name: 'Ayran', note: null },
          { id: 6, name: 'Ayran', note: null }
        ]
      },
      {
        id: 3,
        tableNumber: 3,
        status: 'new',
        time: '02:45',
        isUrgent: false,
        items: [
          { id: 7, name: 'Adana Kebap', note: null },
          { id: 8, name: 'İskender Kebap', note: null },
          { id: 9, name: 'Şalgam Suyu', note: null }
        ]
      },
      {
        id: 4,
        tableNumber: 8,
        status: 'preparing',
        time: '12:45',
        generalNote: 'Acısı bol olsun.',
        items: [
          { id: 10, name: 'Adana Kebap', note: null },
          { id: 11, name: 'Adana Kebap', note: null },
          { id: 12, name: 'Adana Kebap', note: null },
          { id: 13, name: 'Şalgam Suyu', note: null },
          { id: 14, name: 'Şalgam Suyu', note: null },
          { id: 15, name: 'Şalgam Suyu', note: null }
        ]
      },
      {
        id: 5,
        tableNumber: 7,
        status: 'preparing',
        time: '18:30',
        items: [
          { id: 16, name: 'Lahmacun', note: null },
          { id: 17, name: 'Lahmacun', note: null },
          { id: 18, name: 'Ayran', note: null }
        ]
      },
      {
        id: 6,
        tableNumber: 2,
        status: 'ready',
        time: '02:15',
        completedAgo: true,
        items: [
          { id: 19, name: 'Mercimek Çorbası', note: null },
          { id: 20, name: 'Mercimek Çorbası', note: null },
          { id: 21, name: 'İskender Kebap', note: null }
        ]
      },
      {
        id: 7,
        tableNumber: 15,
        status: 'ready',
        time: '05:30',
        completedAgo: true,
        items: [
          { id: 22, name: 'Tavuk Şiş', note: null },
          { id: 23, name: 'Pilav', note: null }
        ]
      }
    ]);
  }, []);

  const handleStartPreparing = (orderId) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: 'preparing' } : order
    ));
    setStats(prev => ({
      ...prev,
      newOrders: prev.newOrders - 1,
      inProgress: prev.inProgress + 1
    }));
  };

  const handleMarkReady = (orderId) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: 'ready', completedAgo: true, time: '00:00' } : order
    ));
    setStats(prev => ({
      ...prev,
      inProgress: prev.inProgress - 1
    }));
  };

  const handleMarkServed = (orderId) => {
    setOrders(prev => prev.filter(order => order.id !== orderId));
  };

  const handleUndoStatus = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (order.status === 'preparing') {
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: 'new' } : o
      ));
      setStats(prev => ({
        ...prev,
        newOrders: prev.newOrders + 1,
        inProgress: prev.inProgress - 1
      }));
    }
  };

  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status);
  };

  // Tüm bekleyen ürünlerin özeti
  const getPendingProductsSummary = () => {
    const summary = {};
    orders.forEach(order => {
      if (order.status !== 'ready') {
        order.items.forEach(item => {
          if (summary[item.name]) {
            summary[item.name]++;
          } else {
            summary[item.name] = 1;
          }
        });
      }
    });
    return Object.entries(summary).sort((a, b) => b[1] - a[1]);
  };

  const totalPendingProducts = getPendingProductsSummary().reduce((sum, [, count]) => sum + count, 0);

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Stats Cards */}
          <div className="px-6 py-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-1 min-w-[140px] flex-col gap-1 rounded-xl p-3 border border-[#e7edf3] dark:border-slate-800 bg-white dark:bg-[#1a2632]">
                <div className="flex items-center gap-2 text-[#4c739a]">
                  <span className="material-symbols-outlined text-lg">pending_actions</span>
                  <p className="text-xs font-medium uppercase tracking-wider">Yeni Sipariş</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-slate-900 dark:text-white text-xl font-bold">{stats.newOrders}</p>
                  <p className="text-emerald-600 text-[10px] font-bold">+2</p>
                </div>
              </div>

              <div className="flex flex-1 min-w-[140px] flex-col gap-1 rounded-xl p-3 border border-[#e7edf3] dark:border-slate-800 bg-white dark:bg-[#1a2632]">
                <div className="flex items-center gap-2 text-[#4c739a]">
                  <span className="material-symbols-outlined text-lg">skillet</span>
                  <p className="text-xs font-medium uppercase tracking-wider">Hazırlanıyor</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-slate-900 dark:text-white text-xl font-bold">{stats.inProgress}</p>
                  <p className="text-rose-600 text-[10px] font-bold">-1</p>
                </div>
              </div>

              <div className="flex flex-1 min-w-[140px] flex-col gap-1 rounded-xl p-3 border border-[#e7edf3] dark:border-slate-800 bg-white dark:bg-[#1a2632]">
                <div className="flex items-center gap-2 text-[#4c739a]">
                  <span className="material-symbols-outlined text-lg">timer</span>
                  <p className="text-xs font-medium uppercase tracking-wider">Bekleme Süresi</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-slate-900 dark:text-white text-xl font-bold">{stats.avgWaitTime}</p>
                  <p className="text-slate-400 text-[10px]">dk</p>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Grid */}
          <main className="flex-1 px-6 pb-6 overflow-y-auto">
            <div className="grid grid-cols-3 gap-3 items-start">
              {orders.filter(order => order.status !== 'ready').map(order => (
                <div 
                  key={order.id}
                  className={`rounded-lg p-3 shadow-sm border-l-4 h-fit ${
                    order.status === 'new' 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500' 
                      : 'bg-amber-50 dark:bg-amber-900/20 border-amber-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-white text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      order.isUrgent ? 'bg-rose-600' : 'bg-slate-900 dark:bg-slate-700'
                    }`}>
                      MASA {order.tableNumber}{order.isUrgent ? ' - ACİL' : ''}
                    </span>
                    <div className={`flex items-center gap-0.5 ${
                      order.isUrgent ? 'text-rose-600' : order.status === 'new' ? 'text-rose-500' : 'text-amber-600'
                    }`}>
                      <span className="material-symbols-outlined text-xs">
                        {order.isUrgent ? 'priority_high' : order.status === 'new' ? 'schedule' : 'hourglass_top'}
                      </span>
                      <span className="text-[10px] font-bold">{order.time}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 mb-2">
                    {order.generalNote && (
                      <div className="bg-white/50 dark:bg-slate-700/50 p-1 rounded text-slate-600 dark:text-slate-400 text-[10px] mb-1">
                        <span className="font-bold">NOT:</span> {order.generalNote}
                      </div>
                    )}
                    {order.items.map((item, index) => (
                      <div key={item.id} className={index > 0 ? 'pt-1.5 border-t border-slate-200 dark:border-slate-700' : ''}>
                        <div className="flex justify-between items-center">
                          <p className="text-slate-900 dark:text-white font-semibold text-xs">{item.name}</p>
                          <span className="text-[9px] text-slate-400">#{index + 1}</span>
                        </div>
                        {item.note && (
                          <div className="bg-white/60 dark:bg-slate-800/50 p-1 rounded text-slate-700 dark:text-slate-400 text-[10px] italic mt-0.5">
                            Not: {item.note}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {order.status === 'new' ? (
                    <button 
                      onClick={() => handleStartPreparing(order.id)}
                      className="w-full py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg font-bold text-[11px] transition-colors flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">play_arrow</span>
                      Hazırlamaya Başla
                    </button>
                  ) : (
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => handleMarkReady(order.id)}
                        className="flex-1 py-1.5 bg-emerald-500 text-white rounded-lg font-bold text-[11px] transition-colors hover:bg-emerald-600 flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">check</span>
                        Hazırlandı
                      </button>
                      <button 
                        onClick={() => handleUndoStatus(order.id)}
                        className="w-8 h-8 flex items-center justify-center bg-white/60 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">undo</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </main>
        </div>

        {/* Right Sidebar - Summary */}
        <aside className="w-64 bg-white dark:bg-[#1a2632] border-l border-[#e7edf3] dark:border-slate-800 flex flex-col">
          <div className="p-4 border-b border-[#e7edf3] dark:border-slate-800">
            <h3 className="text-slate-900 dark:text-white font-bold text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">assessment</span>
              Toplam Bekleyen
            </h3>
            <p className="text-[#4c739a] text-[10px] mt-1">Tüm aktif siparişler</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 custom-scrollbar">
            {getPendingProductsSummary().map(([productName, count]) => (
              <div 
                key={productName}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
              >
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs">
                    {count}
                  </span>
                  <span className="text-slate-700 dark:text-slate-200 font-medium text-xs">{productName}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-[#e7edf3] dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <div className="flex justify-between items-center text-[10px] font-bold text-[#4c739a] uppercase">
              <span>Toplam</span>
              <span className="text-primary text-sm">{totalPendingProducts}</span>
            </div>
          </div>
        </aside>
      </div>

      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 10px;
          }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #334155;
          }
        `}
      </style>
    </Layout>
  );
};

export default Kitchen;
