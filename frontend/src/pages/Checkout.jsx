import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import api from '../services/api';

const Checkout = () => {
  const { cart, clearCart } = useCartStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nombre_cliente: '',
    telefono: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Si acceden al checkout sin artículos en el carrito
  if (cart.length === 0 && !success) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold mb-4">No hay nada en tu carrito</h2>
        <Link to="/" className="text-emerald-600 font-bold hover:underline">Volver al inicio</Link>
      </div>
    );
  }

  // Vista de éxito
  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-sm border-8 border-emerald-50">
          ✓
        </div>
        <h1 className="text-4xl font-black text-neutral-800 mb-2">¡Pedido Confirmado!</h1>
        <p className="text-neutral-500 mb-8 max-w-sm mx-auto">
          Hemos recibido tu pedido correctamente. La cocina ya está preparando tus bowls.
        </p>
        <Link 
          to="/" 
          className="inline-block px-8 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl transition-colors shadow-md"
        >
          Volver al Inicio
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre_cliente.trim()) {
      setError("Por favor, ingresa tu nombre");
      return;
    }

    setLoading(true);
    setError(null);

    // Formatear payload para la DB que recién arreglamos en el backend
    // NOTA: El endpoint validado NO REQUIERE enviar totales, él mismo los calcula
    const payload = {
      nombre_cliente: formData.nombre_cliente,
      telefono: formData.telefono || 'No especificado',
      items: cart.map(item => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        // Mandamos los ingredientes con la estructura que req el backend ({ingrediente_id, tipo, precio})
        ingredientes: item.ingredientes.map(ing => ({
          ingrediente_id: ing.ingrediente_id || ing.id, // soporta si viene como id o ingrediente_id
          tipo: ing.tipo,
          precio: ing.precio 
        }))
      }))
    };

    try {
      await api.post('/pedidos', payload);
      setSuccess(true);
      clearCart();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Ocurrió un error al procesar tu pedido. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in slide-in-from-right-8 duration-300">
      <Link to="/carrito" className="text-sm font-medium text-neutral-500 hover:text-emerald-600 flex items-center gap-1 w-fit transition-colors">
        ← Volver al Carrito
      </Link>

      <div className="bg-white p-6 md:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100">
        <h1 className="text-3xl font-black text-neutral-800 mb-2">Finaliza tu Compra</h1>
        <p className="text-neutral-500 mb-8">Ingresa tus datos para procesar la orden inmediatamente.</p>
        
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-1.5 ml-1">Nombre Completo <span className="text-rose-500">*</span></label>
            <input 
              type="text" 
              required
              value={formData.nombre_cliente}
              onChange={(e) => setFormData({...formData, nombre_cliente: e.target.value})}
              placeholder="Ej. Juan Pérez"
              className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-1.5 ml-1">Teléfono o Celular</label>
            <input 
              type="tel" 
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              placeholder="Ej. +569..."
              className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="pt-6 mt-6 border-t border-neutral-100">
            <button 
              type="submit"
              disabled={loading}
              className={`
                w-full py-4 bg-neutral-900 border-2 border-neutral-900 text-white font-black tracking-wide rounded-2xl shadow-lg transition-all text-lg flex items-center justify-center gap-2
                ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-neutral-800 hover:-translate-y-1 hover:shadow-xl'}
              `}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Procesando...
                </>
              ) : 'Confirmar Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
