import { useMemo } from 'react';
import { getUserData } from '../utils/auth';

const Header = ({ title = "Genel Bakış", onMenuClick }) => {
  // localStorage'dan kullanıcı verisini al (useMemo ile cache'le)
  const userData = useMemo(() => getUserData(), []);

  return (
    <header className="h-16 bg-white dark:bg-[#1a2632] border-b border-[#e7edf3] dark:border-[#2a3845] flex items-center justify-between px-6 shrink-0 z-10">
      {/* Sol Taraf */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h2 className="text-lg font-bold text-[#0d141b] dark:text-white hidden sm:block">
          {title}
        </h2>
      </div>

      {/* Arama Kutusu */}
      <div className="flex-1 max-w-lg mx-6 hidden md:block">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-[#4c739a]">search</span>
          </div>
          <input
            className="block w-full pl-10 pr-3 py-2 border-none rounded-lg leading-5 bg-[#f6f7f8] dark:bg-[#23303d] text-[#0d141b] dark:text-white placeholder-[#4c739a] focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow sm:text-sm"
            placeholder="Sipariş, masa veya ürün ara..."
            type="text"
          />
        </div>
      </div>

      {/* Sağ Taraf */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#23303d] text-[#4c739a] transition-colors"
            title="Bildirimler"
          >
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#1a2632]"></span>
          </button>
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#23303d] text-[#4c739a] transition-colors"
            title="Takvim"
          >
            <span className="material-symbols-outlined">calendar_today</span>
          </button>
        </div>

        <div className="h-8 w-[1px] bg-[#e7edf3] dark:bg-[#2a3845]"></div>

        {/* Kullanıcı Profili */}
        <div className="flex items-center gap-3 pl-2 cursor-pointer">
          <div
            className="bg-center bg-no-repeat bg-cover rounded-full h-9 w-9 border-2 border-white dark:border-[#2a3845] shadow-sm"
            style={{
              backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBM0Rp9ox2mN23s_uxW0jAywNNqlYagPisb7CWzdScMO0kHozq6hg4nikVRX6_7GEPBBybyM6alifEmGt99RNCpq3lk3s_1Ug690QV2vzLmiapTsWGZC3t_RKd8BcapDx0LvJRNtHSLOA-s7nxiL89j12l-FtxEyfTZN18ovKc0yIzeztBVAidhMAbnJgXtC0YA5nEnfIX2xXzdAhIjTcBMVJert6OpfmrJFF5u_TmPuxfC7olNW5pRjvs7n5cTOxP-mKkXvAahMbw")'
            }}
          ></div>
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-[#0d141b] dark:text-white">{userData?.name || 'Kullanıcı'}</p>
            <p className="text-xs text-[#4c739a]">Yönetici</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

