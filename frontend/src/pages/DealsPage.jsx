import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DealsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDeals = async () => {
      try {
        const response = await api.get('/products?limit=100&sort=-updatedAt');
        setProducts((response.data.products || []).filter((product) => Number(product.discount) > 0));
      } finally {
        setLoading(false);
      }
    };
    loadDeals();
  }, []);

  return (
    <div className="peep-deals-page">
      <section className="peep-info-section peep-deals-heading">
        <div className="section-eyebrow">Deals & promotions</div>
        <h1 className="section-title">Hot deals this week</h1>
        <p className="section-sub">Limited time offers · WhatsApp us before stock runs out.</p>
      </section>
      <section className="peep-deals-products">
        <div className="peep-deals-banner">
          <div className="peep-deals-fire">🔥</div>
          <div><h2>Special offers</h2><p>Up to 20% off selected laptops, phones, and accessories. WhatsApp us to lock in a price. team.</p></div>
        </div>
        {loading ? <LoadingSpinner /> : products.length ? <div className="peep-deals-grid">{products.map((product) => <ProductCard key={product._id} product={product} />)}</div> : <p className="peep-shop-empty">No active deals at the moment.</p>}
      </section>
    </div>
  );
};

export default DealsPage;
