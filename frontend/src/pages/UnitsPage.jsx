import { useState, useEffect } from 'react';
import { Plus, Search, Share2, Eye, MapPin, Home, Maximize, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import UnitFormNew from '../components/UnitFormNew';

const UnitsPage = () => {
  const { user } = useAuth();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', unit_type: '', payment_type: '', status: '' });
  const [viewMode, setViewMode] = useState('grid');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchUnits();
  }, [filters]);

  const fetchUnits = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await api.get(`/units?${params.toString()}`);
      setUnits(response.data.units || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (unit) => {
    const url = `${window.location.origin}/share/unit/${unit.id}`;
    if (navigator.share) {
      navigator.share({ title: `وحدة ${unit.unit_code} - IREA`, url });
    } else {
      navigator.clipboard.writeText(url);
      alert('تم نسخ الرابط بنجاح: ' + url);
    }
  };

  const requestVisibility = async (unitId) => {
    try {
      await api.post('/visibility/request', { unit_id: unitId, reason: 'طلب إظهار بيانات المالك' });
      alert('تم إرسال طلب إظهار البيانات بنجاح، بانتظار موافقة المالك أو الآدمن');
      fetchUnits();
    } catch (error) {
      alert(error.response?.data?.error || 'حدث خطأ');
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'غير محدد';
    return new Intl.NumberFormat('ar-EG').format(price) + ' ج.م';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">جميع الوحدات</h1>
          <p className="text-gray-600 mt-1">عرض احترافي لجميع وحدات إعادة البيع - {units.length} وحدة</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">
            {viewMode === 'grid' ? 'عرض قائمة' : 'عرض شبكة'}
          </button>
          {(user?.role === 'owner' || user?.role === 'admin' || user?.role === 'manager' || user?.role === 'supervisor' || user?.role === 'employee') && (
            <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30">
              <Plus size={20} />
              إضافة وحدة جديدة
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-xl shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="ابحث بكود الوحدة، نوع الوحدة، المشروع..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select value={filters.unit_type} onChange={(e) => setFilters({...filters, unit_type: e.target.value})} className="px-4 py-2.5 border border-gray-300 rounded-lg">
            <option value="">كل أنواع الوحدات</option>
            <option value="شقة">شقة</option>
            <option value="دوبلكس">دوبلكس</option>
            <option value="بنتهاوس">بنتهاوس</option>
            <option value="تاون هاوس">تاون هاوس</option>
            <option value="فيلا">فيلا</option>
            <option value="محل تجاري">محل تجاري</option>
          </select>
          <select value={filters.payment_type} onChange={(e) => setFilters({...filters, payment_type: e.target.value})} className="px-4 py-2.5 border border-gray-300 rounded-lg">
            <option value="">كل طرق الدفع</option>
            <option value="cash">كاش</option>
            <option value="installment">تقسيط</option>
          </select>
        </div>
      </div>

      {/* Units Grid */}
      <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
        {units.map((unit) => (
          <div key={unit.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group">
            {/* Image Header */}
            <div className="relative h-56 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute top-4 right-4 flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                  unit.status === 'available' ? 'bg-emerald-500 text-white' :
                  unit.status === 'sold' ? 'bg-red-500 text-white' :
                  'bg-amber-500 text-white'
                }`}>
                  {unit.status === 'available' ? '● متاح' : unit.status === 'sold' ? '● مباع' : '● محجوز'}
                </span>
              </div>
              <div className="absolute bottom-4 right-4">
                <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-gray-900 rounded-lg text-sm font-bold shadow-lg">
                  {unit.unit_code}
                </span>
              </div>
              <div className="absolute bottom-4 left-4">
                <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-lg font-bold shadow-lg">
                  {formatPrice(unit.total_price || unit.price)}
                </span>
              </div>
            </div>

            <div className="p-5">
              {/* Title */}
              <div className="mb-3">
                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {unit.unit_type}
                </h3>
                <p className="text-gray-600 flex items-center gap-1 text-sm">
                  <MapPin size={14} />
                  {unit.project_name || unit.developer_name || 'غير محدد'}
                  {unit.city_name && ` - ${unit.city_name}`}
                </p>
              </div>

              {/* Specs */}
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                {unit.bua && (
                  <div className="flex items-center gap-1">
                    <Maximize size={16} className="text-blue-600" />
                    <span>{unit.bua} م²</span>
                  </div>
                )}
                {unit.floor && (
                  <div className="flex items-center gap-1">
                    <Home size={16} className="text-blue-600" />
                    <span>الدور {unit.floor}</span>
                  </div>
                )}
                {unit.unit_number && (
                  <div className="flex items-center gap-1">
                    <span className="text-blue-600">#</span>
                    <span>وحدة {unit.unit_number}</span>
                  </div>
                )}
              </div>

              {/* Payment Info */}
              {unit.payment_type === 'installment' && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <p className="text-xs font-semibold text-amber-800 mb-1">نظام التقسيط</p>
                  {unit.installment_amount && (
                    <p className="text-sm text-amber-700">قسط: {formatPrice(unit.installment_amount)} {unit.number_of_installments ? `× ${unit.number_of_installments}` : ''}</p>
                  )}
                </div>
              )}

              {/* Owner Data */}
              {unit.data_hidden ? (
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-300 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock size={16} className="text-yellow-700" />
                    <span className="text-sm font-semibold text-yellow-800">بيانات المالك مخفية</span>
                  </div>
                  {(user?.role === 'manager' || user?.role === 'supervisor') && (
                    <button onClick={() => requestVisibility(unit.id)} className="w-full px-3 py-1.5 bg-yellow-600 text-white rounded-lg text-xs hover:bg-yellow-700 transition-colors">
                      طلب إظهار بيانات المالك
                    </button>
                  )}
                  {user?.role === 'employee' && (
                    <p className="text-xs text-yellow-700">يمكنك رؤية وحداتك فقط ببيانات كاملة</p>
                  )}
                </div>
              ) : (
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-300 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-emerald-800">بيانات المالك</span>
                  </div>
                  {unit.owner_name && <p className="text-sm text-emerald-700 font-medium">{unit.owner_name}</p>}
                  {unit.owner_phone && <p className="text-sm text-emerald-700">{unit.owner_phone}</p>}
                  {Array.isArray(unit.owner_phones) && unit.owner_phones.map((p, i) => (
                    <p key={i} className="text-sm text-emerald-700">{p}</p>
                  ))}
                </div>
              )}

              {/* Added by */}
              <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
                <span>أضيف بواسطة: {unit.created_by_name || 'غير محدد'}</span>
                <span>{new Date(unit.created_at).toLocaleDateString('ar-EG')}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <a href={`/share/unit/${unit.id}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                  <Eye size={18} />
                  معاينة
                </a>
                <button onClick={() => handleShare(unit)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-lg shadow-blue-500/30">
                  <Share2 size={18} />
                  مشاركة مع العميل
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {units.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <Home className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد وحدات</h3>
          <p className="text-gray-500">لم يتم العثور على وحدات تطابق معايير البحث</p>
        </div>
      )}

      {showAddForm && (
        <UnitFormNew onClose={() => setShowAddForm(false)} onSuccess={fetchUnits} />
      )}
    </div>
  );
};

export default UnitsPage;
