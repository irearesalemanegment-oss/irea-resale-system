import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { X, Plus, ImagePlus, Video } from 'lucide-react';

const UnitFormNew = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    unit_number: '', developer_id: '', compound_id: '', project_id: '', phase_id: '',
    country_id: '', city_id: '', area_id: '', unit_type: '', address: '', floor: '',
    land_area: '', bua: '', garden_area: '', terrace_area: '', external_area: '',
    payment_type: 'cash', total_price: '', price: '', paid_amount: '', required_offer: '', installment_amount: '', number_of_installments: '',
    description: '', status: 'available', owner_name: '', owner_phone: '', owner_phones: [], owner_email: ''
  });
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [phases, setPhases] = useState([]);
  const [unitTypes, setUnitTypes] = useState([]);
  const [additionalPhones, setAdditionalPhones] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    if (formData.country_id) fetchCities(formData.country_id);
  }, [formData.country_id]);

  useEffect(() => {
    if (formData.city_id) fetchAreas(formData.city_id);
  }, [formData.city_id]);

  useEffect(() => {
    if (formData.developer_id) fetchProjects(formData.developer_id);
  }, [formData.developer_id]);

  useEffect(() => {
    if (formData.project_id) fetchPhases(formData.project_id);
  }, [formData.project_id]);

  const fetchDropdowns = async () => {
    try {
      const [c, d, ut] = await Promise.all([
        api.get('/dropdowns/countries'),
        api.get('/developers'),
        api.get('/dropdowns/unit-types')
      ]);
      setCountries(c.data);
      setDevelopers(d.data);
      setUnitTypes(ut.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchCities = async (countryId) => {
    const res = await api.get(`/dropdowns/cities?country_id=${countryId}`);
    setCities(res.data);
  };

  const fetchAreas = async (cityId) => {
    const res = await api.get(`/dropdowns/areas?city_id=${cityId}`);
    setAreas(res.data);
  };

  const fetchProjects = async (devId) => {
    const res = await api.get(`/dropdowns/projects?developer_id=${devId}`);
    setProjects(res.data);
  };

  const fetchPhases = async (projId) => {
    const res = await api.get(`/dropdowns/phases?project_id=${projId}`);
    setPhases(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...formData, owner_phones: additionalPhones.filter(p => p.trim()) };
      await api.post('/units', data);
      alert('تم إضافة الوحدة بنجاح');
      onSuccess();
      onClose();
    } catch (error) {
      alert(error.response?.data?.error || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const showGarden = formData.unit_type === 'دوبلكس' || formData.unit_type === 'شقة بحديقة';
  const showTerrace = formData.unit_type === 'بنتهاوس';
  const showExternal = formData.unit_type === 'محل تجاري';
  const showInstallment = formData.payment_type === 'installment';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">إضافة وحدة جديدة</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* بيانات العميل */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-blue-600">١. بيانات العميل</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" placeholder="اسم العميل *" value={formData.owner_name} onChange={(e) => setFormData({...formData, owner_name: e.target.value})} className="px-4 py-2 border rounded-lg" required />
              <input type="tel" placeholder="رقم هاتف المالك *" value={formData.owner_phone} onChange={(e) => setFormData({...formData, owner_phone: e.target.value})} className="px-4 py-2 border rounded-lg" required />
              <input type="email" placeholder="البريد الإلكتروني" value={formData.owner_email} onChange={(e) => setFormData({...formData, owner_email: e.target.value})} className="px-4 py-2 border rounded-lg" />
            </div>
            <div className="mt-3 space-y-2">
              {additionalPhones.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <input type="tel" value={p} onChange={(e) => { const arr = [...additionalPhones]; arr[i] = e.target.value; setAdditionalPhones(arr); }} className="flex-1 px-4 py-2 border rounded-lg" placeholder="رقم هاتف إضافي" />
                  <button type="button" onClick={() => setAdditionalPhones(additionalPhones.filter((_,idx) => idx !== i))} className="px-3 py-2 bg-red-100 text-red-600 rounded-lg">حذف</button>
                </div>
              ))}
              <button type="button" onClick={() => setAdditionalPhones([...additionalPhones, ''])} className="flex items-center gap-1 text-blue-600 text-sm"><Plus size={16} /> إضافة رقم آخر</button>
            </div>
          </section>

          {/* بيانات الموقع */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-blue-600">٢. موقع الوحدة</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select value={formData.country_id} onChange={(e) => setFormData({...formData, country_id: e.target.value, city_id: '', area_id: ''})} className="px-4 py-2 border rounded-lg">
                <option value="">اختر الدولة *</option>
                {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={formData.city_id} onChange={(e) => setFormData({...formData, city_id: e.target.value, area_id: ''})} className="px-4 py-2 border rounded-lg" disabled={!formData.country_id}>
                <option value="">اختر المدينة *</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={formData.area_id} onChange={(e) => setFormData({...formData, area_id: e.target.value})} className="px-4 py-2 border rounded-lg" disabled={!formData.city_id}>
                <option value="">اختر المنطقة *</option>
                {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <select value={formData.developer_id} onChange={(e) => setFormData({...formData, developer_id: e.target.value, project_id: '', phase_id: ''})} className="px-4 py-2 border rounded-lg">
                <option value="">اختر المطور *</option>
                {developers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <select value={formData.project_id} onChange={(e) => setFormData({...formData, project_id: e.target.value, phase_id: ''})} className="px-4 py-2 border rounded-lg" disabled={!formData.developer_id}>
                <option value="">اختر المشروع *</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={formData.phase_id} onChange={(e) => setFormData({...formData, phase_id: e.target.value})} className="px-4 py-2 border rounded-lg" disabled={!formData.project_id}>
                <option value="">اختر المرحلة</option>
                {phases.map(ph => <option key={ph.id} value={ph.id}>{ph.name}</option>)}
              </select>
            </div>
            <input type="text" placeholder="العنوان التفصيلي (اختياري)" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full mt-4 px-4 py-2 border rounded-lg" />
          </section>

          {/* بيانات الوحدة */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-blue-600">٣. بيانات الوحدة</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select value={formData.unit_type} onChange={(e) => setFormData({...formData, unit_type: e.target.value})} className="px-4 py-2 border rounded-lg">
                <option value="">نوع الوحدة *</option>
                <option value="شقة">شقة</option>
                <option value="دوبلكس">دوبلكس</option>
                <option value="بنتهاوس">بنتهاوس</option>
                <option value="تاون هاوس">تاون هاوس</option>
                <option value="فيلا">فيلا</option>
                <option value="محل تجاري">محل تجاري</option>
              </select>
              <input type="text" placeholder="رقم الوحدة *" value={formData.unit_number} onChange={(e) => setFormData({...formData, unit_number: e.target.value})} className="px-4 py-2 border rounded-lg" required />
              <input type="text" placeholder="الدور *" value={formData.floor} onChange={(e) => setFormData({...formData, floor: e.target.value})} className="px-4 py-2 border rounded-lg" required />
              <input type="number" placeholder="مساحة الوحدة م² *" value={formData.bua} onChange={(e) => setFormData({...formData, bua: e.target.value})} className="px-4 py-2 border rounded-lg" required />
              {showGarden && <input type="number" placeholder="مساحة الحديقة م²" value={formData.garden_area} onChange={(e) => setFormData({...formData, garden_area: e.target.value})} className="px-4 py-2 border rounded-lg" />}
              {showTerrace && <input type="number" placeholder="مساحة التراس م²" value={formData.terrace_area} onChange={(e) => setFormData({...formData, terrace_area: e.target.value})} className="px-4 py-2 border rounded-lg" />}
              {showExternal && <input type="number" placeholder="المساحة الخارجية م²" value={formData.external_area} onChange={(e) => setFormData({...formData, external_area: e.target.value})} className="px-4 py-2 border rounded-lg" />}
            </div>
          </section>

          {/* السعر والدفع */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-blue-600">٤. السعر ونظام الدفع</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select value={formData.payment_type} onChange={(e) => setFormData({...formData, payment_type: e.target.value})} className="px-4 py-2 border rounded-lg">
                <option value="cash">كاش</option>
                <option value="installment">تقسيط</option>
              </select>
              <input type="number" placeholder="سعر الوحدة الإجمالي *" value={formData.total_price} onChange={(e) => setFormData({...formData, total_price: e.target.value, price: e.target.value})} className="px-4 py-2 border rounded-lg" required />
              {showInstallment && <input type="number" placeholder="المبلغ المدفوع" value={formData.paid_amount} onChange={(e) => setFormData({...formData, paid_amount: e.target.value})} className="px-4 py-2 border rounded-lg" />}
              {showInstallment && <input type="number" placeholder="الأوفر المطلوب من المالك" value={formData.required_offer} onChange={(e) => setFormData({...formData, required_offer: e.target.value})} className="px-4 py-2 border rounded-lg" />}
              {showInstallment && <input type="number" placeholder="قيمة القسط" value={formData.installment_amount} onChange={(e) => setFormData({...formData, installment_amount: e.target.value})} className="px-4 py-2 border rounded-lg" />}
              {showInstallment && <input type="number" placeholder="عدد الأقساط" value={formData.number_of_installments} onChange={(e) => setFormData({...formData, number_of_installments: e.target.value})} className="px-4 py-2 border rounded-lg" />}
            </div>
          </section>

          {/* الوصف */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-blue-600">٥. وصف الوحدة</h3>
            <textarea placeholder="وصف الوحدة والتفاصيل الإضافية..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg" rows="4" />
          </section>

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'جاري الحفظ...' : 'حفظ الوحدة'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 py-3 rounded-lg hover:bg-gray-200">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnitFormNew;
