import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import ProductManager from '../components/admin/ProductManager';
import CategoryManager from '../components/admin/CategoryManager';
import DealsManager from '../components/admin/DealsManager';
import ShippingManager from '../components/admin/ShippingManager';
import AdminUsers from '../components/admin/AdminUsers';
import AdminOrders from '../components/admin/AdminOrders';
import AbandonedCarts from '../components/admin/AbandonedCarts';

const menu = [
  ['Overview', 'ti-layout-dashboard'],
  ['Orders', 'ti-package'],
  ['Products', 'ti-device-laptop'],
  ['Users', 'ti-users'],
  ['Abandoned Carts', 'ti-mailbox'],
  ['Categories', 'ti-category'],
  ['Deals', 'ti-discount-2'],
  ['Shipping', 'ti-truck-delivery'],
  ['Analytics', 'ti-chart-line'],
  ['Settings', 'ti-settings'],
];

const fallbackStats = {
  totalRevenue: 12450,
  totalOrders: 142,
  totalProducts: 25,
  totalUsers: 1200,
  recentOrders: [
    { _id: '12345', user: { name: 'John Doe' }, totalPrice: 150, status: 'processing' },
    { _id: '12344', user: { name: 'Jane Doe' }, totalPrice: 75, status: 'shipped' },
    { _id: '12343', user: { name: 'Kwame Asante' }, totalPrice: 4800, status: 'delivered' },
  ],
  ordersByStatus: [{ _id: 'processing', count: 42 }, { _id: 'shipped', count: 28 }, { _id: 'delivered', count: 62 }, { _id: 'cancelled', count: 10 }],
  monthlyRevenue: [9200, 11400, 8700, 14200, 12800, 16500],
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(fallbackStats);
  const [activeMenu, setActiveMenu] = useState('Overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await api.get('/admin/dashboard/stats');
        setStats((current) => ({ ...current, ...response.data.data }));
      } catch (error) {
        // Keep the dashboard useful while the API is unavailable.
      }
    };
    loadDashboard();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="peep-admin-page">
      <button className="peep-admin-mobile-toggle" type="button" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle admin menu"><i className={`ti ${sidebarOpen ? 'ti-x' : 'ti-menu-2'}`}></i></button>
      <aside className={`peep-admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <Link to="/admin/dashboard" className="peep-admin-brand"><i className="ti ti-shopping-bag"></i><span>Peep</span><small>Admin</small></Link>
        <div className="peep-admin-user"><div className="peep-admin-avatar">{(user?.name || 'A').charAt(0).toUpperCase()}</div><div><strong>{user?.name || 'Administrator'}</strong><span>Admin account</span></div></div>
        <div className="peep-admin-label">Workspace</div>
        <nav className="peep-admin-nav">
          {menu.map(([label, icon]) => <button key={label} type="button" className={activeMenu === label ? 'active' : ''} onClick={() => { setActiveMenu(label); setSidebarOpen(false); }}><i className={`ti ${icon}`}></i>{label}</button>)}
        </nav>
        <button type="button" className="peep-admin-logout" onClick={handleLogout}><i className="ti ti-logout"></i> Sign out</button>
      </aside>
      <main className="peep-admin-main">
        <header className="peep-admin-header"><div><div className="section-eyebrow">Admin dashboard</div><h1>{activeMenu}</h1></div><div className="peep-admin-header-actions"><span className="peep-admin-status"><i></i> Live workspace</span><Link to="/" aria-label="View storefront" title="View storefront"><i className="ti ti-external-link"></i></Link></div></header>
        {activeMenu === 'Overview' && <Overview stats={stats} />}
        {activeMenu === 'Products' && <ProductManager />}
        {activeMenu === 'Orders' && <AdminOrders />}
        {activeMenu === 'Users' && <AdminUsers />}
        {activeMenu === 'Abandoned Carts' && <AbandonedCarts />}
        {activeMenu === 'Categories' && <CategoryManager />}
        {activeMenu === 'Deals' && <DealsManager />}
        {activeMenu === 'Shipping' && <ShippingManager />}
        {!['Overview', 'Products', 'Orders', 'Users', 'Abandoned Carts', 'Categories', 'Deals', 'Shipping'].includes(activeMenu) && <AdminPlaceholder title={activeMenu} />}
      </main>
    </div>
  );
};

const Overview = ({ stats }) => <>
  <section className="peep-admin-kpis">
    <Kpi icon="ti-currency-dollar" value={`GHS ${Number(stats.totalRevenue || 0).toLocaleString()}`} label="Revenue" tone="teal" />
    <Kpi icon="ti-package" value={Number(stats.totalOrders || 0).toLocaleString()} label="Orders" tone="blue" />
    <Kpi icon="ti-device-laptop" value={Number(stats.totalProducts || 0).toLocaleString()} label="Products" tone="yellow" />
    <Kpi icon="ti-users" value={Number(stats.totalUsers || 0).toLocaleString()} label="Users" tone="orange" />
  </section>
  <section className="peep-admin-chart-grid">
    <div className="card peep-admin-panel"><div className="peep-admin-panel-heading"><div><span>Performance</span><h2>Revenue overview</h2></div><i className="ti ti-chart-line"></i></div><RevenueChart values={stats.monthlyRevenue?.length ? stats.monthlyRevenue : fallbackStats.monthlyRevenue} /></div>
    <div className="card peep-admin-panel"><div className="peep-admin-panel-heading"><div><span>Fulfilment</span><h2>Order status</h2></div><i className="ti ti-chart-donut"></i></div><StatusChart statuses={stats.ordersByStatus || fallbackStats.ordersByStatus} /></div>
  </section>
  <section className="card peep-admin-panel peep-admin-orders"><div className="peep-admin-panel-heading"><div><span>Latest activity</span><h2>Recent orders</h2></div><Link to="/shop">View storefront <i className="ti ti-arrow-up-right"></i></Link></div><div className="peep-admin-order-table"><div className="peep-admin-order-head"><span>Order</span><span>Customer</span><span>Amount</span><span>Status</span></div>{(stats.recentOrders || []).map((order) => <div className="peep-admin-order-row" key={order._id}><strong>#{String(order._id).slice(-5)}</strong><span>{order.user?.name || 'Customer'}</span><b>GHS {Number(order.totalPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</b><em className={`peep-admin-order-status ${order.status}`}>{order.status}</em></div>)}</div></section>
</>;

const Kpi = ({ icon, value, label, tone }) => <div className="card peep-admin-kpi"><i className={`ti ${icon} ${tone}`}></i><strong>{value}</strong><span>{label}</span><small>Updated just now</small></div>;
const RevenueChart = ({ values }) => { const max = Math.max(...values, 1); return <div className="peep-admin-revenue-chart">{values.map((value, index) => <div className="peep-admin-revenue-column" key={`${value}-${index}`}><div className="peep-admin-revenue-bar" style={{ height: `${Math.max((value / max) * 100, 8)}%` }}></div><span>{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index] || `M${index + 1}`}</span></div>)}</div>; };
const StatusChart = ({ statuses }) => { const total = statuses.reduce((sum, item) => sum + item.count, 0) || 1; let offset = 0; const colors = ['#3B8BEB', '#2ECFCF', '#25D366', '#FF6B35']; const segments = statuses.map((item, index) => { const start = offset; offset += (item.count / total) * 100; return `${colors[index % colors.length]} ${start}% ${offset}%`; }); return <div className="peep-admin-status-chart"><div className="peep-admin-donut" style={{ background: `conic-gradient(${segments.join(', ')})` }}><div><strong>{total}</strong><span>orders</span></div></div><ul>{statuses.map((item, index) => <li key={item._id}><i style={{ background: colors[index % colors.length] }}></i><span>{item._id}</span><b>{item.count}</b></li>)}</ul></div>; };
const AdminPlaceholder = ({ title }) => <div className="card peep-admin-panel peep-admin-placeholder"><i className="ti ti-tools"></i><h2>{title}</h2><p>This workspace section is ready for management tools.</p></div>;

export default AdminDashboard;
