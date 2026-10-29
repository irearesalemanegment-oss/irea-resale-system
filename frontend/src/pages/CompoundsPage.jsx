import { useEffect, useState, useMemo } from 'react';
import { compoundsAPI, developersAPI } from '../services/api';
import { 
  Plus, Search, Loader2, Building2, Edit, Trash2, X, 
  ChevronDown, ChevronUp, CheckCircle, XCircle, MapPin
} from 'lucide-react';

const CompoundForm = ({ compound, compounds, developers, onSubmit, onCancel, loading }) => {
  const [name, setName] = useState(compound?.name || '');
  const [developerId, setDeveloperId] = useState(compound?.developer_id || '');
  const [location, setLocation] = useState(compound?.location || '');
  const [isActive, setIsActive] = useState(compound?.is_active !== false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Compound name is required');
      return;
    }
    if (!developerId) {
      setError('Developer is required');
      return;
    }
    onSubmit({ 
      name: name.trim(), 
      developer_id: parseInt(developerId), 
      location: location.trim(), 
      is_active: isActive 
    });
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
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Compound Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Marassi, Hacienda, Madinaty"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Developer *</label>
        <select
          value={developerId}
          onChange={(e) => setDeveloperId(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        >
          <option value="">Select Developer</option>
          {developers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
        <textarea
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          rows={2}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., North Coast, KM 125 Alexandria-Matrouh Road"
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
          {compound ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

const CompoundsPage = () => {
  const [compounds, setCompounds] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCompound, setEditingCompound] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterDeveloper, setFilterDeveloper] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compsRes, devsRes] = await Promise.all([
        compoundsAPI.getAll({ is_active: true }),
        developersAPI.getAll({ is_active: true }),
      ]);
      setCompounds(compsRes.data.compounds);
      setDevelopers(devsRes.data.developers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editingCompound) {
        await compoundsAPI.update(editingCompound.id, data);
      } else {
        await compoundsAPI.create(data);
      }
      setShowForm(false);
      setEditingCompound(null);
      fetchData();
    } catch (err) {
      // Error handled in form component
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this compound?')) return;
    try {
      await compoundsAPI.delete(id);
      fetchData();
    } catch (err) {
      alert('Cannot delete compound. It may be referenced by units.');
    }
  };

  const filteredCompounds = useMemo(() => {
    return compounds.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.location?.toLowerCase().includes(search.toLowerCase());
      const matchesDeveloper = !filterDeveloper || c.developer_id === parseInt(filterDeveloper);
      return matchesSearch && matchesDeveloper;
    });
  }, [compounds, search, filterDeveloper]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compounds</h1>
          <p className="text-gray-600 mt-1">Manage property compounds and projects</p>
        </div>
        <button
          onClick={() => { setEditingCompound(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus size={18} />
          Add Compound
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search compounds, location..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="w-full sm:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Filter by Developer</label>
            <select
              value={filterDeveloper}
              onChange={(e) => setFilterDeveloper(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Developers</option>
              {developers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => { setShowForm(false); setEditingCompound(null); }} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md z-10">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingCompound ? 'Edit Compound' : 'Add Compound'}
              </h2>
              <button
                onClick={() => { setShowForm(false); setEditingCompound(null); }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <CompoundForm
                compound={editingCompound}
                compounds={compounds}
                developers={developers}
                onSubmit={handleSubmit}
                onCancel={() => { setShowForm(false); setEditingCompound(null); }}
                loading={submitting}
              />
            </div>
          </div>
        </div>
      )}

      {/* Compounds Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 size={32} className="animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-500">Loading compounds...</p>
          </div>
        ) : filteredCompounds.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No compounds found</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first compound</p>
            <button
              onClick={() => { setEditingCompound(null); setShowForm(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus size={18} />
              Add Compound
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Developer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCompounds.map(comp => (
                  <tr key={comp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <Building2 size={20} className="text-green-600" />
                        </div>
                        <span className="font-medium text-gray-900">{comp.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700">{comp.developer_name || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-1 text-sm text-gray-500 max-w-xs truncate">
                        <MapPin size={14} className="flex-shrink-0" />
                        <span className="truncate">{comp.location || 'Not specified'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        comp.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {comp.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditingCompound(comp); setShowForm(true); }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(comp.id)}
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

export default CompoundsPage;