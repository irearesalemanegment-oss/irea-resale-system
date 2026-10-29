import { useState, useEffect } from 'react';
import { Users, Shield, UserRound } from 'lucide-react';
import api from '../services/api';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, rolesRes, teamsRes] = await Promise.all([
        api.get('/users'),
        api.get('/roles'),
        api.get('/teams')
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
      setTeams(teamsRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId, roleId) => {
    try {
      await api.put(`/users/${userId}/role`, { role_id: roleId });
      fetchData();
    } catch (error) {
      alert('حدث خطأ');
    }
  };

  const updateTeam = async (userId, teamId) => {
    try {
      await api.put(`/users/${userId}/team`, { team_id: teamId || null });
      fetchData();
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
        <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
        <p className="text-gray-600 mt-1">تعيين الأدوار والفرق للمستخدمين</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المستخدم</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">البريد الإلكتروني</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الدور</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الفريق</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">{user.full_name?.charAt(0)}</span>
                    </div>
                    <span className="font-medium text-gray-900">{user.full_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <select value={user.role_id || ''} onChange={(e) => updateRole(user.id, e.target.value)} className="px-3 py-1.5 border rounded-lg text-sm">
                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </td>
                <td className="px-6 py-4">
                  <select value={user.team_id || ''} onChange={(e) => updateTeam(user.id, e.target.value)} className="px-3 py-1.5 border rounded-lg text-sm">
                    <option value="">بدون فريق</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.is_active ? 'نشط' : 'معطل'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;
