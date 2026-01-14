import { useState } from 'react';
import { login } from '../api/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login({ email, password });

      if (result.success) {
        // Giriş başarılı - Dashboard'a yönlendir
        window.location.href = '/';
      } else {
        // Hata mesajını göster
        setError(result.message || 'Giriş başarısız oldu');
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    window.location.href = '/register';
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
            İşletmenizi Tek Bir Yerden Yönetin
          </h2>
          <p className="text-slate-200 text-base leading-relaxed opacity-90">
            Sipariş yönetimi, stok takibi ve personel performansı analizi için gelişmiş panelimize hoş geldiniz.
          </p>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-4 md:px-8 py-8 bg-background-light dark:bg-background-dark relative">
        {/* Mobile decorative background blob */}
        <div className="lg:hidden absolute top-0 left-0 w-full h-2 bg-primary"></div>
        
        <div className="w-full max-w-[400px] flex flex-col">
          {/* Logo & Header (Mobile Friendly) */}
          <div className="mb-8 text-center lg:text-left">
            <div className="inline-flex lg:hidden items-center gap-2 mb-5 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-sm">
              <span className="material-symbols-outlined text-primary text-[18px]">restaurant_menu</span>
              <span className="font-bold text-xs tracking-wide">Adisyon</span>
            </div>
            <h1 className="text-slate-900 dark:text-white text-2xl font-bold leading-tight pb-2">
              Yönetim Paneli Girişi
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Devam etmek için hesap bilgilerinizi giriniz.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2 animate-slide-in">
              <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-[18px] mt-0.5">error</span>
              <p className="text-xs text-red-600 dark:text-red-400 flex-1">{error}</p>
              <button
                onClick={() => setError('')}
                className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Email Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-900 dark:text-slate-200 text-xs font-medium leading-normal ml-1">
                E-posta veya Kullanıcı Adı
              </label>
              <div className="relative flex w-full items-center rounded-lg shadow-sm">
                <div className="absolute left-0 pl-3 flex items-center pointer-events-none text-slate-400 z-10">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary h-11 pl-10 pr-3 text-sm font-normal leading-normal placeholder:text-slate-400 transition-all"
                  placeholder="admin@restoran.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-slate-900 dark:text-slate-200 text-xs font-medium leading-normal">
                  Şifre
                </label>
              </div>
              <div className="relative flex w-full items-center rounded-lg shadow-sm">
                <div className="absolute left-0 pl-3 flex items-center pointer-events-none text-slate-400 z-10">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary h-11 pl-10 pr-11 text-sm font-normal leading-normal placeholder:text-slate-400 transition-all"
                  placeholder="******"
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
            </div>

            {/* Options Row */}
            <div className="flex items-center justify-between mt-0.5 px-1">
              <label className="flex items-center gap-1.5 cursor-pointer group select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-primary focus:ring-primary/20 dark:bg-slate-800 dark:border-slate-600 cursor-pointer"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                  Beni hatırla
                </span>
              </label>
              <a
                href="#"
                className="text-xs font-semibold text-primary hover:text-blue-600 transition-colors"
              >
                Şifremi unuttum?
              </a>
            </div>

            {/* Action Buttons */}
            <div className="pt-1.5 flex flex-col gap-2.5">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-11 bg-primary hover:bg-blue-600 text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-lg shadow-primary/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-primary"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="truncate">Giriş yapılıyor...</span>
                  </>
                ) : (
                  <span className="truncate">Giriş Yap</span>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleRegister}
                className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 text-sm font-bold leading-normal tracking-[0.015em] transition-all duration-200 active:scale-[0.98]"
              >
                <span className="truncate">Kaydol</span>
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              © 2024 Adisyon Sistemi. Güvenli Yönetim Paneli v2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

