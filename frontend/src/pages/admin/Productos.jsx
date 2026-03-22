import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import ProductoModal from '../../components/admin/ProductoModal';

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const token = useAuthStore(state => state.token);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/productos');
      setProductos(res.data);
    } catch (err) {
      console.error("Error fetching productos", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await axios.delete(`/api/productos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProductos();
    } catch (err) {
      console.error("Error deleting producto", err);
      alert(err.response?.data?.error || 'Error al eliminar producto');
    }
  };

  const openCreateModal = () => {
    setSelectedProduct(null);
    setModalOpen(true);
  };

  const openEditModal = (producto) => {
    setSelectedProduct(producto);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Productos</h1>
        <button 
          onClick={openCreateModal}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Nuevo Producto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando productos...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                  <th className="p-4 font-medium">Nombre</th>
                  <th className="p-4 font-medium">Precio Base</th>
                  <th className="p-4 font-medium">Tipo</th>
                  <th className="p-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(prod => (
                  <tr key={prod.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-800">{prod.nombre}</td>
                    <td className="p-4 text-gray-600">${Number(prod.precio_base).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        prod.tipo === 'personalizable' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {prod.tipo}
                      </span>
                    </td>
                    <td className="p-4 flex justify-end gap-3">
                      <button 
                        onClick={() => openEditModal(prod)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(prod.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {productos.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500">
                      No hay productos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <ProductoModal 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)} 
          selectedProduct={selectedProduct}
          onSuccess={fetchProductos}
        />
      )}
    </div>
  );
}
