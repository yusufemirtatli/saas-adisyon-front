import { useState } from 'react';
import Layout from '../components/Layout';

const Team = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Sample data
  const stats = {
    total: 24,
    active: 12,
    pendingLeave: 3,
    openRoles: 5
  };

  const filters = [
    { id: 'all', label: 'Tümü' },
    { id: 'managers', label: 'Yöneticiler' },
    { id: 'waiters', label: 'Garsonlar' },
    { id: 'kitchen', label: 'Mutfak Ekibi' },
    { id: 'cashiers', label: 'Kasiyerler' }
  ];

  const teamMembers = [
    {
      id: 1,
      name: 'Ahmet Yılmaz',
      initials: 'AY',
      phone: '0532 123 45 67',
      email: 'ahmet@adisyon.com',
      role: 'Yönetici',
      roleColor: 'blue'
    },
    {
      id: 2,
      name: 'Ayşe Demir',
      initials: 'AD',
      phone: '0533 987 65 43',
      email: 'ayse@adisyon.com',
      role: 'Garson',
      roleColor: 'emerald'
    },
    {
      id: 3,
      name: 'Mehmet Kaya',
      initials: 'MK',
      phone: '0544 555 44 33',
      email: 'mehmet@adisyon.com',
      role: 'Aşçı',
      roleColor: 'amber'
    },
    {
      id: 4,
      name: 'Zeynep Çelik',
      initials: 'ZÇ',
      phone: '0555 222 11 00',
      email: 'zeynep@adisyon.com',
      role: 'Kasiyer',
      roleColor: 'purple'
    },
    {
      id: 5,
      name: 'Fatma Aras',
      initials: 'FA',
      phone: '0536 444 22 11',
      email: 'fatma@adisyon.com',
      role: 'Garson',
      roleColor: 'emerald'
    }
  ];

  const getRoleColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
      amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
    };
    return colors[color] || colors.blue;
  };

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#1a2632] p-4 rounded-xl border border-[#e7edf3] dark:border-slate-800 shadow-sm">
            <p className="text-[#4c739a] text-xs font-semibold uppercase tracking-wider">Toplam Personel</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-[#1a2632] p-4 rounded-xl border border-[#e7edf3] dark:border-slate-800 shadow-sm">
            <p className="text-[#4c739a] text-xs font-semibold uppercase tracking-wider">Aktif Görevde</p>
            <p className="text-2xl font-black text-emerald-500 mt-1">{stats.active}</p>
          </div>
          <div className="bg-white dark:bg-[#1a2632] p-4 rounded-xl border border-[#e7edf3] dark:border-slate-800 shadow-sm">
            <p className="text-[#4c739a] text-xs font-semibold uppercase tracking-wider">Bekleyen İzin</p>
            <p className="text-2xl font-black text-amber-500 mt-1">{stats.pendingLeave}</p>
          </div>
          <div className="bg-white dark:bg-[#1a2632] p-4 rounded-xl border border-[#e7edf3] dark:border-slate-800 shadow-sm">
            <p className="text-[#4c739a] text-xs font-semibold uppercase tracking-wider">Açık Roller</p>
            <p className="text-2xl font-black text-primary mt-1">{stats.openRoles}</p>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 bg-white dark:bg-[#1a2632] p-1 rounded-xl border border-[#e7edf3] dark:border-slate-800 w-full lg:w-fit overflow-x-auto">
            {filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-6 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                  selectedFilter === filter.id
                    ? 'bg-primary text-white'
                    : 'text-[#4c739a] hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <button className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-1 lg:flex-initial justify-center">
              <span className="material-symbols-outlined text-base">admin_panel_settings</span>
              Rol Yönetimi
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm flex-1 lg:flex-initial justify-center">
              <span className="material-symbols-outlined text-base">person_add</span>
              Yeni Personel Ekle
            </button>
          </div>
        </div>

        {/* Team Table */}
        <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e7edf3] dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-[#e7edf3] dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold text-[#4c739a] uppercase tracking-wider">Ad Soyad</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#4c739a] uppercase tracking-wider">Telefon</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#4c739a] uppercase tracking-wider">E-posta</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#4c739a] uppercase tracking-wider">Atanan Rol</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#4c739a] uppercase tracking-wider text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {teamMembers.map(member => (
                  <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                          {member.initials}
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#4c739a]">{member.phone}</td>
                    <td className="px-6 py-4 text-sm text-[#4c739a]">{member.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wider ${getRoleColorClasses(member.roleColor)}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="Düzenle">
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-red-500 transition-colors" title="Sil">
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-[#e7edf3] dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#4c739a]">Toplam {stats.total} personelden 1-5 arası gösteriliyor</p>
            <div className="flex items-center gap-1">
              <button 
                className="p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button 
                className={`px-3 py-1 text-sm font-bold rounded ${
                  currentPage === 1 
                    ? 'bg-primary text-white' 
                    : 'text-[#4c739a] hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                onClick={() => setCurrentPage(1)}
              >
                1
              </button>
              <button 
                className={`px-3 py-1 text-sm font-bold rounded ${
                  currentPage === 2 
                    ? 'bg-primary text-white' 
                    : 'text-[#4c739a] hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                onClick={() => setCurrentPage(2)}
              >
                2
              </button>
              <button 
                className={`px-3 py-1 text-sm font-bold rounded ${
                  currentPage === 3 
                    ? 'bg-primary text-white' 
                    : 'text-[#4c739a] hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                onClick={() => setCurrentPage(3)}
              >
                3
              </button>
              <button 
                className="p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Team;
