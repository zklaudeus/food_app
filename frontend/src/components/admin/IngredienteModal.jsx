import { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export default function IngredienteModal({ isOpen, onClose, selectedIngrediente, onSuccess }) {
  const [nombre, setNombre] = useState(selectedIngrediente?.nombre || '');
  const [precioExtra, setPrecioExtra] = useState(selectedIngrediente?.precio_extra || 0);
  const [tipo, setTipo] = useState(selectedIngrediente?.tipo || 'base');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const token = useAuthStore(state => state.token);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { nombre, precio_extra: Number(precioExtra), tipo };
      const headers = { Authorization: `Bearer ${token}` };

      if (selectedIngrediente?.id) {
        await axios.put(`/api/ingredientes/${selectedIngrediente.id}`, payload, { headers });
      } else {
        await axios.post('/api/ingredientes', payload, { headers });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el ingrediente');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {selectedIngrediente ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
          
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio Extra ($)</label>
              <input
                type="number"
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                value={precioExtra}
                onChange={(e) => setPrecioExtra(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Ingrediente</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                <option value="base">Base</option>
                <option value="proteina">Proteína</option>
                <option value="extra">Extra</option>
                <option value="salsa">Salsa</option>
              </select>
            </div>

            <div className="flex justify-end pt-4 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
