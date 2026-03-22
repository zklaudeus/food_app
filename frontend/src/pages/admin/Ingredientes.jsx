import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Filter } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import IngredienteModal from '../../components/admin/IngredienteModal';

export default function Ingredientes() {
  const [ingredientes, setIngredientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIngrediente, setSelectedIngrediente] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  
  const token = useAuthStore(state => state.token);

  const fetchIngredientes = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/ingredientes');
      setIngredientes(res.data.ingredientes || []);
    } catch (err) {
      console.error("Error fetching ingredientes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredientes();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este ingrediente?')) return;
    try {
      await axios.delete(`/api/ingredientes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchIngredientes();
    } catch (err) {
      console.error("Error deleting ingrediente", err);
      alert(err.response?.data?.error || 'Error al eliminar ingrediente');
    }
  };

  const openCreateModal = () => {
    setSelectedIngrediente(null);
    setModalOpen(true);
  };

  const openEditModal = (ingrediente) => {
    setSelectedIngrediente(ingrediente);
    setModalOpen(true);
  };

  const filteredIngredientes = useMemo(() => {
    if (filtroTipo === 'todos') return ingredientes;
    return ingredientes.filter(i => i.tipo === filtroTipo);
  }, [ingredientes, filtroTipo]);

  const getTipoColor = (tipo) => {
    switch(tipo) {
      case 'base': return 'bg-amber-100 text-amber-700';
      case 'proteina': return 'bg-red-100 text-red-700';
      case 'extra': return 'bg-teal-100 text-teal-700';
      case 'salsa': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Ingredientes</h1>
        <button 
          onClick={openCreateModal}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Nuevo Ingrediente
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-start md:items-center mb-6">
        <Filter size={20} className="text-gray-400" />
        <span className="text-sm font-medium text-gray-600">Filtrar por tipo:</span>
        <div className="flex gap-2 flex-wrap">
          {['todos', 'base', 'proteina', 'extra', 'salsa'].map(tipo => (
            <button
              key={tipo}
              onClick={() => setFiltroTipo(tipo)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                filtroTipo === tipo 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tipo}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando ingredientes...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                  <th className="p-4 font-medium">Nombre</th>
                  <th className="p-4 font-medium">Precio Extra</th>
                  <th className="p-4 font-medium">Tipo</th>
                  <th className="p-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredIngredientes.map(ing => (
                  <tr key={ing.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-800">{ing.nombre}</td>
                    <td className="p-4 text-gray-600">${Number(ing.precio_extra).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(ing.tipo)}`}>
                        {ing.tipo}
                      </span>
                    </td>
                    <td className="p-4 flex justify-end gap-3">
                      <button 
                        onClick={() => openEditModal(ing)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(ing.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredIngredientes.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500">
                      No se encontraron ingredientes para este filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <IngredienteModal 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)} 
          selectedIngrediente={selectedIngrediente}
          onSuccess={fetchIngredientes}
        />
      )}
    </div>
  );
}
