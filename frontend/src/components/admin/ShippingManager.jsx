import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axiosConfig';

const emptyZone = { name: '', baseFee: '', feePerKg: '' };

const ShippingManager = () => {
  const [zones, setZones] = useState([]);
  const [form, setForm] = useState(emptyZone);
  const [editingId, setEditingId] = useState(null);

  const loadZones = async () => {
    try { const response = await api.get('/shipping/admin'); setZones(response.data.data || []); }
    catch (error) { toast.error(error.response?.data?.message || 'Could not load shipping destinations'); }
  };
  useEffect(() => { loadZones(); }, []);
  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    try {
      if (editingId) await api.put(`/shipping/${editingId}`, form);
      else await api.post('/shipping', form);
      toast.success(editingId ? 'Destination updated' : 'Destination created');
      setForm(emptyZone); setEditingId(null); loadZones();
    } catch (error) { toast.error(error.response?.data?.message || 'Could not save destination'); }
  };
  const remove = async (id) => {
    if (!window.confirm('Delete this shipping destination?')) return;
    try { await api.delete(`/shipping/${id}`); setZones(zones.filter((zone) => zone._id !== id)); toast.success('Destination deleted'); }
    catch (error) { toast.error(error.response?.data?.message || 'Could not delete destination'); }
  };
  return <section className="peep-admin-management"><form className="card peep-admin-form" onSubmit={submit}><div className="peep-admin-panel-heading"><div><span>Delivery settings</span><h2>{editingId ? 'Edit destination' : 'Add destination'}</h2></div><i className="ti ti-truck-delivery"></i></div><div className="peep-admin-form-grid"><label className="peep-admin-form-wide">Destination name<input name="name" value={form.name} onChange={updateField} placeholder="Accra" required /></label><label>Base fee (GHS)<input name="baseFee" type="number" min="0" step="0.01" value={form.baseFee} onChange={updateField} required /></label><label>Fee per kg (GHS)<input name="feePerKg" type="number" min="0" step="0.01" value={form.feePerKg} onChange={updateField} required /></label></div><div className="peep-admin-form-actions"><button className="btn btn-primary" type="submit">{editingId ? 'Update destination' : 'Add destination'}</button>{editingId && <button className="btn btn-outline" type="button" onClick={() => { setEditingId(null); setForm(emptyZone); }}>Cancel</button>}</div></form><div className="card peep-admin-panel peep-admin-list-panel"><div className="peep-admin-panel-heading"><div><span>Preset destinations</span><h2>Shipping rates</h2></div></div>{zones.length ? <div className="peep-admin-management-list">{zones.map((zone) => <div className="peep-admin-management-row" key={zone._id}><div className="peep-admin-category-icon"><i className="ti ti-map-pin"></i></div><div><strong>{zone.name}</strong><span>GHS {zone.baseFee.toFixed(2)} base · GHS {zone.feePerKg.toFixed(2)} / kg</span></div><div className="peep-admin-row-actions"><button type="button" onClick={() => { setEditingId(zone._id); setForm({ name: zone.name, baseFee: zone.baseFee, feePerKg: zone.feePerKg }); }} aria-label={`Edit ${zone.name}`} title="Edit"><i className="ti ti-edit"></i></button><button type="button" onClick={() => remove(zone._id)} aria-label={`Delete ${zone.name}`} title="Delete"><i className="ti ti-trash"></i></button></div></div>)}</div> : <p className="peep-admin-muted">No shipping destinations configured.</p>}</div></section>;
};

export default ShippingManager;
