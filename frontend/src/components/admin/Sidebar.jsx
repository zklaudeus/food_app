import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Utensils, ClipboardList, Clock, X } from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }) {
  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Pedidos Activos', path: '/admin/pedidos', icon: <ClipboardList size={20} /> },
    { name: 'Historial', path: '/admin/historial', icon: <Clock size={20} /> },
    { name: 'Productos', path: '/admin/productos', icon: <ShoppingBag size={20} /> },
    { name: 'Ingredientes', path: '/admin/ingredientes', icon: <Utensils size={20} /> },
  ];

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col
      transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      md:relative md:translate-x-0
    `}>
      <div className="p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-wider text-green-400">RICO BOWL</h1>
          <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
        </div>
        <button 
          onClick={() => setIsOpen?.(false)}
          className="md:hidden text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>
      </div>
      
      <nav className="flex-1 mt-6 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/admin'} // Exact match for Dashboard
                onClick={() => setIsOpen?.(false)} // Close on mobile when navigating
                className={({ isActive }) =>
                  `flex items-center gap-3 px-6 py-3 transition-colors ${
                    isActive 
                      ? 'bg-green-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
