import { useState } from 'react';
import Layout from '../components/Layout';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('7days');

  // Sample Data
  const stats = [
    {
      title: 'Toplam Gelir',
      value: '₺124.500,00',
      change: '+12.5%',
      changeType: 'increase',
      icon: 'payments',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      progress: 75,
      progressColor: 'bg-primary'
    },
    {
      title: 'Toplam Gider',
      value: '₺42.300,00',
      change: '-4.2%',
      changeType: 'decrease',
      icon: 'shopping_cart_checkout',
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600',
      progress: 34,
      progressColor: 'bg-red-600'
    },
    {
      title: 'Kâr/Zarar Oranı',
      value: '%66',
      change: '+2.1%',
      changeType: 'increase',
      icon: 'pie_chart',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600',
      progress: 66,
      progressColor: 'bg-blue-600'
    },
    {
      title: 'Aktif Adisyon Sayısı',
      value: '12',
      change: '+3 yeni',
      changeType: 'neutral',
      icon: 'table_restaurant',
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600',
      progress: 40,
      progressColor: 'bg-amber-500'
    }
  ];

  const topProducts = [
    { name: 'Dana Burger', count: 420, percentage: 90 },
    { name: 'Latte Art', count: 385, percentage: 82 },
    { name: 'Margarita Pizza', count: 310, percentage: 65 },
    { name: 'Tiramisu', count: 190, percentage: 40 },
    { name: 'Türk Çayı', count: 140, percentage: 25 }
  ];

  const todayOrders = [
    { table: 'Bahçe 04', amount: '₺450,00', time: '14:22', payment: 'Nakit', paymentType: 'cash' },
    { table: 'Salon 12', amount: '₺1.240,50', time: '14:15', payment: 'Kart', paymentType: 'card' },
    { table: 'VIP 01', amount: '₺3.100,00', time: '14:05', payment: 'Kart', paymentType: 'card' },
    { table: 'Salon 08', amount: '₺215,00', time: '13:50', payment: 'Nakit', paymentType: 'cash' }
  ];

  const monthlyData = [
    { month: 'Oca', income: 60, expense: 30 },
    { month: 'Şub', income: 75, expense: 35 },
    { month: 'Mar', income: 90, expense: 40, active: true },
    { month: 'Nis', income: 0, expense: 0, future: true },
    { month: 'May', income: 0, expense: 0, future: true }
  ];

  return (
    <Layout currentPage="dashboard" headerTitle="Güncel Dashboard ve Analitik Paneli">
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-[#1a2632] p-3 lg:p-4 rounded-lg border border-[#e7edf3] dark:border-slate-800 shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <div className={`p-1.5 ${stat.iconBg} rounded-lg ${stat.iconColor}`}>
                  <span className="material-symbols-outlined text-lg">{stat.icon}</span>
                </div>
                <span
                  className={`text-[10px] font-bold flex items-center px-1.5 py-0.5 rounded-full ${
                    stat.changeType === 'increase'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : stat.changeType === 'decrease'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <p className="text-[#4c739a] text-xs font-medium">{stat.title}</p>
              <h3 className="text-lg lg:text-xl font-bold mt-0.5">{stat.value}</h3>
              <div className="mt-3 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${stat.progressColor}`} style={{ width: `${stat.progress}%` }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Daily Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1a2632] p-4 rounded-lg border border-[#e7edf3] dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm lg:text-base font-bold">Günlük Adisyon ve Ciro Miktarı</h3>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    <span className="text-xs text-[#4c739a]">Günlük Ciro (₺)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="text-xs text-[#4c739a]">Adisyon Sayısı</span>
                  </div>
                </div>
              </div>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-primary/20 cursor-pointer px-3 py-2"
              >
                <option value="7days">Son 7 Gün</option>
                <option value="30days">Son 30 Gün</option>
              </select>
            </div>
            <div className="flex items-center justify-center h-48 lg:h-64 text-[#4c739a]">
              <div className="text-center">
                <span className="material-symbols-outlined text-4xl opacity-50">insert_chart</span>
                <p className="text-sm mt-2">Grafik Verisi Yükleniyor</p>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white dark:bg-[#1a2632] p-4 rounded-lg border border-[#e7edf3] dark:border-slate-800 shadow-sm">
            <h3 className="text-sm lg:text-base font-bold mb-0.5">En Çok Satanlar</h3>
            <p className="text-xs text-[#4c739a] mb-4">Bu Ayın Top 5 Ürünü</p>
            <div className="space-y-3 lg:space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="truncate mr-2">{product.name}</span>
                    <span className="text-[#4c739a] whitespace-nowrap">{product.count} Adet</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${product.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 pb-10">
          {/* Today's Orders */}
          <div className="bg-white dark:bg-[#1a2632] rounded-lg border border-[#e7edf3] dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="p-3 lg:p-4 border-b border-[#e7edf3] dark:border-slate-800 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <h3 className="text-sm lg:text-base font-bold">Bugünkü Adisyonlar</h3>
              <div className="flex items-center gap-2">
                <button className="text-primary text-xs font-bold hover:underline">Tümünü Gör</button>
                <button className="bg-primary hover:bg-primary/90 text-white px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm whitespace-nowrap">
                  <span className="material-symbols-outlined text-base">event_busy</span>
                  Günü Kapat
                </button>
              </div>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-[#4c739a] text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Masa No</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Tutar</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Zaman</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Ödeme</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-right">Detay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {todayOrders.map((order, index) => (
                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 lg:px-6 py-3 lg:py-4 font-semibold text-sm whitespace-nowrap">{order.table}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 font-medium text-sm whitespace-nowrap">{order.amount}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm text-[#4c739a]">{order.time}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                            order.paymentType === 'cash'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          }`}
                        >
                          {order.payment}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                        <button className="material-symbols-outlined text-[#4c739a] hover:text-primary transition-colors text-xl">
                          visibility
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Comparison */}
          <div className="bg-white dark:bg-[#1a2632] p-4 rounded-lg border border-[#e7edf3] dark:border-slate-800 shadow-sm flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h3 className="text-sm lg:text-base font-bold">Aylık Karşılaştırma</h3>
              <div className="flex gap-3 lg:gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-primary rounded-full"></span>
                  <span className="text-xs text-[#4c739a]">Gelir</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-600 rounded-full"></span>
                  <span className="text-xs text-[#4c739a]">Gider</span>
                </div>
              </div>
            </div>
            <div className="flex-1 flex items-end justify-between gap-2 lg:gap-4 px-2 min-h-[180px] lg:min-h-[200px]">
              {monthlyData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex justify-center items-end gap-1 h-24 lg:h-32">
                    <div
                      className={`w-full max-w-[12px] rounded-t ${
                        data.future ? 'bg-slate-200 dark:bg-slate-700' : 'bg-primary/20'
                      }`}
                      style={{ height: `${data.income}%` }}
                    ></div>
                    <div
                      className={`w-full max-w-[12px] rounded-t ${
                        data.future ? 'bg-slate-200 dark:bg-slate-700' : 'bg-red-600/20'
                      }`}
                      style={{ height: `${data.expense}%` }}
                    ></div>
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      data.active ? 'text-slate-900 dark:text-white' : 'text-[#4c739a]'
                    } ${data.future ? 'opacity-50' : ''}`}
                  >
                    {data.month}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[10px] text-[#4c739a]">Veriler her 5 dakikada bir otomatik olarak güncellenir.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
