import { useMemo } from 'react';
import { getUserData } from '../utils/auth';

const Sidebar = ({ currentPage, isMobileOpen, onClose }) => {
  // localStorage'dan kullanıcı verisini al (useMemo ile cache'le)
  const userData = useMemo(() => getUserData(), []);

  const menuItems = [
    { id: 'dashboard', icon: 'dashboard', label: 'Kontrol Paneli', path: '/' },
    { id: 'tables', icon: 'table_restaurant', label: 'Masalar', path: '/tables' },
    { id: 'kitchen', icon: 'restaurant', label: 'Mutfak', path: '/kitchen' },
    { id: 'menu', icon: 'restaurant_menu', label: 'Menü', path: '/menu' },
    { id: 'team', icon: 'group', label: 'Ekip', path: '/team' },
    { id: 'expense', icon: 'account_balance_wallet', label: 'Giderler', path: '/expense' },
    { id: 'settings', icon: 'settings', label: 'Ayarlar', path: '#' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative
        w-64 h-full
        bg-white dark:bg-[#1a2632] 
        border-r border-[#e7edf3] dark:border-[#2a3845] 
        flex flex-col justify-between
        shrink-0 z-40
        transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:flex
      `}>
      <div className="p-6 flex flex-col h-full">
        {/* Logo ve Başlık */}
        <div className="flex gap-3 items-center mb-8">
          <div 
            className="bg-center bg-no-repeat bg-cover rounded-full h-10 w-10 shrink-0 shadow-sm" 
            style={{
              backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCwS8DAmjLkSnVXfjpL6GBTATcRsVd5S8eeJoddm_9AT7tKMiphr_o1DpUIz1rIzGGBiukQIILUoL1ansG-t5XyyNRgHacJlRPm01pEK1Ug28CJ0m_FlnRBgwpmsoXKBt8cut1tp49X3t-ovPq5GZA8IAmfgmM0lJqiGiSbKHRJ0lcBKTlGR3S6krn_D3-RHAt3ZDfKZeF8fLWD-TJDhnzDgRS2on-itKeMURu4NKMMmTXkD7SzckzTlEHJWqZr1qf1T0TvEaixvEY")'
            }}
          ></div>
          <div className="flex flex-col overflow-hidden">
            <h1 className="text-[#0d141b] dark:text-white text-base font-bold leading-tight truncate">
              {userData?.active_tenant?.name || userData?.tenant?.name || 'Restoran'}
            </h1>
            <p className="text-[#4c739a] dark:text-gray-400 text-xs font-normal leading-normal truncate">
              Yönetici Paneli
            </p>
          </div>
        </div>

        {/* Navigasyon Menüsü */}
        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <a
              key={item.id}
              href={item.path}
              onClick={onClose}
              className={`sidebar-link group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                currentPage === item.id
                  ? 'active bg-primary/10 text-primary'
                  : 'hover:bg-slate-100 dark:hover:bg-[#2a3845] text-[#4c739a] dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className={`text-sm ${currentPage === item.id ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </a>
          ))}
        </nav>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;

