import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, getTotal } = useCartStore();

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-end justify-between border-b border-neutral-100 pb-4">
        <h1 className="text-3xl font-black text-neutral-800 tracking-tight">Tu Pedido</h1>
        <span className="text-neutral-500 font-medium mb-1">{cart.length} items</span>
      </div>
      
      {cart.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-neutral-100 shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-3xl mb-4">🛒</div>
          <h2 className="text-xl font-bold text-neutral-800 mb-2">Tu carrito está vacío</h2>
          <p className="text-neutral-500 mb-6">Parece que aún no has armado tu bowl perfecto.</p>
          <Link to="/" className="text-emerald-600 font-bold bg-emerald-50 px-6 py-2 rounded-xl hover:bg-emerald-100 transition-colors">
            Ver el menú
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {cart.map((item) => {
            const extraTotal = item.ingredientes.reduce((sum, ing) => sum + Number(ing.precio), 0);
            const itemUnitTotal = Number(item.precioBase) + extraTotal;
            const itemTotal = itemUnitTotal * item.cantidad;

            return (
              <div key={item.cartId} className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-neutral-100 flex gap-4 relative group">
                {/* Botón eliminar */}
                <button 
                  onClick={() => removeFromCart(item.cartId)}
                  className="absolute -top-2 -right-2 bg-rose-100 text-rose-600 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 hover:text-white"
                  title="Eliminar del carrito"
                >
                  ✕
                </button>

                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-50 rounded-xl flex items-center justify-center text-3xl shrink-0">
                  🥗
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-lg text-neutral-800 leading-tight capitalize">{item.nombre}</h3>
                      <p className="font-black text-emerald-600">${itemTotal.toFixed(2)}</p>
                    </div>
                    
                    {item.ingredientes.length > 0 ? (
                      <p className="text-xs sm:text-sm text-neutral-500 mt-1 line-clamp-2">
                        + {item.ingredientes.map(i => i.nombre).join(', ')}
                      </p>
                    ) : (
                      <p className="text-xs sm:text-sm text-neutral-400 mt-1">Sin extras seleccionados</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center bg-neutral-100 rounded-lg p-1">
                      <button 
                        onClick={() => updateQuantity(item.cartId, item.cantidad - 1)}
                        className="w-8 h-8 rounded-md bg-white shadow-sm flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 font-bold transition-colors"
                      >
                        -
                      </button>
                      <span className="font-bold w-10 text-center text-neutral-700">{item.cantidad}</span>
                      <button 
                        onClick={() => updateQuantity(item.cartId, item.cantidad + 1)}
                        className="w-8 h-8 rounded-md bg-white shadow-sm flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-neutral-400 font-medium">
                      ${itemUnitTotal.toFixed(2)} c/u
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="bg-emerald-50 p-6 md:p-8 rounded-2xl border border-emerald-100 mt-8 shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
            
            <div className="relative z-10 flex justify-between items-end mb-6">
              <div>
                <span className="text-emerald-800 font-bold block mb-1">Total a Pagar</span>
                <span className="text-xs text-emerald-600 font-medium">Sujeto a confirmación</span>
              </div>
              <span className="text-4xl font-black text-emerald-700 tracking-tight">${getTotal().toFixed(2)}</span>
            </div>
            
            <Link 
              to="/checkout" 
              className="relative z-10 block text-center w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Continuar al Pago
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
