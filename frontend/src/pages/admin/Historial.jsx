import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { Calendar, DollarSign, ListOrdered, TrendingUp } from 'lucide-react';

export default function Historial() {
  const [pedidos, setPedidos] = useState([]);
  const [resumen, setResumen] = useState({
    total_pedidos: 0,
    total_vendido: 0,
    promedio_pedido: 0
  });
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('hoy'); // hoy, semana, mes
  
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/pedidos/historial?filtro=${filtro}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setPedidos(res.data.pedidos || []);
        if (res.data.resumen) {
          setResumen(res.data.resumen);
        }
      } catch (err) {
        console.error("Error fetching historial", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistorial();
  }, [token, filtro]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha desconocida';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Historial de Ventas</h1>
          <p className="text-gray-500 mt-1 text-sm">Pedidos entregados</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {['hoy', 'semana', 'mes'].map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${
                filtro === f 
                  ? 'bg-white text-gray-800 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f === 'hoy' ? 'Hoy' : `Esta ${f}`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ResumenCard 
          title="Total Pedidos" 
          value={resumen.total_pedidos} 
          icon={<ListOrdered className="text-blue-600" size={24} />} 
          bgColor="bg-blue-100"
        />
        <ResumenCard 
          title="Monto Vendido" 
          value={`$${resumen.total_vendido.toLocaleString()}`} 
          icon={<DollarSign className="text-green-600" size={24} />} 
          bgColor="bg-green-100"
        />
        <ResumenCard 
          title="Promedio por Pedido" 
          value={`$${resumen.promedio_pedido.toLocaleString()}`} 
          icon={<TrendingUp className="text-indigo-600" size={24} />} 
          bgColor="bg-indigo-100"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando historial...</div>
        ) : (
          <div className="overflow-x-auto h-full">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
                <tr className="text-gray-500 text-sm">
                  <th className="p-4 font-medium">ID Pedido</th>
                  <th className="p-4 font-medium">Cliente</th>
                  <th className="p-4 font-medium">Fecha y Hora</th>
                  <th className="p-4 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map(prod => (
                  <tr key={prod.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-600">#{prod.id}</td>
                    <td className="p-4 font-medium text-gray-800">
                      {prod.nombre_cliente}
                      <span className="block text-xs text-gray-400 font-normal mt-0.5">{prod.telefono}</span>
                    </td>
                    <td className="p-4 text-gray-600 flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      {formatDate(prod.fecha)}
                    </td>
                    <td className="p-4 font-bold text-gray-800 text-right">
                      ${Number(prod.total).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {pedidos.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-12 text-center text-gray-500">
                      No hay pedidos entregados para el período seleccionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ResumenCard({ title, value, icon, bgColor }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
      <div className={`${bgColor} p-4 rounded-lg mr-4`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
