import { useState, useEffect } from 'react';
import { FileText, Clock } from 'lucide-react';
import api from '../services/api';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  useEffect(() => {
    fetchLogs();
  }, [pagination.page]);

  const fetchLogs = async () => {
    try {
      const response = await api.get(`/audit?page=${pagination.page}&limit=50`);
      setLogs(response.data.logs);
      setPagination(prev => ({ ...prev, totalPages: response.data.pagination.totalPages }));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">سجل التدقيق العام</h1>
        <p className="text-gray-600 mt-1">جميع الإضافات والتعديلات والحذفات في النظام</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200">
          {logs.map(log => (
            <div key={log.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="text-blue-600" size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900">{log.user_name} <span className="text-gray-500 font-normal">({log.user_role})</span></p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock size={14} />
                      {new Date(log.created_at).toLocaleString('ar-EG')}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{log.details}</p>
                  {log.action && <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{log.action}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPagination(p => ({...p, page: p.page - 1}))} disabled={pagination.page === 1} className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50">السابق</button>
          <span className="px-4 py-2">صفحة {pagination.page} من {pagination.totalPages}</span>
          <button onClick={() => setPagination(p => ({...p, page: p.page + 1}))} disabled={pagination.page === pagination.totalPages} className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50">التالي</button>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;
