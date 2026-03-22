import { Phone, Clock, ChevronRight } from 'lucide-react';

export default function PedidoCard({ pedido, onEstadoChange }) {
  const { id, nombre_cliente, telefono, total, estado, items, fecha } = pedido;
  
  // Format dates strictly since we assumed a created_at variable shape but might be raw strings from postgres
  const hora = new Date(fecha || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const getNextEstado = (current) => {
    switch(current) {
      case 'pendiente': return { val: 'preparando', label: 'Preparar', color: 'bg-blue-500 hover:bg-blue-600' };
      case 'preparando': return { val: 'listo', label: 'Marcar Listo', color: 'bg-green-500 hover:bg-green-600' };
      case 'listo': return { val: 'entregado', label: 'Entregar', color: 'bg-purple-600 hover:bg-purple-700' };
      default: return null;
    }
  };

  const nextAction = getNextEstado(estado);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
        <div>
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            #{id} - {nombre_cliente}
          </h3>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <Phone size={14} /> {telefono}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-800">${Number(total).toLocaleString()}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 justify-end">
            <Clock size={12} /> {hora}
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {items && items.map((item, idx) => (
          <div key={idx} className="bg-gray-50 p-2 text-sm rounded border border-gray-100">
            <div className="font-medium text-gray-800 flex justify-between">
              <span>{item.cantidad}x {item.producto_nombre}</span>
              <span>${Number(item.subtotal).toLocaleString()}</span>
            </div>
            
            {item.ingredientes && item.ingredientes.length > 0 && (
              <ul className="mt-1 pl-4 list-disc text-gray-500 text-xs">
                {item.ingredientes.map((ing, iIdx) => (
                  <li key={iIdx}>{ing.nombre} {ing.precio > 0 ? `(+$${Number(ing.precio)})` : ''}</li>
                ))}
              </ul>
            )}
            {(!item.ingredientes || item.ingredientes.length === 0) && (
              <p className="text-xs text-gray-400 mt-1 italic pl-1">Sin adicionales</p>
            )}
          </div>
        ))}
      </div>

      {nextAction && (
        <button
          onClick={() => onEstadoChange(id, nextAction.val)}
          className={`w-full flex items-center justify-center gap-1 py-2 rounded-md text-white text-sm font-medium transition-colors ${nextAction.color}`}
        >
          {nextAction.label}
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}
