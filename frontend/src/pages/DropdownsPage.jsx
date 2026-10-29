import { useState, useEffect } from 'react';
import { Plus, Globe, Building2, MapPin, FolderKanban, Layers, Home } from 'lucide-react';
import api from '../services/api';

const DropdownsPage = () => {
  const [activeTab, setActiveTab] = useState('countries');
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [phases, setPhases] = useState([]);
  const [unitTypes, setUnitTypes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [c, ci, a, d, p, ph, ut] = await Promise.all([
        api.get('/dropdowns/countries'),
        api.get('/dropdowns/cities'),
        api.get('/dropdowns/areas'),
        api.get('/developers'),
        api.get('/dropdowns/projects'),
        api.get('/dropdowns/phases'),
        api.get('/dropdowns/unit-types')
      ]);
      setCountries(c.data);
      setCities(ci.data);
      setAreas(a.data);
      setDevelopers(d.data);
      setProjects(p.data);
      setPhases(ph.data);
      setUnitTypes(ut.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      let endpoint = '';
      if (activeTab === 'countries') endpoint = '/dropdowns/countries';
      else if (activeTab === 'cities') endpoint = '/dropdowns/cities';
      else if (activeTab === 'areas') endpoint = '/dropdowns/areas';
      else if (activeTab === 'projects') endpoint = '/dropdowns/projects';
      else if (activeTab === 'phases') endpoint = '/dropdowns/phases';
      else if (activeTab === 'unitTypes') endpoint = '/dropdowns/unit-types';
      
      await api.post(endpoint, formData);
      setShowForm(false);
      setFormData({});
      fetchAll();
    } catch (error) {
      alert('حدث خطأ');
    }
  };

  const tabs = [
    { id: 'countries', label: 'الدول', icon: Globe, data: countries },
    { id: 'cities', label: 'المدن', icon: MapPin, data: cities },
    { id: 'areas', label: 'المناطق', icon: MapPin, data: areas },
    { id: 'projects', label: 'المشاريع', icon: FolderKanban, data: projects },
    { id: 'phases', label: 'المراحل', icon: Layers, data: phases },
    { id: 'unitTypes', label: 'أنواع الوحدات', icon: Home, data: unitTypes },
  ];

  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة القوائم المنسدلة</h1>
          <p className="text-gray-600 mt-1">إضافة الدول والمدن والمناطق والمشاريع وأنواع الوحدات</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={20} />
          إضافة
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
              {activeTab === 'cities' && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الدولة</th>}
              {activeTab === 'areas' && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المدينة</th>}
              {activeTab === 'projects' && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المطور</th>}
              {activeTab === 'phases' && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المشروع</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentTab?.data.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                {activeTab === 'cities' && <td className="px-6 py-4 text-gray-600">{item.country_name}</td>}
                {activeTab === 'areas' && <td className="px-6 py-4 text-gray-600">{item.city_name}</td>}
                {activeTab === 'projects' && <td className="px-6 py-4 text-gray-600">{item.developer_name}</td>}
                {activeTab === 'phases' && <td className="px-6 py-4 text-gray-600">{item.project_name}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">إضافة {currentTab?.label}</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <input type="text" placeholder="الاسم" onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
              {activeTab === 'cities' && (
                <select onChange={(e) => setFormData({...formData, country_id: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required>
                  <option value="">اختر الدولة</option>
                  {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
              {activeTab === 'areas' && (
                <select onChange={(e) => setFormData({...formData, city_id: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required>
                  <option value="">اختر المدينة</option>
                  {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
              {activeTab === 'projects' && (
                <select onChange={(e) => setFormData({...formData, developer_id: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required>
                  <option value="">اختر المطور</option>
                  {developers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              )}
              {activeTab === 'phases' && (
                <select onChange={(e) => setFormData({...formData, project_id: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required>
                  <option value="">اختر المشروع</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              )}
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg">حفظ</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 py-2 rounded-lg">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownsPage;
