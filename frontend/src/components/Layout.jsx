import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiGrid, FiList, FiShoppingCart, FiFileText, FiSettings, FiLogOut, FiMenu } from 'react-icons/fi';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <FiHome /> },
    { name: 'Tables', path: '/tables', icon: <FiGrid /> },
    { name: 'Menu', path: '/menu', icon: <FiList /> },
    { name: 'POS', path: '/pos', icon: <FiShoppingCart /> },
    { name: 'Bills', path: '/bills', icon: <FiFileText /> },
    { name: 'Settings', path: '/settings', icon: <FiSettings /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className={`bg-dark text-light w-64 flex flex-col transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-64'} fixed h-full z-20 md:relative md:translate-x-0`}>
        <div className="p-5 flex items-center justify-between border-b border-gray-700">
          <h2 className="text-2xl font-bold text-accent">Cafe Billing</h2>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}><FiMenu size={24} /></button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <ul>
            {navItems.map((item) => (
              <li key={item.name} className="px-4 py-2">
                <Link to={item.path} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname === item.path ? 'bg-primary text-white' : 'hover:bg-gray-800'}`}>
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 border-t border-gray-700">
          <button onClick={handleLogout} className="flex items-center gap-3 p-3 w-full rounded-lg hover:bg-red-600 transition-colors">
            <FiLogOut className="text-xl" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm z-10 md:hidden">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-600"><FiMenu size={24} /></button>
            <h1 className="text-xl font-bold text-dark">Cafe Delight</h1>
            <div className="w-6"></div> {/* Spacer */}
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative">
            {children}
        </main>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden" onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );
};

export default Layout;
