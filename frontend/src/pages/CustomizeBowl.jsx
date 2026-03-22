import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCartStore } from '../store/cartStore';

const CustomizeBowl = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToCart = useCartStore(state => state.addToCart);

  const [bowl, setBowl] = useState(null);
  const [allIngredientes, setAllIngredientes] = useState([]);
  
  // Array de ingredientes extra seleccionados (objetos completos)
  const [selectedExtras, setSelectedExtras] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, ingRes] = await Promise.all([
          api.get(`/productos/${id}`),
          api.get('/ingredientes')
        ]);
        
        setBowl(prodRes.data);
        // Filtramos para asegurarnos de que el endpoint devolvió lo esperado
        setAllIngredientes(ingRes.data.ingredientes || ingRes.data || []);
      } catch (err) {
        setError('Error al cargar la información del bowl.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleToggleExtra = (ing) => {
    const isSelected = selectedExtras.some(e => e.id === ing.id);
    if (isSelected) {
      setSelectedExtras(prev => prev.filter(e => e.id !== ing.id));
    } else {
      setSelectedExtras(prev => [...prev, ing]);
    }
  };

  const handleAddToCart = () => {
    if (!bowl) return;

    // Formatear ingredientes seleccionados para el formato del backend/carrito
    const ingredientesSeleccionados = selectedExtras.map(ing => ({
      ingrediente_id: ing.id,
      nombre: ing.nombre,
      tipo: ing.tipo,
      precio: Number(ing.precio_extra)
    }));

    const cartItem = {
      producto_id: bowl.id,
      nombre: bowl.nombre,
      precioBase: Number(bowl.precio_base),
      cantidad: 1,
      ingredientes: ingredientesSeleccionados,
    };

    addToCart(cartItem);
    navigate('/carrito');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !bowl) {
    return (
      <div className="text-center py-12">
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-100 inline-block">
          {error || 'Bowl no encontrado'}
        </div>
        <div className="mt-4">
          <Link to="/" className="text-emerald-600 hover:underline">Volver al menú</Link>
        </div>
      </div>
    );
  }

  // Agrupar los ingredientes extra por "tipo" para que se vea ordenado
  const groupedExtras = allIngredientes.reduce((acc, ing) => {
    const tipo = ing.tipo || 'otros';
    if (!acc[tipo]) acc[tipo] = [];
    acc[tipo].push(ing);
    return acc;
  }, {});

  // Calcular precio actual referencial
  const extrasTotal = selectedExtras.reduce((sum, ing) => sum + Number(ing.precio_extra), 0);
  const currentTotal = Number(bowl.precio_base) + extrasTotal;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link to="/" className="text-sm font-medium text-neutral-500 hover:text-emerald-600 flex items-center gap-1 w-fit transition-colors">
        ← Volver al Menú
      </Link>

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 relative overflow-hidden">
        {/* Decoración superior */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-400"></div>

        <div className="flex justify-between items-start mb-6 pt-2">
          <div>
            <h1 className="text-3xl font-black text-neutral-800 tracking-tight capitalize">{bowl.nombre}</h1>
            <p className="text-emerald-600 font-bold text-lg mt-1">Precio Base: ${Number(bowl.precio_base).toFixed(2)}</p>
          </div>
        </div>

        {/* Ingredientes incluidos en el bowl */}
        <div className="mb-8 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
          <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider mb-2">Incluye de base:</h3>
          <div className="flex flex-wrap gap-2">
            {bowl.ingredientes && bowl.ingredientes.length > 0 ? (
              bowl.ingredientes.map(ing => (
                <span key={ing.id} className="bg-white border border-neutral-200 text-neutral-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                  ✓ {ing.nombre}
                </span>
              ))
            ) : (
              <span className="text-sm text-neutral-500">Solo la base principal</span>
            )}
          </div>
        </div>

        {/* Selección de Extras */}
        <div className="space-y-8">
          <div className="flex items-center gap-2 mb-4 border-b border-neutral-100 pb-2">
            <span className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">
              +
            </span> 
            <h2 className="text-xl font-bold text-neutral-800">Agrega tus Extras</h2>
          </div>

          {Object.entries(groupedExtras).map(([tipo, ingredientes]) => (
            <div key={tipo} className="space-y-3">
              <h3 className="font-bold text-neutral-700 capitalize text-sm uppercase tracking-wide">{tipo}</h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {ingredientes.map((ing) => {
                  const isSelected = selectedExtras.some(e => e.id === ing.id);
                  const precio = Number(ing.precio_extra);
                  
                  return (
                    <button 
                      key={ing.id}
                      onClick={() => handleToggleExtra(ing)}
                      className={`
                        p-3 rounded-xl border-2 text-left transition-all duration-200 relative overflow-hidden
                        ${isSelected 
                          ? 'border-emerald-500 bg-emerald-50' 
                          : 'border-neutral-100 bg-white hover:border-emerald-200 hover:bg-neutral-50'}
                      `}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 flex h-4 w-4">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 items-center justify-center text-white text-[10px]">✓</span>
                        </div>
                      )}
                      <p className={`font-semibold text-sm ${isSelected ? 'text-emerald-900' : 'text-neutral-700'}`}>
                        {ing.nombre}
                      </p>
                      <p className={`text-xs mt-1 ${isSelected ? 'text-emerald-600 font-bold' : 'text-neutral-500'}`}>
                        {precio > 0 ? `+$${precio.toFixed(2)}` : 'Gratis'}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Fijado / Resumen */}
        <div className="pt-6 border-t border-neutral-100 mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white sticky bottom-4">
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium text-neutral-500 uppercase tracking-widest">Subtotal Referencial</p>
            <p className="text-3xl font-black text-emerald-600">${currentTotal.toFixed(2)}</p>
          </div>
          <button 
            onClick={handleAddToCart}
            className="w-full sm:w-auto px-8 py-4 bg-neutral-900 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] transition-all duration-300 transform active:scale-95 text-lg"
          >
            Agregar al Carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomizeBowl;
