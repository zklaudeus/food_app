import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Menu = () => {
  const [bowls, setBowls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await api.get('/productos');
        // Backend devuelve array: productosConIngredientes
        setBowls(response.data);
      } catch (err) {
        setError('Error al cargar el menú. Por favor, intenta de nuevo.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="bg-emerald-50 rounded-2xl p-8 md:p-12 text-center border border-emerald-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 blur-2xl" style={{ backgroundColor: '#10b981' }}></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-black text-emerald-900 tracking-tight mb-4">
            Arma tu Bowl Perfecto
          </h1>
          <p className="text-lg text-emerald-700 max-w-xl mx-auto mb-2">
            Escoge una de nuestras combinaciones maestras y personalízala a tu manera.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-neutral-800 mb-6 font-serif">Nuestros Bowls Base</h2>
        
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-100 text-center">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bowls.map((bowl) => (
              <div key={bowl.id} className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-neutral-100 overflow-hidden hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col group">
                <div className="h-48 relative overflow-hidden bg-emerald-50">
                  <div className="absolute inset-0 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-500">
                     🥗
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-neutral-800 capitalize">{bowl.nombre}</h3>
                    <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-sm">
                      ${Number(bowl.precio_base).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-sm text-neutral-500 mb-6 flex-grow">
                    <p className="font-medium text-neutral-700 mb-1">Incluye:</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {bowl.ingredientes && bowl.ingredientes.map(ing => (
                        <span key={ing.id} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                          {ing.nombre}
                        </span>
                      ))}
                      {(!bowl.ingredientes || bowl.ingredientes.length === 0) && (
                        <span>Bowl base puro</span>
                      )}
                    </div>
                  </div>
                  
                  <Link 
                    to={`/personalizar/${bowl.id}`}
                    className="block text-center w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-sm shadow-emerald-200"
                  >
                    Personalizar y Pedir
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Menu;
