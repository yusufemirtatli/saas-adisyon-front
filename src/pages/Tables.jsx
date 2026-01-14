import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import { getTables, createTable, updateTable, deleteTable, getTableAreas, createTableArea } from '../api/tables';

const Tables = () => {
  const [selectedSection, setSelectedSection] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTableForm, setShowTableForm] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [tables, setTables] = useState([]);
  const [tableAreas, setTableAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const hasFetched = useRef(false);

  // API'den verileri çek (sadece bir kez, AbortController ile)
  useEffect(() => {
    const abortController = new AbortController();
    
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchData(abortController.signal);
    }

    // Cleanup function - component unmount olduğunda request'i iptal et
    return () => {
      abortController.abort();
      hasFetched.current = false;
    };
  }, []);

  const fetchData = async (signal) => {
    setLoading(true);
    setError('');
    
    try {
      const [tablesResult, areasResult] = await Promise.all([
        getTables(),
        getTableAreas()
      ]);

      // Request iptal edildiyse state'i güncelleme
      if (signal?.aborted) return;

      if (tablesResult.success) {
        setTables(tablesResult.data);
      } else {
        setError(tablesResult.message);
      }

      if (areasResult.success) {
        setTableAreas(areasResult.data);
      }
    } catch (err) {
      // AbortError'u görmezden gel
      if (err.name === 'AbortError') return;
      
      if (!signal?.aborted) {
        setError('Veriler yüklenirken bir hata oluştu');
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  // Section'ı area name'e çevir ve shopcart bilgilerini ekle
  const getTableWithAreaName = (table) => {
    const area = tableAreas.find(a => a.id === table.table_area_id);
    
    // Masa durumu: shopcart varsa occupied, yoksa empty
    const actualStatus = table.active_shopcart ? 'occupied' : 'empty';
    
    // Açılma süresi (dakika)
    const duration = table.active_shopcart?.created_at 
      ? Math.floor((Date.now() - new Date(table.active_shopcart.created_at).getTime()) / 60000)
      : null;
    
    // Toplam tutar
    const total = table.active_shopcart?.total_amount 
      ? parseFloat(table.active_shopcart.total_amount)
      : 0;
    
    return {
      ...table,
      section: area?.name || 'Tanımlanmamış',
      status: actualStatus,
      time: duration,
      total: total
    };
  };

  // Sections listesini table areas'dan oluştur
  const sections = [
    { id: 'all', label: 'Tümü' },
    ...tableAreas.map(area => ({ id: area.id, label: area.name }))
  ];

  // Masaları area name ile birleştir
  const tablesWithAreaNames = tables.map(getTableWithAreaName);

  // İstatistikler
  const totalTables = tablesWithAreaNames.length;
  const occupiedTables = tablesWithAreaNames.filter(t => t.status === 'occupied').length;
  const activeSections = tableAreas.length;

  // Filtreleme
  const filteredTables = tablesWithAreaNames.filter(table => {
    const matchesSection = selectedSection === 'all' || table.table_area_id === selectedSection;
    const matchesSearch = table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         table.section.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSection && matchesSearch;
  });

  // Yeni masa ekle
  const handleAddNewTable = () => {
    setEditingTable(null);
    setShowTableForm(true);
  };

  // Masa düzenle
  const handleEditTable = (table) => {
    setEditingTable(table);
    setShowTableForm(true);
  };

  // Form kapat
  const handleCloseForm = () => {
    setShowTableForm(false);
    setEditingTable(null);
  };

  // Masa oluştur/güncelle
  const handleSaveTable = async (tableData) => {
    let result;
    
    if (editingTable) {
      // Güncelle
      result = await updateTable(editingTable.id, tableData);
    } else {
      // Yeni oluştur
      result = await createTable(tableData);
    }

    if (result.success) {
      await fetchData(); // Listeyi yenile
      handleCloseForm();
    } else {
      alert(result.message || 'İşlem başarısız oldu');
    }
  };

  // Masa sil
  const handleDeleteTable = async (tableId) => {
    if (!confirm('Bu masayı silmek istediğinizden emin misiniz?')) {
      return;
    }

    const result = await deleteTable(tableId);
    
    if (result.success) {
      await fetchData(); // Listeyi yenile
    } else {
      alert(result.message || 'Masa silinemedi');
    }
  };

  // Yeni alan oluştur
  const handleCreateArea = async (areaName) => {
    const result = await createTableArea({ name: areaName });
    
    if (result.success) {
      await fetchData(); // Listeyi yenile
      setShowAreaModal(false);
      return true;
    } else {
      alert(result.message || 'Alan oluşturulamadı');
      return false;
    }
  };

  return (
    <Layout currentPage="tables" headerTitle="Masa Yönetimi">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-6 pb-20">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-[20px]">error</span>
            <div className="flex-1">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
              <button 
                onClick={fetchData}
                className="text-xs text-red-600 dark:text-red-400 underline mt-1 hover:text-red-700"
              >
                Tekrar dene
              </button>
            </div>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <Loading />
        ) : (
          <>
        {/* Başlık ve Aksiyonlar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-[#0d141b] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">
              Masa Yönetimi
            </h2>
            <p className="text-[#4c739a] text-base font-normal leading-normal">
              Restoran yerleşim planını ve masa durumlarını yönetin.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 text-[#0d141b] dark:text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>qr_code_2</span>
              <span>QR Kodları</span>
            </button>
            <button 
              onClick={handleAddNewTable}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-all shadow-sm shadow-blue-200 dark:shadow-none"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
              <span>Yeni Masa</span>
            </button>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-2 text-[#4c739a]">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>table_restaurant</span>
              <p className="text-sm font-medium">Toplam Masa</p>
            </div>
            <p className="text-[#0d141b] dark:text-white text-2xl font-bold">{totalTables}</p>
          </div>
          <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-2 text-[#4c739a]">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person</span>
              <p className="text-sm font-medium">Dolu Masa</p>
            </div>
            <p className="text-[#0d141b] dark:text-white text-2xl font-bold">{occupiedTables}</p>
          </div>
          <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-2 text-[#4c739a]">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>grid_view</span>
              <p className="text-sm font-medium">Aktif Bölgeler</p>
            </div>
            <p className="text-[#0d141b] dark:text-white text-2xl font-bold">{activeSections}</p>
          </div>
        </div>

        {/* Filtreler ve Arama */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between bg-white dark:bg-[#1a2632] p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm sticky top-0 z-10">
          <div className="flex flex-1 items-center gap-2 overflow-x-auto no-scrollbar py-1 px-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setSelectedSection(section.id)}
                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 transition-colors ${
                  selectedSection === section.id
                    ? 'bg-[#0d141b] dark:bg-white'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <p className={`text-sm font-medium ${
                  selectedSection === section.id
                    ? 'text-white dark:text-[#0d141b]'
                    : 'text-[#0d141b] dark:text-white'
                }`}>
                  {section.label}
                </p>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-2 lg:px-0 w-full lg:w-auto">
            <div className="relative w-full lg:w-64">
              <span 
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a]" 
                style={{ fontSize: '20px' }}
              >
                search
              </span>
              <input
                className="w-full h-10 pl-10 pr-4 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm text-[#0d141b] dark:text-white placeholder:text-[#4c739a] focus:ring-2 focus:ring-primary"
                placeholder="Masa ara..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Masa Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTables.map((table) => (
            <TableCard key={table.id} table={table} onEdit={handleEditTable} />
          ))}
          
          {/* Yeni Masa Ekle Kartı */}
          <button
            onClick={handleAddNewTable}
            className="hidden lg:flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group h-full min-h-[160px]"
          >
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
            </div>
            <h3 className="text-base font-semibold text-[#0d141b] dark:text-white">Yeni Masa Ekle</h3>
          </button>
        </div>
          </>
        )}
      </div>

      {/* Masa Formu - Sağ Sidebar */}
      {showTableForm && (
        <TableFormSidebar 
          table={editingTable} 
          onClose={handleCloseForm}
          onSave={handleSaveTable}
          tableAreas={tableAreas}
          onOpenAreaModal={() => setShowAreaModal(true)}
        />
      )}

      {/* Yeni Alan Oluşturma Modal */}
      {showAreaModal && (
        <CreateAreaModal 
          onClose={() => setShowAreaModal(false)}
          onSave={handleCreateArea}
        />
      )}
    </Layout>
  );
};

