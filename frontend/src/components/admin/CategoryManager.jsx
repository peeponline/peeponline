import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axiosConfig';

const emptyCategory = { name: '', description: '' };

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyCategory);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    setLoading(true);
    try { const response = await api.get('/admin/categories'); setCategories(response.data.data || []); }
    catch (error) { toast.error(error.response?.data?.message || 'Could not load categories'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadCategories(); }, []);

  const submitForm = async (event) => {
    event.preventDefault();
    try {
      if (editingId) await api.put(`/admin/categories/${editingId}`, form);
      else await api.post('/admin/categories', form);
      toast.success(editingId ? 'Category updated' : 'Category created');
      setForm(emptyCategory); setEditingId(null); await loadCategories();
    } catch (error) { toast.error(error.response?.data?.message || 'Could not save category'); }
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm('Delete this category?')) return;
    try { await api.delete(`/admin/categories/${categoryId}`); setCategories((current) => current.filter((category) => category._id !== categoryId)); toast.success('Category deleted'); }
    catch (error) { toast.error(error.response?.data?.message || 'Could not delete category'); }
  };

  return <section className="peep-admin-management peep-admin-category-management">
    <form className="card peep-admin-form" onSubmit={submitForm}><div className="peep-admin-panel-heading"><div><span>{editingId ? 'Edit taxonomy' : 'New taxonomy'}</span><h2>{editingId ? 'Update category' : 'Create category'}</h2></div><i className="ti ti-category"></i></div><div className="peep-admin-form-grid"><label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required maxLength="80" /></label><label className="peep-admin-form-wide">Description <small>Optional</small><textarea rows="4" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label></div><div className="peep-admin-form-actions"><button className="btn btn-primary" type="submit">{editingId ? 'Update category' : 'Create category'}</button>{editingId && <button className="btn btn-outline" type="button" onClick={() => { setForm(emptyCategory); setEditingId(null); }}>Cancel</button>}</div></form>
    <div className="card peep-admin-panel peep-admin-list-panel"><div className="peep-admin-panel-heading"><div><span>Catalogue structure</span><h2>Categories</h2></div><button className="peep-admin-refresh" type="button" onClick={loadCategories} aria-label="Refresh categories" title="Refresh categories"><i className="ti ti-refresh"></i></button></div>{loading ? <p className="peep-admin-muted">Loading categories...</p> : categories.length === 0 ? <p className="peep-admin-muted">No categories yet.</p> : <div className="peep-admin-management-list">{categories.map((category) => <div className="peep-admin-management-row" key={category._id}><div className="peep-admin-category-icon"><i className="ti ti-category"></i></div><div><strong>{category.name}</strong><span>{category.description || 'No description'}</span></div><div className="peep-admin-row-actions"><button type="button" onClick={() => { setEditingId(category._id); setForm({ name: category.name, description: category.description || '' }); }} aria-label={`Edit ${category.name}`} title="Edit"><i className="ti ti-edit"></i></button><button type="button" onClick={() => deleteCategory(category._id)} aria-label={`Delete ${category.name}`} title="Delete"><i className="ti ti-trash"></i></button></div></div>)}</div>}</div>
  </section>;
};

export default CategoryManager;