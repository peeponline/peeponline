import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axiosConfig';

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const loadOrders = async () => {
    setLoading(true);
    try { const response = await api.get('/admin/orders'); setOrders(response.data.data || []); }
    catch (error) { toast.error(error.response?.data?.message || 'Could not load orders'); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadOrders(); }, []);
  const updateStatus = async (id, status) => {
    try { const response = await api.put(`/orders/${id}/status`, { status }); setOrders((current) => current.map((order) => order._id === id ? response.data.data : order)); toast.success('Order status updated'); }
    catch (error) { toast.error(error.response?.data?.message || 'Could not update order'); }
  };
  return <section className="card peep-admin-panel peep-admin-table-panel"><div className="peep-admin-panel-heading"><div><span>Store activity</span><h2>Orders</h2></div><button className="peep-admin-refresh" type="button" onClick={loadOrders} aria-label="Refresh orders" title="Refresh orders"><i className="ti ti-refresh"></i></button></div>{loading ? <p className="peep-admin-muted">Loading orders...</p> : orders.length ? <div className="peep-admin-data-table"><div className="peep-admin-data-head"><span>Order</span><span>Customer</span><span>Items</span><span>Total</span><span>Status</span></div>{orders.map((order) => <div className="peep-admin-data-row" key={order._id}><div><strong>#{String(order._id).slice(-6)}</strong><span>{new Date(order.createdAt).toLocaleDateString()}</span></div><span>{order.user?.name || order.user?.email || 'Customer'}</span><span>{order.items?.reduce((total, item) => total + item.quantity, 0) || 0} item(s)</span><b>GHS {Number(order.totalPrice || 0).toFixed(2)}</b><select className="peep-admin-status-select" value={order.status} onChange={(event) => updateStatus(order._id, event.target.value)} aria-label={`Status for order ${order._id}`}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></div>)}</div> : <p className="peep-admin-muted">No orders found.</p>}</section>;
};

export default AdminOrders;
