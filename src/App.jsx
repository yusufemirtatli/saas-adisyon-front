import { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard';
import Tables from './pages/Tables';
import ShopCart from './pages/ShopCart';
import Payment from './pages/Payment';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/Menu';
import Expense from './pages/Expense';
import Kitchen from './pages/Kitchen';
import Team from './pages/Team';
import './App.css';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // URL değişimini dinle
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Sayfa yüklendiğinde path'i al
    handleLocationChange();

    // popstate eventi (geri/ileri butonları için)
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // URL'e göre hangi sayfanın render edileceğine karar ver
  const renderPage = () => {
    // tables/{id}/{shopcart_id} formatını kontrol et (ödeme sayfası)
    const paymentMatch = currentPath.match(/^\/tables\/([^/]+)\/([^/]+)$/);
    if (paymentMatch) {
      return <Payment />;
    }

    // tables/{id} formatını kontrol et (shopcart)
    if (currentPath.startsWith('/tables/') && !paymentMatch) {
      return <ShopCart />;
    }

    switch (currentPath) {
      case '/':
        return <Dashboard />;
      case '/login':
        return <Login />;
      case '/register':
        return <Register />;
      case '/tables':
        return <Tables />;
      case '/kitchen':
        return <Kitchen />;
      case '/menu':
        return <Menu />;
      case '/team':
        return <Team />;
      case '/expense':
        return <Expense />;
      default:
        return <Dashboard />;
    }
  };

  return renderPage();
}

export default App;
