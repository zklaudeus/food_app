import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import PedidoCard from '../../components/admin/PedidoCard';
import { Clock, RefreshCw } from 'lucide-react';

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const token = useAuthStore(state => state.token);

  const fetchPedidos = async (showRefresh = false) => {
    try {
      if (showRefresh) setIsRefreshing(true);
      const res = await axios.get('/api/pedidos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filtrar activos y ordenar primero el más antiguo
      const activos = res.data
        .filter(p => !['entregado', 'cancelado'].includes(p.estado))
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      
      // Para cada pedido necesitamos sus detalles e ingredientes
      // Ya que el backend GET /api/pedidos no trae detalles por defecto, 
      // y getPedidosById sí, haremos Promise.all para cargar los items
      // (En producción idealmente el backend traería todo de una en un endpoint optimizado)
      const pedidosConDetalle = await Promise.all(
        activos.map(async (p) => {
          const detailRes = await axios.get(`/api/pedidos/${p.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          return detailRes.data;
        })
      );
      
      setPedidos(pedidosConDetalle);
    } catch (err) {
      console.error("Error fetching pedidos", err);
    } finally {
      if (showRefresh) setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
    
    // Auto-actualizar cada 30 segundos
    const interval = setInterval(() => {
      fetchPedidos(false);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [token]);

  const handleEstadoChange = async (pedidoId, nuevoEstado) => {
    try {
      await axios.patch(`/api/pedidos/${pedidoId}`, 
        { estado: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refrescar lista (el pedido desaparecerá si es entregado)
      fetchPedidos(false);
    } catch (err) {
      alert("Error al actualizar estado del pedido");
      console.error(err);
    }
  };

  const columnas = [
    { id: 'pendiente', titulo: 'Pendientes', color: 'bg-orange-500' },
    { id: 'preparando', titulo: 'En Preparación', color: 'bg-blue-500' },
    { id: 'listo', titulo: 'Listos para Entregar', color: 'bg-green-500' }
  ];

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando pedidos activos...</div>;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Panel de Pedidos Activos</h1>
          <div className="flex items-center text-gray-500 mt-1 text-sm">
            <Clock size={16} className="mr-1" />
            Actualización automática cada 30s
          </div>
        </div>
        
        <button 
          onClick={() => fetchPedidos(true)}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium border border-gray-200"
        >
          <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? 'Actualizando...' : 'Actualizar ahora'}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto lg:overflow-hidden min-h-[500px] pb-4">
        {columnas.map(col => {
          const pedidosColumna = pedidos.filter(p => p.estado === col.id);
          
          return (
            <div key={col.id} className="bg-gray-50 rounded-xl border border-gray-200 flex flex-col h-[500px] lg:h-full overflow-hidden">
              <div className="p-4 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-bold flex items-center gap-2 text-gray-700">
                  <span className={`w-3 h-3 rounded-full ${col.color}`}></span>
                  {col.titulo}
                </h2>
                <span className="bg-white px-2.5 py-1 rounded-full text-sm font-semibold text-gray-600 shadow-sm border border-gray-200">
                  {pedidosColumna.length}
                </span>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {pedidosColumna.map(pedido => (
                  <PedidoCard 
                    key={pedido.id} 
                    pedido={pedido} 
                    onEstadoChange={handleEstadoChange}
                  />
                ))}
                {pedidosColumna.length === 0 && (
                  <div className="h-32 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                    No hay pedidos
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
