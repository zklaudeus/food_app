import { LogOut, User, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ toggleSidebar }) {
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="bg-white shadow relative z-10">
      <div className="flex items-center justify-between px-4 md:px-6 py-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleSidebar}
            className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <Menu size={24} />
          </button>
          <h2 className="text-xl font-semibold text-gray-800 hidden sm:block">Panel de Administración</h2>
          <h2 className="text-lg font-semibold text-gray-800 sm:hidden">Admin</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-gray-600">
            <User size={20} />
            <span className="font-medium">Admin</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 hover:text-red-800 transition-colors"
          >
            <LogOut size={20} className="sm:hidden" />
            <span className="hidden sm:inline flex items-center gap-2"><LogOut size={20} /> Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
}
