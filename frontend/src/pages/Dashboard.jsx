import { useState, useEffect } from 'react';
import { getDailyReport, getTables, getOrders } from '../services/api';
import { FiDollarSign, FiShoppingBag, FiGrid, FiClock, FiShoppingCart } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [report, setReport] = useState({ total_sales: 0, total_bills: 0 });
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportRes, tablesRes, ordersRes] = await Promise.all([
          getDailyReport(),
          getTables(),
          getOrders()
        ]);
        setReport(reportRes.data);
        setTables(tablesRes.data);
        setOrders(ordersRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeTables = tables.filter(t => t.status !== 'Available').length;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;

  if (loading) return <div>Loading dashboard...</div>;

  const stats = [
    { title: 'Total Revenue Today', value: `₹${report.total_sales.toFixed(2)}`, icon: <FiDollarSign />, color: 'bg-green-100 text-green-600' },
    { title: 'Completed Bills', value: report.total_bills, icon: <FiShoppingBag />, color: 'bg-blue-100 text-blue-600' },
    { title: 'Active Tables', value: activeTables, icon: <FiGrid />, color: 'bg-orange-100 text-orange-600' },
    { title: 'Pending Orders', value: pendingOrders, icon: <FiClock />, color: 'bg-red-100 text-red-600' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="cafe-card flex items-center">
            <div className={`p-4 rounded-full ${stat.color} mr-4`}>
              <div className="text-2xl">{stat.icon}</div>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="cafe-card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/pos" className="bg-primary text-white p-4 rounded-xl text-center hover:bg-accent transition-colors shadow-sm flex flex-col items-center justify-center">
              <FiShoppingCart className="text-3xl mb-2" />
              <span className="font-medium">New Order (POS)</span>
            </Link>
            <Link to="/tables" className="bg-white border-2 border-primary text-primary p-4 rounded-xl text-center hover:bg-primary hover:text-white transition-colors shadow-sm flex flex-col items-center justify-center">
              <FiGrid className="text-3xl mb-2" />
              <span className="font-medium">Manage Tables</span>
            </Link>
          </div>
        </div>

        {/* Recent Pending Orders */}
        <div className="cafe-card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Pending Orders</h2>
          {pendingOrders === 0 ? (
            <p className="text-gray-500">No pending orders.</p>
          ) : (
            <div className="space-y-3">
              {orders.filter(o => o.status === 'Pending').slice(0, 4).map(order => (
                <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-medium">Table {tables.find(t => t.id === order.table_id)?.table_number}</p>
                    <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleTimeString()}</p>
                  </div>
                  <Link to={`/pos/${order.table_id}`} className="text-primary hover:text-accent font-medium text-sm">View Order</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
