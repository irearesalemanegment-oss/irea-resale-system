import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, MapPin, Home, DollarSign, Share2, Phone, Mail, Calendar, Maximize } from 'lucide-react';
import api from '../services/api';

const PublicUnitPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnit();
  }, [id]);

  const fetchUnit = async () => {
    try {
      const response = await api.get(`/units/public/${id}`);
      setUnit(response.data);
    } catch (error) {
      console.error('Error fetching unit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `وحدة ${unit?.unit_code} - IREA`,
          text: `شوف الوحدة على IREA`,
          url: url,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('تم نسخ الرابط');
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'غير محدد';
    return new Intl.NumberFormat('ar-EG').format(price) + ' ج.م';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">الوحدة غير موجودة</h2>
          <button onClick={() => navigate('/')} className="text-blue-600 hover:underline">العودة للرئيسية</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-blue-600">IREA</h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">إدارة وحدات إعادة البيع</span>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Share2 size={18} />
              مشاركة الوحدة
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Unit Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {unit.unit_code}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      unit.status === 'available' ? 'bg-green-100 text-green-700' :
                      unit.status === 'sold' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {unit.status === 'available' ? 'متاح' : unit.status === 'sold' ? 'مباع' : 'محجوز'}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {unit.unit_type} - {unit.project_name || unit.compound_name || 'غير محدد'}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={18} />
                    <span>{[unit.area_name, unit.city_name, unit.country_name].filter(Boolean).join(', ') || unit.address || 'غير محدد'}</span>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500 mb-1">السعر</p>
                  <p className="text-3xl font-bold text-blue-600">{formatPrice(unit.total_price || unit.price)}</p>
                  {unit.payment_type === 'installment' && (
                    <p className="text-sm text-gray-600 mt-1">نظام التقسيط</p>
                  )}
                </div>
              </div>
            </div>

            {/* Unit Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Home size={24} className="text-blue-600" />
                تفاصيل الوحدة
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">رقم الوحدة</p>
                  <p className="font-semibold text-gray-900">{unit.unit_number || 'غير محدد'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">الدور</p>
                  <p className="font-semibold text-gray-900">{unit.floor || 'غير محدد'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">مساحة الوحدة</p>
                  <p className="font-semibold text-gray-900">{unit.bua ? unit.bua + ' م²' : 'غير محدد'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">المطور</p>
                  <p className="font-semibold text-gray-900">{unit.developer_name || 'غير محدد'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">المشروع</p>
                  <p className="font-semibold text-gray-900">{unit.project_name || unit.compound_name || 'غير محدد'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">نوع الوحدة</p>
                  <p className="font-semibold text-gray-900">{unit.unit_type || 'غير محدد'}</p>
                </div>
                {unit.garden_area && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">مساحة الحديقة</p>
                    <p className="font-semibold text-gray-900">{unit.garden_area} م²</p>
                  </div>
                )}
                {unit.terrace_area && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">مساحة التراس</p>
                    <p className="font-semibold text-gray-900">{unit.terrace_area} م²</p>
                  </div>
                )}
                {unit.external_area && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">مساحة خارجية</p>
                    <p className="font-semibold text-gray-900">{unit.external_area} م²</p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {unit.description && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">وصف الوحدة</h2>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{unit.description}</p>
              </div>
            )}

            {/* Installment Details */}
            {unit.payment_type === 'installment' && (unit.paid_amount || unit.installment_amount) && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign size={24} className="text-blue-600" />
                  تفاصيل التقسيط
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {unit.paid_amount && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">المدفوع</p>
                      <p className="font-semibold text-gray-900">{formatPrice(unit.paid_amount)}</p>
                    </div>
                  )}
                  {unit.required_offer && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">الأوفر المطلوب</p>
                      <p className="font-semibold text-gray-900">{formatPrice(unit.required_offer)}</p>
                    </div>
                  )}
                  {unit.installment_amount && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">قيمة القسط</p>
                      <p className="font-semibold text-gray-900">{formatPrice(unit.installment_amount)}</p>
                    </div>
                  )}
                  {unit.number_of_installments && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">عدد الأقساط</p>
                      <p className="font-semibold text-gray-900">{unit.number_of_installments} قسط</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">للتواصل والاستفسار</h3>
              <div className="space-y-3">
                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Share2 size={18} />
                  مشاركة الوحدة مع العميل
                </button>
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  طباعة التفاصيل
                </button>
              </div>
              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-gray-500 text-center">
                  كود الوحدة: {unit.unit_code}
                </p>
                <p className="text-xs text-gray-500 text-center mt-1">
                  تاريخ الإضافة: {new Date(unit.created_at).toLocaleDateString('ar-EG')}
                </p>
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-sm p-6 text-white">
              <h3 className="text-lg font-bold mb-2">IREA</h3>
              <p className="text-blue-100 text-sm mb-4">إدارة وحدات إعادة البيع العقارية</p>
              <p className="text-xs text-blue-200">
                جميع البيانات المعروضة هي لأغراض العرض فقط
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublicUnitPage;
