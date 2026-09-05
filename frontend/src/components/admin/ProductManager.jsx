import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getAssetUrl } from '../../api/axiosConfig';

const emptyProduct = { name: '', price: '', description: '', tab: '', category: '', weightKg: '0.5', stock: '0', discount: '0', isFeatured: false };
const requiredCategoryGroups = [
  'Laptops & Desktops',
  'Phones & Tablets',
  'Accessories',
  'Components & Parts',
];
const maxImageSize = 5 * 1024 * 1024;

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [files, setFiles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showWeightWarning, setShowWeightWarning] = useState(false);
  const weightInputRef = useRef(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        api.get('/products?limit=100'),
        api.get('/admin/categories'),
      ]);
      setProducts(productsResponse.data.products || []);
      setCategories(categoriesResponse.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const startEditing = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      price: product.price,
      description: product.description,
      tab: product.tab || '',
      category: product.category?._id || product.category,
      weightKg: product.weightKg || '',
      stock: product.stock || 0,
      discount: product.discount || 0,
      isFeatured: product.isFeatured || false,
    });
    setFiles([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => { setEditingId(null); setForm(emptyProduct); setFiles([]); };

  const handleImageSelection = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    const oversizedFile = selectedFiles.find((file) => file.size > maxImageSize);
    if (oversizedFile) {
      setFiles([]);
      event.target.value = '';
      toast.error(`${oversizedFile.name} is larger than 5MB. Please choose a smaller image.`);
      return;
    }
    setFiles(selectedFiles.slice(0, 5));
  };

  const submitForm = async (event, ignoreWeightWarning = false) => {
    event.preventDefault();
    if (!form.weightKg && !ignoreWeightWarning) {
      setShowWeightWarning(true);
      return;
    }
    setSaving(true);
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    if (!form.weightKg) payload.set('weightKg', '0.5');
    files.forEach((file) => payload.append('images', file));
    try {
      if (editingId) await api.put(`/products/${editingId}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      else await api.post('/products', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(editingId ? 'Product updated' : 'Product created');
      resetForm();
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save product');
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${productId}`);
      setProducts((current) => current.filter((product) => product._id !== productId));
      toast.success('Product deleted');
    } catch (error) { toast.error(error.response?.data?.message || 'Could not delete product'); }
  };

  return <section className="peep-admin-management">
    <form className="card peep-admin-form" onSubmit={submitForm}>
      <div className="peep-admin-panel-heading"><div><span>{editingId ? 'Edit catalogue item' : 'New catalogue item'}</span><h2>{editingId ? 'Update product' : 'Create product'}</h2></div><i className="ti ti-device-laptop"></i></div>
      <div className="peep-admin-form-grid">
        <label>Title<input name="name" value={form.name} onChange={updateField} required maxLength="100" /></label>
        <label>Price (GHS)<input name="price" type="number" inputMode="decimal" min="0" step="0.01" value={form.price} onChange={updateField} required /></label>
        <label>Weight (kg)<input ref={weightInputRef} name="weightKg" type="number" inputMode="decimal" min="0" step="0.01" value={form.weightKg} onChange={updateField} placeholder="0.5" /></label>
        <label>Tab<select name="tab" value={form.tab} onChange={updateField} required><option value="">Choose a tab</option>{requiredCategoryGroups.map((tab) => <option key={tab} value={tab}>{tab}</option>)}</select></label>
        <label>Category<select name="category" value={form.category} onChange={updateField} required><option value="">Choose a category</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></label>
        <label>Stock<input name="stock" type="number" inputMode="numeric" min="0" value={form.stock} onChange={updateField} /></label>
        <label className="peep-admin-form-wide">Description<textarea name="description" rows="4" value={form.description} onChange={updateField} required maxLength="2000" /></label>
        <label className="peep-admin-form-wide peep-admin-file-field">Product images <small>Up to 5 images, 5MB each</small><span className="peep-admin-file-picker"><i className="ti ti-cloud-upload"></i><strong>{files.length ? `${files.length} image${files.length === 1 ? '' : 's'} selected` : 'Choose product images'}</strong><em>JPG, PNG, WEBP or GIF</em><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={handleImageSelection} /></span></label>
        <label className="peep-admin-checkbox"><input name="isFeatured" type="checkbox" checked={form.isFeatured} onChange={updateField} /> Feature this product</label>
      </div>
      <div className="peep-admin-form-actions"><button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update product' : 'Create product'}</button>{editingId && <button className="btn btn-outline" type="button" onClick={resetForm}>Cancel</button>}</div>
    </form>
    <div className="card peep-admin-panel peep-admin-list-panel">
      <div className="peep-admin-panel-heading"><div><span>Catalogue</span><h2>Products</h2></div><button className="peep-admin-refresh" type="button" onClick={loadData} aria-label="Refresh products" title="Refresh products"><i className="ti ti-refresh"></i></button></div>
      {loading ? <p className="peep-admin-muted">Loading products...</p> : products.length === 0 ? <p className="peep-admin-muted">No products yet.</p> : <div className="peep-admin-management-list">{products.map((product) => <div className="peep-admin-management-row" key={product._id}><div className="peep-admin-product-thumb">{product.images?.[0]?.url && <img src={getAssetUrl(product.images[0].url)} alt="" />}</div><div><strong>{product.name}</strong><span>{product.tab || 'No tab'} · {product.category?.name || 'Uncategorised'} · GHS {Number(product.price).toLocaleString()}</span></div><div className="peep-admin-row-actions"><button type="button" onClick={() => startEditing(product)} aria-label={`Edit ${product.name}`} title="Edit"><i className="ti ti-edit"></i></button><button type="button" onClick={() => deleteProduct(product._id)} aria-label={`Delete ${product.name}`} title="Delete"><i className="ti ti-trash"></i></button></div></div>)}</div>}
    </div>
    {showWeightWarning && <div className="peep-admin-modal-backdrop" role="presentation"><div className="peep-admin-modal" role="dialog" aria-modal="true" aria-labelledby="weight-warning-title"><div className="peep-admin-modal-icon"><i className="ti ti-scale"></i></div><h2 id="weight-warning-title">Weight not added</h2><p>Product weight helps calculate a fair shipping fee for each destination. Without it, this product will use the default weight of 0.5 kg.</p><div className="peep-admin-modal-actions"><button className="btn btn-primary" type="button" onClick={() => { setShowWeightWarning(false); weightInputRef.current?.focus(); }}>Add weight</button><button className="btn btn-outline" type="button" onClick={() => { setShowWeightWarning(false); submitForm({ preventDefault: () => {} }, true); }}>Ignore and continue</button></div></div></div>}
  </section>;
};

export default ProductManager;