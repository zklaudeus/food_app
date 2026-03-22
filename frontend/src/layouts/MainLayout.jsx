import { Outlet, Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

const MainLayout = () => {
  const totalItems = useCartStore((state) => state.getTotalItems());

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-800">
      <header className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-black tracking-tighter text-emerald-600">
            FOOD<span className="text-neutral-800">APP</span>
          </Link>
          <nav className="flex gap-4 items-center">
            <Link to="/" className="font-medium hover:text-emerald-600 transition-colors">Menú</Link>
            <Link to="/carrito" className="relative p-2 text-neutral-600 hover:text-emerald-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce-short">
                  {totalItems}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow w-full max-w-4xl mx-auto p-4 md:py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-neutral-100 py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-neutral-400">
          <p>© {new Date().getFullYear()} FoodApp. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
