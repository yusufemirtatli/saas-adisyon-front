import { useState } from 'react';
import { register } from '../api/auth';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
    
    // İşletme adı değiştiğinde slug hatalarını da temizle
    if (name === 'businessName') {
      setFieldErrors(prev => ({ 
        ...prev, 
        tenant_slug: null,
        slug: null
      }));
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Form validasyonu
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    if (!formData.acceptTerms) {
      setError('Kullanım şartlarını kabul etmelisiniz');
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        name: formData.fullName,
        email: formData.email,
        tenant_name: formData.businessName,
        tenant_slug: generateSlug(formData.businessName),
        password: formData.password
      });

      if (result.success) {
        // Kayıt başarılı - Dashboard'a yönlendir
        window.location.href = '/';
      } else {
        // Hata mesajını göster
        if (result.errors) {
          setFieldErrors(result.errors);
          setError('Lütfen form hatalarını düzeltin');
        } else {
          setError(result.message || 'Kayıt başarısız oldu');
        }
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div className="flex flex-1 w-full min-h-screen overflow-hidden">
      {/* Left Column: Branding & Image (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 flex-col justify-end p-10 text-white overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAxnfVfaHfwGV0k86gv2e2Gl9d5Kvde9YA5z6CL5dPqrCj3unGRZSEoJLIXFM-t3el1_0-RMJWIB-4YPKrqLu9a4SSPwDrdo28zoT340rQXU_Ozt4DOw9P455tPmWWMNI5Bh1K5gFqcgzZ_M7KKv202nKrGmhZ-oVGYHTcFDfAl2ELTTtUsscEaC-8get14nrC_2VqD_7yI-WAhgjo1oacfTlY7p8brfgfWShnu395-_Y3F1KMP2hcjq4QrzwtCWGgc4u5zwX0Aloc')" }}
        ></div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/60 to-transparent mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-primary/20 mix-blend-overlay"></div>
        
        {/* Content */}
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined text-white text-[20px]">restaurant_menu</span>
            </div>
            <span className="text-lg font-bold tracking-wide uppercase">Adisyon Sistemi</span>
          </div>
          <h2 className="text-3xl font-bold mb-3 leading-tight">
            İşletmenizi Dijitalleştirin
          </h2>
          <p className="text-slate-200 text-base leading-relaxed opacity-90">
            Hemen kaydolun ve işletmenizi kolayca yönetmeye başlayın. Modern, hızlı ve güvenilir çözümlerimizle tanışın.
          </p>
        </div>
      </div>

      {/* Right Column: Register Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-4 md:px-8 py-8 bg-background-light dark:bg-background-dark relative overflow-y-auto">
        {/* Mobile decorative background blob */}
        <div className="lg:hidden absolute top-0 left-0 w-full h-2 bg-primary"></div>
        
        <div className="w-full max-w-[400px] flex flex-col my-auto">
          {/* Logo & Header (Mobile Friendly) */}
          <div className="mb-6 text-center lg:text-left">
            <div className="inline-flex lg:hidden items-center gap-2 mb-5 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-sm">
              <span className="material-symbols-outlined text-primary text-[18px]">restaurant_menu</span>
              <span className="font-bold text-xs tracking-wide">Adisyon</span>
            </div>
            <h1 className="text-slate-900 dark:text-white text-2xl font-bold leading-tight pb-2">
              Hesap Oluştur
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              İşletmenizi yönetmeye başlamak için kayıt olun.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2 animate-slide-in">
              <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-[18px] mt-0.5">error</span>
              <p className="text-xs text-red-600 dark:text-red-400 flex-1">{error}</p>
              <button
                type="button"
                onClick={() => setError('')}
                className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
            {/* Full Name Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-900 dark:text-slate-200 text-xs font-medium leading-normal ml-1">
                Ad Soyad
              </label>
              <div className="relative flex w-full items-center rounded-lg shadow-sm">
                <div className="absolute left-0 pl-3 flex items-center pointer-events-none text-slate-400 z-10">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border ${fieldErrors.name ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 focus:border-primary h-11 pl-10 pr-3 text-sm font-normal leading-normal placeholder:text-slate-400 transition-all`}
                  placeholder="Ahmet Yılmaz"
                  required
                />
              </div>
              {fieldErrors.name && (
                <p className="text-[10px] text-red-600 dark:text-red-400 ml-1">{fieldErrors.name[0]}</p>
              )}
            </div>

            {/* Email Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-900 dark:text-slate-200 text-xs font-medium leading-normal ml-1">
                E-posta
              </label>
              <div className="relative flex w-full items-center rounded-lg shadow-sm">
                <div className="absolute left-0 pl-3 flex items-center pointer-events-none text-slate-400 z-10">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border ${fieldErrors.email ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 focus:border-primary h-11 pl-10 pr-3 text-sm font-normal leading-normal placeholder:text-slate-400 transition-all`}
                  placeholder="ahmet@restoran.com"
                  required
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[10px] text-red-600 dark:text-red-400 ml-1">{fieldErrors.email[0]}</p>
              )}
            </div>

            {/* Phone Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-900 dark:text-slate-200 text-xs font-medium leading-normal ml-1">
                Telefon
              </label>
              <div className="relative flex w-full items-center rounded-lg shadow-sm">
                <div className="absolute left-0 pl-3 flex items-center pointer-events-none text-slate-400 z-10">
                  <span className="material-symbols-outlined text-[18px]">call</span>
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary h-11 pl-10 pr-3 text-sm font-normal leading-normal placeholder:text-slate-400 transition-all"
                  placeholder="(5XX) XXX XX XX"
                />
              </div>
            </div>

            {/* Business Name Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-900 dark:text-slate-200 text-xs font-medium leading-normal ml-1">
                İşletme Adı
              </label>
              <div className="relative flex w-full items-center rounded-lg shadow-sm">
                <div className="absolute left-0 pl-3 flex items-center pointer-events-none text-slate-400 z-10">
                  <span className="material-symbols-outlined text-[18px]">store</span>
                </div>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border ${fieldErrors.tenant_name || fieldErrors.tenant_slug || fieldErrors.slug ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 focus:border-primary h-11 pl-10 pr-3 text-sm font-normal leading-normal placeholder:text-slate-400 transition-all`}
                  placeholder="Lezzet Restoran"
                  required
                />
              </div>
              {(fieldErrors.tenant_name || fieldErrors.tenant_slug || fieldErrors.slug) && (
                <p className="text-[10px] text-red-600 dark:text-red-400 ml-1">
                  {fieldErrors.tenant_name?.[0] || fieldErrors.tenant_slug?.[0] || fieldErrors.slug?.[0]}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-900 dark:text-slate-200 text-xs font-medium leading-normal ml-1">
                Şifre
              </label>
              <div className="relative flex w-full items-center rounded-lg shadow-sm">
                <div className="absolute left-0 pl-3 flex items-center pointer-events-none text-slate-400 z-10">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border ${fieldErrors.password ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 focus:border-primary h-11 pl-10 pr-11 text-sm font-normal leading-normal placeholder:text-slate-400 transition-all`}
                  placeholder="En az 6 karakter"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 pr-3 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors z-10 outline-none"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[10px] text-red-600 dark:text-red-400 ml-1">{fieldErrors.password[0]}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-900 dark:text-slate-200 text-xs font-medium leading-normal ml-1">
                Şifre Tekrar
              </label>
              <div className="relative flex w-full items-center rounded-lg shadow-sm">
                <div className="absolute left-0 pl-3 flex items-center pointer-events-none text-slate-400 z-10">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary h-11 pl-10 pr-11 text-sm font-normal leading-normal placeholder:text-slate-400 transition-all"
                  placeholder="Şifrenizi tekrar girin"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-0 pr-3 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors z-10 outline-none"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showConfirmPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-1.5 mt-1 px-1">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="w-3.5 h-3.5 mt-0.5 rounded border-slate-300 text-primary focus:ring-primary/20 dark:bg-slate-800 dark:border-slate-600 cursor-pointer"
              />
              <label className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed cursor-pointer select-none">
                <a href="#" className="text-primary hover:underline font-medium">Kullanım Şartları</a>'nı ve <a href="#" className="text-primary hover:underline font-medium">Gizlilik Politikası</a>'nı okudum, kabul ediyorum.
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-1.5 flex flex-col gap-2.5">
              <button
                type="submit"
                disabled={!formData.acceptTerms || loading}
                className="flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-11 bg-primary hover:bg-blue-600 text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-lg shadow-primary/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="truncate">Kayıt yapılıyor...</span>
                  </>
                ) : (
                  <span className="truncate">Kayıt Ol</span>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleLogin}
                className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 text-sm font-bold leading-normal tracking-[0.015em] transition-all duration-200 active:scale-[0.98]"
              >
                <span className="truncate">Zaten Hesabım Var</span>
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              © 2024 Adisyon Sistemi. Güvenli Yönetim Paneli v2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

