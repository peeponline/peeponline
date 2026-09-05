import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getAssetUrl } from '../../api/axiosConfig';

const DealsManager = () => {
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [discount, setDiscount] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products?limit=100&sort=-updatedAt');
      setProducts(response.data.products || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const selectProduct = (event) => {
    const product = products.find((item) => item._id === event.target.value);
    setSelectedId(event.target.value);
    setDiscount(product?.discount || '');
  };

  const saveDeal = async (event) => {
    event.preventDefault();
    if (!selectedId) return toast.error('Choose a product first');
    setSaving(true);
    try {
      await api.put(`/products/${selectedId}`, { discount: Number(discount) || 0 });
      toast.success(Number(discount) > 0 ? 'Deal added' : 'Deal removed');
      await loadProducts();
      setSelectedId('');
      setDiscount('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save deal');
    } finally {
      setSaving(false);
    }
  };

  return <section className="peep-admin-management peep-admin-deals-management">
    <form className="card peep-admin-form" onSubmit={saveDeal}>
      <div className="peep-admin-panel-heading"><div><span>Promotions</span><h2>Create a deal</h2></div><i className="ti ti-discount-2"></i></div>
      <div className="peep-admin-form-grid">
        <label className="peep-admin-form-wide">Product<select value={selectedId} onChange={selectProduct} required><option value="">Choose an existing product</option>{products.map((product) => <option key={product._id} value={product._id}>{product.name} · GHS {Number(product.price).toLocaleString()}</option>)}</select></label>
        <label className="peep-admin-form-wide">Discount percentage<input type="number" min="0" max="100" step="1" value={discount} onChange={(event) => setDiscount(event.target.value)} placeholder="e.g. 15" required /><small>Enter 0% to remove the deal.</small></label>
      </div>
      <div className="peep-admin-form-actions"><button className="btn btn-primary" type="submit" disabled={saving || loading}>{saving ? 'Saving...' : 'Save deal'}</button></div>
    </form>
    <div className="card peep-admin-panel peep-admin-list-panel"><div className="peep-admin-panel-heading"><div><span>Live promotions</span><h2>Current deals</h2></div><button className="peep-admin-refresh" type="button" onClick={loadProducts} aria-label="Refresh deals" title="Refresh deals"><i className="ti ti-refresh"></i></button></div>
      {loading ? <p className="peep-admin-muted">Loading products...</p> : products.filter((product) => product.discount > 0).length === 0 ? <p className="peep-admin-muted">No active deals yet.</p> : <div className="peep-admin-management-list">{products.filter((product) => product.discount > 0).map((product) => <div className="peep-admin-management-row" key={product._id}><div className="peep-admin-product-thumb">{product.images?.[0]?.url && <img src={getAssetUrl(product.images[0].url)} alt="" />}</div><div><strong>{product.name}</strong><span>{product.discount}% off · GHS {Number(product.price * (1 - product.discount / 100)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div><button className="peep-admin-deal-edit" type="button" onClick={() => { setSelectedId(product._id); setDiscount(product.discount); }} aria-label={`Edit deal for ${product.name}`} title="Edit deal"><i className="ti ti-edit"></i></button></div>)}</div>}
    </div>
  </section>;
};

export default DealsManager;
