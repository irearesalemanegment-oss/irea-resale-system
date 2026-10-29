import { useState, useEffect } from 'react';
import { UsersRound, Plus, ArrowRightLeft, UserCheck } from 'lucide-react';
import api from '../services/api';

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [transferLogs, setTransferLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [transferData, setTransferData] = useState({ user_id: '', to_team_id: '', transfer_option: 'transfer_with_units', notes: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamsRes, usersRes, logsRes] = await Promise.all([
        api.get('/teams'),
        api.get('/users'),
        api.get('/teams/transfers/logs')
      ]);
      setTeams(teamsRes.data);
      setUsers(usersRes.data);
      setTransferLogs(logsRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      await api.post('/teams', formData);
      setShowCreateTeam(false);
      setFormData({ name: '', description: '' });
      fetchData();
    } catch (error) {
      alert('حدث خطأ');
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      await api.post('/teams/transfer', transferData);
      setShowTransfer(false);
      setTransferData({ user_id: '', to_team_id: '', transfer_option: 'transfer_with_units', notes: '' });
      fetchData();
      alert('تم نقل الموظف بنجاح');
    } catch (error) {
      alert('حدث خطأ');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة فرق العمل</h1>
          <p className="text-gray-600 mt-1">إنشاء الفرق ونقل الموظفين بين الفرق</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowLogs(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            سجل النقل
          </button>
          <button onClick={() => setShowTransfer(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <ArrowRightLeft size={20} />
            نقل موظف
          </button>
          <button onClick={() => setShowCreateTeam(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus size={20} />
            إضافة فريق
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map(team => (
          <div key={team.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UsersRound className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{team.name}</h3>
                <p className="text-sm text-gray-500">{team.member_count} عضو</p>
              </div>
            </div>
            {team.description && <p className="text-sm text-gray-600">{team.description}</p>}
          </div>
        ))}
      </div>

      {showCreateTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">إضافة فريق جديد</h2>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <input type="text" placeholder="اسم الفريق" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
              <textarea placeholder="الوصف" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg" rows="3" />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg">حفظ</button>
                <button type="button" onClick={() => setShowCreateTeam(false)} className="flex-1 bg-gray-100 py-2 rounded-lg">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTransfer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">نقل موظف بين الفرق</h2>
            <form onSubmit={handleTransfer} className="space-y-4">
              <select value={transferData.user_id} onChange={(e) => setTransferData({...transferData, user_id: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required>
                <option value="">اختر الموظف</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.full_name} - {u.role_name}</option>)}
              </select>
              <select value={transferData.to_team_id} onChange={(e) => setTransferData({...transferData, to_team_id: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required>
                <option value="">اختر الفريق الجديد</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="radio" value="transfer_with_units" checked={transferData.transfer_option === 'transfer_with_units'} onChange={(e) => setTransferData({...transferData, transfer_option: e.target.value})} />
                  <span>نقل بجميع الوحدات</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" value="transfer_without_units" checked={transferData.transfer_option === 'transfer_without_units'} onChange={(e) => setTransferData({...transferData, transfer_option: e.target.value})} />
                  <span>نقل بدون الوحدات</span>
                </label>
              </div>
              <textarea placeholder="ملاحظات" value={transferData.notes} onChange={(e) => setTransferData({...transferData, notes: e.target.value})} className="w-full px-4 py-2 border rounded-lg" rows="2" />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-lg">نقل</button>
                <button type="button" onClick={() => setShowTransfer(false)} className="flex-1 bg-gray-100 py-2 rounded-lg">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLogs && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">سجل نقل الموظفين</h2>
              <button onClick={() => setShowLogs(false)} className="text-gray-500">✕</button>
            </div>
            <div className="space-y-2">
              {transferLogs.map(log => (
                <div key={log.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">{log.employee_name}</span>
                    <span className="text-sm text-gray-500">{new Date(log.created_at).toLocaleString('ar-EG')}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {log.from_team_name || 'بدون فريق'} → {log.to_team_name || 'بدون فريق'} | 
                    {log.transfer_option === 'transfer_with_units' ? ' نقل بجميع الوحدات' : ' نقل بدون الوحدات'} | 
                    عدد الوحدات: {log.units_affected}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">تم النقل بواسطة: {log.transferred_by_name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
