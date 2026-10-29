import { useState, useEffect } from 'react';
import { Check, X, Eye } from 'lucide-react';
import api from '../services/api';

const VisibilityRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/visibility/pending');
      setRequests(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/visibility/${id}/approve`);
      fetchRequests();
      alert('تم قبول الطلب');
    } catch (error) {
      alert('حدث خطأ');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/visibility/${id}/reject`);
      fetchRequests();
      alert('تم رفض الطلب');
    } catch (error) {
      alert('حدث خطأ');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">طلبات إظهار بيانات المالك</h1>
        <p className="text-gray-600 mt-1">الموافقة أو رفض طلبات المشرفين والمديرين</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Eye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">لا توجد طلبات معلقة</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(request => (
            <div key={request.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {request.unit_code}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {request.requester_role}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{request.requester_name}</h3>
                  <p className="text-sm text-gray-600 mb-2">يطلب إظهار بيانات المالك للوحدة {request.unit_number}</p>
                  {request.reason && <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded">السبب: {request.reason}</p>}
                  <p className="text-xs text-gray-400 mt-2">{new Date(request.created_at).toLocaleString('ar-EG')}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(request.id)} className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <Check size={18} />
                    قبول
                  </button>
                  <button onClick={() => handleReject(request.id)} className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    <X size={18} />
                    رفض
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VisibilityRequestsPage;
