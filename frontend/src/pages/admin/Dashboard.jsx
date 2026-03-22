import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { DollarSign, ShoppingBag, Clock, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState({
    total_vendido: 0,
    pendientes: 0,
    preparando: 0,
    entregados_hoy: 0
  });
  const [loading, setLoading] = useState(true);
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    const fetchResumen = async () => {
      try {
        const res = await axios.get('/api/pedidos/resumen', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const estados = res.data.estados || [];
        const getTotalByEstado = (estadoDesc) => {
          const found = estados.find(e => e.estado === estadoDesc);
          return found ? parseInt(found.cantidad) : 0;
        };

        setData({
          total_vendido: res.data.total_vendido || 0,
          pendientes: getTotalByEstado('pendiente'),
          preparando: getTotalByEstado('preparando'),
          entregados_hoy: getTotalByEstado('entregado')
        });
      } catch (err) {
        console.error("Error fetching resumen", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResumen();
  }, [token]);

  if (loading) return <div className="p-6 flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Ventas Hoy" 
          value={`$${data.total_vendido.toLocaleString()}`} 
          icon={<DollarSign className="text-green-600" size={24} />} 
          bgColor="bg-green-100"
        />
        <StatsCard 
          title="Pendientes" 
          value={data.pendientes} 
          icon={<ShoppingBag className="text-orange-600" size={24} />} 
          bgColor="bg-orange-100"
        />
        <StatsCard 
          title="Preparando" 
          value={data.preparando} 
          icon={<Clock className="text-blue-600" size={24} />} 
          bgColor="bg-blue-100"
        />
        <StatsCard 
          title="Entregados Hoy" 
          value={data.entregados_hoy} 
          icon={<CheckCircle className="text-purple-600" size={24} />} 
          bgColor="bg-purple-100"
        />
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon, bgColor }) {
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
