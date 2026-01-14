import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import ConfirmModal from '../components/ConfirmModal';
import {
  getExpenses,
  createExpense,
  deleteExpense,
  getExpenseCategories,
  createExpenseCategory,
  deleteExpenseCategory,
} from '../api/expense';

const Expense = () => {
  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  
  // Şu anki ayı bul ve görünecek ayları hesapla (sadece bir kez, başlangıçta)
  const currentMonthIndex = new Date().getMonth();
  
  // Gösterilecek ayları hesapla (önceki 2 ay + şu an + sonraki 2 ay) - SABİT
  const getInitialVisibleMonths = () => {
    const visibleMonths = [];
    for (let i = -2; i <= 2; i++) {
      let index = currentMonthIndex + i;
      // Dizi sınırlarını kontrol et
      if (index < 0) index = months.length + index;
      if (index >= months.length) index = index - months.length;
      visibleMonths.push(months[index]);
    }
    return visibleMonths;
  };

  const visibleMonths = getInitialVisibleMonths();
  
  const [selectedMonth, setSelectedMonth] = useState(months[currentMonthIndex]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  });
  
  const [expenseForm, setExpenseForm] = useState({
    category_id: '',
    name: '',
    description: '',
    amount: '',
    payment_status: '',
    payment_date: '',
    payment_time: '',
  });

  const [errors, setErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // Veri yükleme
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [expensesResult, categoriesResult] = await Promise.all([
        getExpenses(),
        getExpenseCategories(),
      ]);

      if (expensesResult.success) {
        setExpenses(expensesResult.data);
      }

      if (categoriesResult.success) {
        setCategories(categoriesResult.data);
      }
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // Seçili aya göre giderleri filtrele
  const getFilteredExpenses = () => {
    const selectedMonthIndex = months.indexOf(selectedMonth);
    const currentYear = new Date().getFullYear();
    
    return expenses.filter((expense) => {
      if (!expense.payment_date) return false;
      
      const expenseDate = new Date(expense.payment_date);
      const expenseMonth = expenseDate.getMonth();
      const expenseYear = expenseDate.getFullYear();
      
      // Aynı ay ve yıl kontrolü
      return expenseMonth === selectedMonthIndex && expenseYear === currentYear;
    });
  };

  const filteredExpenses = getFilteredExpenses();

  // Kategori istatistiklerini hesapla (sadece seçili aydaki giderlerle)
  const getCategoryStats = () => {
    const stats = {};
    const totalAmount = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);

    categories.forEach((category) => {
      const categoryExpenses = filteredExpenses.filter((exp) => exp.category_id === category.id);
      const categoryAmount = categoryExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
      const percentage = totalAmount > 0 ? ((categoryAmount / totalAmount) * 100).toFixed(1) : 0;

      stats[category.id] = {
        ...category,
        count: categoryExpenses.length,
        amount: categoryAmount,
        percentage: parseFloat(percentage),
      };
    });

    return Object.values(stats);
  };

  const categoryStats = getCategoryStats();
  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

  // Form handlers - Category
  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setErrors({});

    const result = await createExpenseCategory(categoryForm);

    if (result.success) {
      setCategories([...categories, result.data]);
      setShowCategoryModal(false);
      setCategoryForm({ name: '', description: '' });
      toast.success('Kategori başarıyla oluşturuldu!');
      loadData(); // Reload data
    } else {
      if (result.errors) {
        setErrors(result.errors);
      } else {
        toast.error(result.message || 'Kategori oluşturulamadı');
      }
    }

    setSubmitLoading(false);
  };

  // Form handlers - Expense
  const handleExpenseChange = (e) => {
    const { name, value } = e.target;
    setExpenseForm((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setErrors({});

    const result = await createExpense(expenseForm);

    if (result.success) {
      setExpenses([...expenses, result.data]);
      setShowExpenseModal(false);
      setExpenseForm({
        category_id: '',
        name: '',
        description: '',
        amount: '',
        payment_status: '',
        payment_date: '',
        payment_time: '',
      });
      toast.success('Gider başarıyla eklendi!');
      loadData(); // Reload data
    } else {
      if (result.errors) {
        setErrors(result.errors);
      } else {
        toast.error(result.message || 'Gider eklenemedi');
      }
    }

    setSubmitLoading(false);
  };

  const handleDeleteExpense = (id) => {
    setConfirmAction({
      type: 'expense',
      id,
      title: 'Gideri Sil',
      message: 'Bu gideri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
    });
    setShowConfirmModal(true);
  };

  const handleDeleteCategory = (id) => {
    // Bu kategoriye ait gider var mı kontrol et
    const categoryExpenses = expenses.filter((exp) => exp.category_id === id);
    
    if (categoryExpenses.length > 0) {
      toast.error('Bu kategoriye ait giderler var. Önce giderleri silmelisiniz.');
      return;
    }

    setConfirmAction({
      type: 'category',
      id,
      title: 'Kategoriyi Sil',
      message: 'Bu kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
    });
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!confirmAction) return;

    if (confirmAction.type === 'expense') {
      const result = await deleteExpense(confirmAction.id);
      if (result.success) {
        setExpenses(expenses.filter((exp) => exp.id !== confirmAction.id));
        toast.success('Gider başarıyla silindi!');
        loadData();
      } else {
        toast.error(result.message || 'Gider silinemedi');
      }
    } else if (confirmAction.type === 'category') {
      const result = await deleteExpenseCategory(confirmAction.id);
      if (result.success) {
        setCategories(categories.filter((cat) => cat.id !== confirmAction.id));
        toast.success('Kategori başarıyla silindi!');
        loadData();
      } else {
        toast.error(result.message || 'Kategori silinemedi');
      }
    }

    setConfirmAction(null);
  };

  // Kategori ID'sine göre renk ata
  const getColorForCategory = (categoryId) => {
    const colors = ['orange', 'blue', 'green', 'purple', 'pink', 'teal', 'indigo', 'red'];
    const index = (categoryId - 1) % colors.length;
    return colors[index];
  };

  const colorClasses = {
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      text: 'text-orange-600',
      bar: 'bg-orange-500',
      dot: 'bg-orange-500',
      icon: 'receipt_long',
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-600',
      bar: 'bg-blue-500',
      dot: 'bg-blue-500',
      icon: 'groups',
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-600',
      bar: 'bg-green-500',
      dot: 'bg-green-500',
      icon: 'local_shipping',
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-600',
      bar: 'bg-purple-500',
      dot: 'bg-purple-500',
      icon: 'more_horiz',
    },
    pink: {
      bg: 'bg-pink-100 dark:bg-pink-900/30',
      text: 'text-pink-600',
      bar: 'bg-pink-500',
      dot: 'bg-pink-500',
      icon: 'favorite',
    },
    teal: {
      bg: 'bg-teal-100 dark:bg-teal-900/30',
      text: 'text-teal-600',
      bar: 'bg-teal-500',
      dot: 'bg-teal-500',
      icon: 'water_drop',
    },
    indigo: {
      bg: 'bg-indigo-100 dark:bg-indigo-900/30',
      text: 'text-indigo-600',
      bar: 'bg-indigo-500',
      dot: 'bg-indigo-500',
      icon: 'star',
    },
    red: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-600',
      bar: 'bg-red-500',
      dot: 'bg-red-500',
      icon: 'emergency',
    },
  };

  return (
    <Layout currentPage="expense" title="Gider Yönetimi">
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
      
      {loading ? (
        <Loading />
      ) : (
        <>
      {/* Header Actions & Month Filters */}
      <div className="flex items-center justify-between mb-6 gap-4">
        {/* Month Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {visibleMonths.map((month) => (
            <button
              key={month}
              onClick={() => setSelectedMonth(month)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                selectedMonth === month
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-slate-800 text-[#4c739a] hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {month}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="bg-white dark:bg-slate-800 border border-[#e7edf3] dark:border-slate-700 text-[#4c739a] px-3 py-2 rounded-lg font-medium text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all whitespace-nowrap"
          >
            Yeni Kategori
          </button>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="bg-primary text-white px-3 py-2 rounded-lg font-medium text-xs flex items-center gap-1.5 hover:bg-primary/90 transition-all whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>Yeni Gider</span>
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Summary */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          {/* Category Summary */}
          <div className="p-6 bg-white dark:bg-[#1a2632] border border-[#e7edf3] dark:border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#4c739a] uppercase tracking-wider">
                Aylık Özet ({selectedMonth})
              </h3>
            </div>
            <div className="space-y-4">
              {categoryStats.length === 0 ? (
                <p className="text-center text-[#4c739a] py-8">Henüz kategori bulunmuyor</p>
              ) : (
                categoryStats.map((category) => {
                  const color = getColorForCategory(category.id);
                  return (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-[#e7edf3] dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      <div>
                        <p className="text-sm font-bold">{category.name}</p>
                        <p className="text-xs text-[#4c739a]">{category.count} Kayıt</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-bold">
                            ₺{category.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </p>
                          <p className={`text-[10px] ${colorClasses[color].text} font-bold`}>
                            %{category.percentage}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="opacity-0 group-hover:opacity-100 text-[#4c739a] hover:text-red-500 transition-all"
                          title="Kategoriyi Sil"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="mt-6 pt-6 border-t border-[#e7edf3] dark:border-slate-800 flex justify-between items-center">
              <span className="text-base font-bold">Toplam Gider</span>
              <span className="text-xl font-bold text-primary">
                ₺{totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Distribution Chart */}
          <div className="p-6 bg-white dark:bg-[#1a2632] border border-[#e7edf3] dark:border-slate-800 rounded-xl">
            <h3 className="text-sm font-bold text-[#4c739a] uppercase tracking-wider mb-4">
              Gider Dağılımı
            </h3>
            {categoryStats.length === 0 ? (
              <p className="text-center text-[#4c739a] py-4">Veri yok</p>
            ) : (
              <>
                <div className="h-4 w-full bg-[#f0f2f5] dark:bg-slate-800 rounded-full flex overflow-hidden">
                  {categoryStats.map((category) => {
                    const color = getColorForCategory(category.id);
                    return (
                      <div
                        key={category.id}
                        className={`h-full ${colorClasses[color].bar}`}
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    );
                  })}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {categoryStats.map((category) => {
                    const color = getColorForCategory(category.id);
                    return (
                      <div key={category.id} className="flex items-center gap-2 text-xs text-[#4c739a]">
                        <div className={`size-2 rounded-full ${colorClasses[color].dot}`}></div>
                        {category.name}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column - Expense List */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white dark:bg-[#1a2632] border border-[#e7edf3] dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-[#e7edf3] dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold">Gider Listesi</h3>
              <button className="text-sm font-medium text-primary flex items-center gap-1 hover:underline">
                <span className="material-symbols-outlined text-lg">download</span>
                <span>Raporu İndir</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#f8f9fb] dark:bg-slate-800/50">
                    <th className="px-6 py-4 text-xs font-bold text-[#4c739a] uppercase tracking-wider">
                      İsim
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-[#4c739a] uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-[#4c739a] uppercase tracking-wider">
                      Tutar
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-[#4c739a] uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-[#4c739a] uppercase tracking-wider text-right">
                      İşlem
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7edf3] dark:divide-slate-800">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-[#4c739a]">
                        {selectedMonth} ayında gider kaydı bulunmuyor
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((expense) => {
                      const category = categories.find((cat) => cat.id === expense.category_id);
                      const color = getColorForCategory(expense.category_id);
                      const expenseDate = expense.payment_date
                        ? new Date(expense.payment_date).toLocaleDateString('tr-TR')
                        : '-';

                      return (
                        <tr
                          key={expense.id}
                          className="hover:bg-[#f8f9fb] dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold">{expense.name}</p>
                            <p className="text-xs text-[#4c739a]">{expense.description || '-'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded-md ${colorClasses[color].bg} ${colorClasses[color].text} text-[10px] font-bold uppercase`}
                            >
                              {category?.name || 'Diğer'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold">
                            ₺{parseFloat(expense.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#4c739a]">{expenseDate}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="text-[#4c739a] hover:text-red-500"
                              title="Sil"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <span className="text-xs text-[#4c739a]">{selectedMonth} ayında toplam {filteredExpenses.length} kayıt gösteriliyor</span>
              <div className="flex gap-2">
                <button className="size-8 flex items-center justify-center rounded border border-[#e7edf3] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#4c739a]">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button className="size-8 flex items-center justify-center rounded border border-primary bg-primary text-white text-xs font-bold">
                  1
                </button>
                <button className="size-8 flex items-center justify-center rounded border border-[#e7edf3] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#4c739a] text-xs font-bold">
                  2
                </button>
                <button className="size-8 flex items-center justify-center rounded border border-[#e7edf3] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#4c739a] text-xs font-bold">
                  3
                </button>
                <button className="size-8 flex items-center justify-center rounded border border-[#e7edf3] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#4c739a]">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
          <div className="bg-white dark:bg-[#1a2632] w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-[#e7edf3] dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold">Kategori Yönetimi</h3>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setCategoryForm({ name: '', description: '' });
                  setErrors({});
                }}
                className="text-[#4c739a] hover:text-red-500 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCategorySubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#4c739a] mb-2">
                  Kategori Adı *
                </label>
                <input
                  name="name"
                  value={categoryForm.name}
                  onChange={handleCategoryChange}
                  className={`w-full px-4 py-2 bg-[#f0f2f5] dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none ${
                    errors.name ? 'ring-1 ring-red-500' : ''
                  }`}
                  placeholder="Örn: Pazarlama, Onarım..."
                  type="text"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4c739a] mb-2">Açıklama</label>
                <textarea
                  name="description"
                  value={categoryForm.description}
                  onChange={handleCategoryChange}
                  className="w-full px-4 py-2 bg-[#f0f2f5] dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Kategori açıklaması..."
                  rows="3"
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">{errors.description[0]}</p>
                )}
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setCategoryForm({ name: '', description: '' });
                    setErrors({});
                  }}
                  className="flex-1 px-4 py-2 border border-[#e7edf3] dark:border-slate-700 text-[#4c739a] rounded-lg font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  disabled={submitLoading}
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2 rounded-lg font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
                  disabled={submitLoading}
                >
                  {submitLoading ? 'Kaydediliyor...' : 'Kategoriyi Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a2632] w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-[#e7edf3] dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold">Yeni Gider Ekle</h3>
              <button
                onClick={() => {
                  setShowExpenseModal(false);
                  setExpenseForm({
                    category_id: '',
                    name: '',
                    description: '',
                    amount: '',
                    payment_status: '',
                    payment_date: '',
                    payment_time: '',
                  });
                  setErrors({});
                }}
                className="text-[#4c739a] hover:text-red-500 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleExpenseSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4c739a] mb-1">Gider Adı *</label>
                <input
                  name="name"
                  value={expenseForm.name}
                  onChange={handleExpenseChange}
                  className={`w-full px-4 py-2 bg-[#f0f2f5] dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none ${
                    errors.name ? 'ring-1 ring-red-500' : ''
                  }`}
                  placeholder="Örn: Elektrik Faturası"
                  type="text"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4c739a] mb-1">Açıklama</label>
                <input
                  name="description"
                  value={expenseForm.description}
                  onChange={handleExpenseChange}
                  className="w-full px-4 py-2 bg-[#f0f2f5] dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Tedarikçi adı veya açıklama"
                  type="text"
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">{errors.description[0]}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4c739a] mb-1">Kategori *</label>
                  <select
                    name="category_id"
                    value={expenseForm.category_id}
                    onChange={handleExpenseChange}
                    className={`w-full px-4 py-2 bg-[#f0f2f5] dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none ${
                      errors.category_id ? 'ring-1 ring-red-500' : ''
                    }`}
                  >
                    <option value="">Seçiniz</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <p className="text-red-500 text-xs mt-1">{errors.category_id[0]}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4c739a] mb-1">Tutar (₺) *</label>
                  <input
                    name="amount"
                    value={expenseForm.amount}
                    onChange={handleExpenseChange}
                    className={`w-full px-4 py-2 bg-[#f0f2f5] dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none ${
                      errors.amount ? 'ring-1 ring-red-500' : ''
                    }`}
                    placeholder="0,00"
                    type="number"
                    step="0.01"
                  />
                  {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount[0]}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4c739a] mb-1">
                  Ödeme Tarihi
                </label>
                <input
                  name="payment_date"
                  value={expenseForm.payment_date}
                  onChange={handleExpenseChange}
                  className="w-full px-4 py-2 bg-[#f0f2f5] dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none"
                  type="date"
                />
                {errors.payment_date && (
                  <p className="text-red-500 text-xs mt-1">{errors.payment_date[0]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4c739a] mb-1">
                  Ödeme Durumu
                </label>
                <select
                  name="payment_status"
                  value={expenseForm.payment_status}
                  onChange={handleExpenseChange}
                  className="w-full px-4 py-2 bg-[#f0f2f5] dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="">Seçiniz</option>
                  <option value="paid">Ödendi</option>
                  <option value="pending">Beklemede</option>
                  <option value="overdue">Gecikmiş</option>
                </select>
                {errors.payment_status && (
                  <p className="text-red-500 text-xs mt-1">{errors.payment_status[0]}</p>
                )}
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
                  disabled={submitLoading}
                >
                  {submitLoading ? 'Kaydediliyor...' : 'Gideri Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
        onConfirm={handleConfirmDelete}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmText="Sil"
        cancelText="Vazgeç"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        icon="danger"
      />
    </Layout>
  );
};

export default Expense;
