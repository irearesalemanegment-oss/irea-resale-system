import { useEffect, useState } from 'react';
import { developersAPI } from '../services/api';
import { 
  Plus, Search, Loader2, Building2, Edit, Trash2, X, 
  ChevronDown, ChevronUp, CheckCircle, XCircle
} from 'lucide-react';

const DeveloperForm = ({ developer, developers, onSubmit, onCancel, loading }) => {
  const [name, setName] = useState(developer?.name || '');
  const [isActive, setIsActive] = useState(developer?.is_active !== false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Developer name is required');
      return;
    }
    onSubmit({ name: name.trim(), is_active: isActive });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <XCircle size={18} />
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Developer Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Emaar, SODIC, Palm Hills"
          disabled={loading}
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="is_active"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          disabled={loading}
        />
        <label htmlFor="is_active" className="text-sm text-gray-700 cursor-pointer">
          Active
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {developer ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

const DevelopersPage = () => {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDeveloper, setEditingDeveloper] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const fetchDevelopers = async () => {
    setLoading(true);
    try {
      const res = await developersAPI.getAll({ is_active: true });
      setDevelopers(res.data.developers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editingDeveloper) {
        await developersAPI.update(editingDeveloper.id, data);
      } else {
        await developersAPI.create(data);
      }
      setShowForm(false);
      setEditingDeveloper(null);
      fetchDevelopers();
    } catch (err) {
      // Error handled in form component
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this developer?')) return;
    try {
      await developersAPI.delete(id);
      fetchDevelopers();
    } catch (err) {
      alert('Cannot delete developer. It may be referenced by compounds or units.');
    }
  };

  const filteredDevelopers = developers.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Developers</h1>
          <p className="text-gray-600 mt-1">Manage property developers</p>
        </div>
        <button
          onClick={() => { setEditingDeveloper(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus size={18} />
          Add Developer
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search developers..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => { setShowForm(false); setEditingDeveloper(null); }} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md z-10">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingDeveloper ? 'Edit Developer' : 'Add Developer'}
              </h2>
              <button
                onClick={() => { setShowForm(false); setEditingDeveloper(null); }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <DeveloperForm
                developer={editingDeveloper}
                developers={developers}
                onSubmit={handleSubmit}
                onCancel={() => { setShowForm(false); setEditingDeveloper(null); }}
                loading={submitting}
              />
            </div>
          </div>
        </div>
      )}

      {/* Developers Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 size={32} className="animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-500">Loading developers...</p>
          </div>
        ) : filteredDevelopers.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No developers found</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first developer</p>
            <button
              onClick={() => { setEditingDeveloper(null); setShowForm(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus size={18} />
              Add Developer
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDevelopers.map(dev => (
                  <tr key={dev.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Building2 size={20} className="text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900">{dev.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        dev.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {dev.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(dev.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', month: 'short', day: 'numeric' 
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditingDeveloper(dev); setShowForm(true); }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(dev.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevelopersPage;