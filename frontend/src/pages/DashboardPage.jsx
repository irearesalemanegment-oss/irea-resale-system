import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { unitsAPI, reportsAPI } from '../services/api';
import { 
  LayoutDashboard, Building2, ListChecks, TrendingUp, DollarSign, 
  Home, ArrowUpRight, ArrowDownRight, BarChart3, PieChart, LineChart 
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl border p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${color.bg}`}>
        <Icon size={24} className={color.icon} />
      </div>
    </div>
  </div>
);

const DashboardPage = () => {
  const { hasRole } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, reportsRes] = await Promise.all([
          unitsAPI.getStats(),
          reportsAPI.getStatistics(),
        ]);
        setStats({
          ...statsRes.data,
          detailed: reportsRes.data
        });
      } catch (err) {
        setError('Failed to load statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl border p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const overview = stats?.overview || {};
  const detailed = stats?.detailed || {};
  const byDeveloper = stats?.byDeveloper || [];
  const byCompound = stats?.byCompound || [];
  const byStatus = detailed?.byStatus || [];

  // Chart data
  const developerChartData = {
    labels: byDeveloper.map(d => d.name),
    datasets: [
      {
        label: 'Total Units',
        data: byDeveloper.map(d => d.total_units),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Sold Units',
        data: byDeveloper.map(d => d.sold_units),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  const statusChartData = {
    labels: byStatus.map(s => s.status),
    datasets: [
      {
        data: byStatus.map(s => s.count),
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)',   // available - green
          'rgba(239, 68, 68, 0.7)',    // sold - red
          'rgba(245, 158, 11, 0.7)',   // reserved - amber
          'rgba(59, 130, 246, 0.7)',   // rented - blue
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(59, 130, 246, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const compoundChartData = {
    labels: byCompound.map(c => c.name),
    datasets: [
      {
        label: 'Units',
        data: byCompound.map(c => c.total_units),
        backgroundColor: 'rgba(139, 92, 246, 0.6)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your resale units portfolio</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Units"
          value={overview.total_units || 0}
          icon={ListChecks}
          color={{ bg: 'bg-blue-100', icon: 'text-blue-600' }}
        />
        <StatCard
          title="Available"
          value={overview.available || 0}
          icon={Home}
          color={{ bg: 'bg-green-100', icon: 'text-green-600' }}
        />
        <StatCard
          title="Sold"
          value={overview.sold || 0}
          icon={TrendingUp}
          color={{ bg: 'bg-purple-100', icon: 'text-purple-600' }}
        />
        <StatCard
          title="Rented"
          value={overview.rented || 0}
          icon={Home}
          color={{ bg: 'bg-blue-100', icon: 'text-blue-600' }}
        />
        <StatCard
          title="Avg Price"
          value={overview.avg_price ? new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(overview.avg_price) : 'EGP 0'}
          icon={DollarSign}
          color={{ bg: 'bg-orange-100', icon: 'text-orange-600' }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Units by Developer - Bar Chart */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Units by Developer</h2>
          </div>
          <div className="h-64">
            {byDeveloper.length > 0 ? (
              <Bar data={developerChartData} options={chartOptions} />
            ) : (
              <p className="text-gray-500 text-center py-4">No data available</p>
            )}
          </div>
        </div>

        {/* Units by Status - Pie Chart */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart size={20} className="text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Units by Status</h2>
          </div>
          <div className="h-64">
            {byStatus.length > 0 ? (
              <Pie data={statusChartData} options={chartOptions} />
            ) : (
              <p className="text-gray-500 text-center py-4">No data available</p>
            )}
          </div>
        </div>

        {/* Units by Compound - Bar Chart */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={20} className="text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Units by Compound</h2>
          </div>
          <div className="h-64">
            {byCompound.length > 0 ? (
              <Bar data={compoundChartData} options={chartOptions} />
            ) : (
              <p className="text-gray-500 text-center py-4">No data available</p>
            )}
          </div>
        </div>

        {/* Developer Performance Summary */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">Developer Performance</h2>
          </div>
          <div className="space-y-3">
            {byDeveloper.length > 0 ? (
              byDeveloper.map((dev) => (
                <div key={dev.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Building2 size={16} className="text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{dev.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">{dev.total_units} units</span>
                    <span className="text-sm font-semibold text-green-600">
                      {dev.sales_value ? new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(dev.sales_value) : 'EGP 0'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <a href="/units/new" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            <ListChecks size={18} />
            Add New Unit
          </a>
          {hasRole(['admin', 'manager']) && (
            <>
              <a href="/developers/new" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                <Building2 size={18} />
                Add Developer
              </a>
              <a href="/compounds/new" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                <Building2 size={18} />
                Add Compound
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
