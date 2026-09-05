import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axiosConfig';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const loadUsers = async () => {
    setLoading(true);
    try { const response = await api.get('/admin/users'); setUsers(response.data.data || []); }
    catch (error) { toast.error(error.response?.data?.message || 'Could not load users'); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadUsers(); }, []);
  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { await api.delete(`/admin/users/${id}`); setUsers((current) => current.filter((user) => user._id !== id)); toast.success('User deleted'); }
    catch (error) { toast.error(error.response?.data?.message || 'Could not delete user'); }
  };
  return <section className="card peep-admin-panel peep-admin-table-panel"><div className="peep-admin-panel-heading"><div><span>Access management</span><h2>Users</h2></div><button className="peep-admin-refresh" type="button" onClick={loadUsers} aria-label="Refresh users" title="Refresh users"><i className="ti ti-refresh"></i></button></div>{loading ? <p className="peep-admin-muted">Loading users...</p> : users.length ? <div className="peep-admin-data-table"><div className="peep-admin-data-head"><span>User</span><span>Contact</span><span>Role</span><span>Joined</span><span></span></div>{users.map((user) => <div className="peep-admin-data-row" key={user._id}><div><strong>{user.name}</strong><span>{user.email}</span></div><span>{user.phone || 'No phone'}</span><em className={`peep-admin-role ${user.role}`}>{user.role}</em><span>{new Date(user.createdAt).toLocaleDateString()}</span><button className="peep-admin-delete-button" type="button" onClick={() => deleteUser(user._id)} aria-label={`Delete ${user.name}`} title="Delete user"><i className="ti ti-trash"></i></button></div>)}</div> : <p className="peep-admin-muted">No users found.</p>}</section>;
};

export default AdminUsers;