// Masa Kartı Componenti
const TableCard = ({ table, onEdit }) => {
  const isEmpty = table.status === 'empty';
  const colorClasses = isEmpty
    ? {
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'border-emerald-200 dark:border-emerald-800 hover:border-emerald-400',
        title: 'text-emerald-950 dark:text-emerald-50',
        subtitle: 'text-emerald-700 dark:text-emerald-300',
        badge: 'bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200',
        borderTop: 'border-emerald-200 dark:border-emerald-800',
        total: 'text-emerald-950 dark:text-white',
        editBtn: 'bg-emerald-100 dark:bg-emerald-800/50 hover:bg-emerald-200 dark:hover:bg-emerald-700 text-emerald-700 dark:text-emerald-300',
      }
    : {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800 hover:border-red-400',
        title: 'text-red-950 dark:text-red-50',
        subtitle: 'text-red-700 dark:text-red-300',
        badge: 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200',
        borderTop: 'border-red-200 dark:border-red-800',
        total: 'text-red-950 dark:text-white',
        time: 'text-red-700 dark:text-red-300',
        editBtn: 'bg-red-100 dark:bg-red-800/50 hover:bg-red-200 dark:hover:bg-red-700 text-red-700 dark:text-red-300',
      };

  const handleCardClick = () => {
    // Masanın sipariş sayfasına git
    window.location.href = `/tables/${table.id}`;
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`group relative ${colorClasses.bg} p-5 rounded-xl border ${colorClasses.border} hover:shadow-md transition-all cursor-pointer h-full min-h-[160px] flex flex-col gap-4`}
    >
      {/* Edit Butonu - Sağ Üst Köşe */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit(table);
        }}
        className={`absolute top-3 right-3 p-1.5 rounded-lg ${colorClasses.editBtn} opacity-0 group-hover:opacity-100 transition-all z-10`}
        title="Masayı Düzenle"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
      </button>

      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <h3 className={`text-xl font-bold ${colorClasses.title}`}>{table.name}</h3>
          <p className={`text-sm ${colorClasses.subtitle} mt-1`}>{table.section} Alanı</p>
        </div>
      </div>
      
      <div className="flex flex-col gap-3 mt-auto">
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses.badge}`}>
            {isEmpty ? 'Boş' : 'Dolu'}
          </span>
          {!isEmpty && table.time && (
            <div className={`flex items-center gap-1 ${colorClasses.time}`}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>schedule</span>
              <span className="text-sm font-bold">{table.time} dk</span>
            </div>
          )}
        </div>
        <div className={`flex items-end justify-between border-t ${colorClasses.borderTop} pt-3`}>
          <span className={`text-sm ${colorClasses.subtitle} font-medium`}>Toplam</span>
          <span className={`text-xl font-black ${colorClasses.total}`}>
            {isEmpty ? '-' : `${table.total.toLocaleString('tr-TR')} ₺`}
          </span>
        </div>
      </div>
    </div>
  );
};

// Masa Form Sidebar Componenti (Yeni Ekleme veya Düzenleme)
const TableFormSidebar = ({ table, onClose, onSave, tableAreas, onOpenAreaModal }) => {
  const isEditing = !!table;
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: table?.name || '',
    table_area_id: table?.table_area_id || (tableAreas[0]?.id || ''),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <div className="fixed top-0 right-0 h-full w-full md:w-[400px] bg-white dark:bg-[#1a2632] shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col z-50 animate-slide-in">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h3 className="text-xl font-bold text-[#0d141b] dark:text-white">
              {isEditing ? 'Masa Düzenle' : 'Yeni Masa'}
            </h3>
            <p className="text-sm text-[#4c739a]">
              {isEditing ? 'Masa bilgilerini güncelleyin.' : 'Masa detaylarını giriniz.'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-[#4c739a] hover:text-red-500 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Masa Adı */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#0d141b] dark:text-slate-200">
              Masa Adı / No
            </label>
            <div className="relative">
              <input
                className="w-full h-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 text-base text-[#0d141b] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                placeholder="Örn: Masa 12"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Bölge */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#0d141b] dark:text-slate-200">
              Bölge
            </label>
            <div className="relative">
              <select
                className="w-full h-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 text-base text-[#0d141b] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                value={formData.table_area_id}
                onChange={(e) => setFormData({ ...formData, table_area_id: parseInt(e.target.value) })}
                required
              >
                {tableAreas.length === 0 ? (
                  <option value="">Henüz bölge eklenmemiş</option>
                ) : (
                  tableAreas.map(area => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))
                )}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#4c739a] pointer-events-none">
                expand_more
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenAreaModal}
              className="text-xs text-primary hover:text-blue-600 flex items-center gap-1 mt-1 font-medium transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add_circle</span>
              Yeni Bölge Oluştur
            </button>
            {tableAreas.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                Masa eklemeden önce en az bir bölge oluşturmanız gerekiyor.
              </p>
            )}
          </div>

        </form>

        {/* Footer Buttons */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1a2632] flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-12 rounded-lg border border-slate-200 dark:border-slate-700 text-[#0d141b] dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Vazgeç
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || tableAreas.length === 0}
            className="flex-1 h-12 rounded-lg bg-primary text-white font-medium hover:bg-blue-600 shadow-lg shadow-blue-200 dark:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{isEditing ? 'Güncelleniyor...' : 'Oluşturuluyor...'}</span>
              </>
            ) : (
              <span>{isEditing ? 'Güncelle' : 'Oluştur'}</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

// Yeni Alan Oluşturma Modal Componenti
const CreateAreaModal = ({ onClose, onSave }) => {
  const [areaName, setAreaName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!areaName.trim()) return;

    setLoading(true);
    const success = await onSave(areaName.trim());
    setLoading(false);

    if (success) {
      setAreaName('');
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-[#1a2632] rounded-xl shadow-2xl z-50 animate-fade-in-up">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#0d141b] dark:text-white">Yeni Bölge Oluştur</h3>
              <p className="text-sm text-[#4c739a] mt-1">Masa bölgesi ekleyin</p>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#0d141b] dark:text-slate-200">
              Bölge Adı
            </label>
            <input
              type="text"
              value={areaName}
              onChange={(e) => setAreaName(e.target.value)}
              className="w-full h-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 text-base text-[#0d141b] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
              placeholder="Örn: Bahçe, Teras, Salon"
              required
              autoFocus
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-11 rounded-lg border border-slate-200 dark:border-slate-700 text-[#0d141b] dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            İptal
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !areaName.trim()}
            className="flex-1 h-11 rounded-lg bg-primary text-white font-medium hover:bg-blue-600 shadow-lg shadow-blue-200 dark:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Oluşturuluyor...</span>
              </>
            ) : (
              <span>Oluştur</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Tables;

