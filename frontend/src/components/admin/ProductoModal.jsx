import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Plus, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export default function ProductoModal({ isOpen, onClose, selectedProduct, onSuccess }) {
  const [nombre, setNombre] = useState(selectedProduct?.nombre || '');
  const [precioBase, setPrecioBase] = useState(selectedProduct?.precio_base || '');
  const [tipo, setTipo] = useState(selectedProduct?.tipo || 'simple');
  const [productoId, setProductoId] = useState(selectedProduct?.id || null);
  
  // Para gestión de ingredientes del producto
  const [productoIngredientes, setProductoIngredientes] = useState([]);
  const [todosIngredientes, setTodosIngredientes] = useState([]);
  const [selectedIngredienteId, setSelectedIngredienteId] = useState('');
  const [esDefault, setEsDefault] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    // Cargar lista de todos los ingredientes para el selector
    axios.get('/api/ingredientes').then(res => {
      setTodosIngredientes(res.data.ingredientes || []);
      if(res.data.ingredientes?.length > 0) {
        setSelectedIngredienteId(res.data.ingredientes[0].id);
      }
    }).catch(err => console.error("Error al cargar ingredientes", err));

    if (productoId) {
      cargarIngredientesDelProducto(productoId);
    }
  }, [productoId]);

  const cargarIngredientesDelProducto = async (id) => {
    try {
      const { data } = await axios.get(`/api/producto_ingredientes/${id}`);
      setProductoIngredientes(data);
    } catch (err) {
      console.error("Error cargando ingredientes del producto", err);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { nombre, precio_base: Number(precioBase), tipo };
      const headers = { Authorization: `Bearer ${token}` };

      if (productoId) {
        await axios.put(`/api/productos/${productoId}`, payload, { headers });
        onSuccess();
        // No cerramos para permitir editar ingredientes
      } else {
        const { data } = await axios.post('/api/productos', payload, { headers });
        setProductoId(data.id); // Pasa a modo edición para poder agregar ingredientes
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = async () => {
    if (!productoId || !selectedIngredienteId) return;
    
    try {
      await axios.post('/api/producto_ingredientes', {
        producto_id: productoId,
        ingrediente_id: selectedIngredienteId,
        es_default: esDefault
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      cargarIngredientesDelProducto(productoId);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al agregar ingrediente');
    }
  };

  const handleRemoveIngredient = async (idRelacion) => {
    try {
      await axios.delete(`/api/producto_ingredientes/${idRelacion}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      cargarIngredientesDelProducto(productoId);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al remover ingrediente');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl my-8">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {productoId ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
          
          <form onSubmit={handleSaveProduct} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Bowl</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio Base ($)</label>
                <input
                  type="number"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  value={precioBase}
                  onChange={(e) => setPrecioBase(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Producto</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                >
                  <option value="simple">Simple</option>
                  <option value="personalizable">Personalizable</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Guardando...' : (productoId ? 'Actualizar Producto' : 'Crear Producto')}
              </button>
            </div>
          </form>

          {/* Sección de Ingredientes solo visible si el producto fue creado */}
          {productoId && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Ingredientes del Bowl</h3>
              
              <div className="flex gap-4 items-end mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ingrediente</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    value={selectedIngredienteId}
                    onChange={(e) => setSelectedIngredienteId(e.target.value)}
                  >
                    {todosIngredientes.map(ing => (
                      <option key={ing.id} value={ing.id}>{ing.nombre} ({ing.tipo}) - +${ing.precio_extra}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="esDefault"
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    checked={esDefault}
                    onChange={(e) => setEsDefault(e.target.checked)}
                  />
                  <label htmlFor="esDefault" className="ml-2 text-sm text-gray-700">Trae por defecto</label>
                </div>

                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors h-[42px]"
                >
                  <Plus size={18} />
                  Agregar
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Ingrediente</th>
                      <th className="px-4 py-3 font-medium">Tipo</th>
                      <th className="px-4 py-3 font-medium">Por defecto</th>
                      <th className="px-4 py-3 font-medium text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productoIngredientes.map(pi => (
                      <tr key={pi.id} className="border-t border-gray-200 bg-white">
                        <td className="px-4 py-3">{pi.nombre}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">{pi.tipo}</span>
                        </td>
                        <td className="px-4 py-3">
                          {pi.es_default ? (
                            <span className="text-green-600 font-medium">Sí</span>
                          ) : (
                            <span className="text-gray-400">No</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleRemoveIngredient(pi.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {productoIngredientes.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                          Este producto no tiene ingredientes asociados aún.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
