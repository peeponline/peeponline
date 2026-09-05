import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ShopPage = () => {
  const tabs = ['Laptops & Desktops', 'Phones & Tablets', 'Accessories', 'Components & Parts'];
  const searchParams = new URLSearchParams(window.location.search);
  const initialCategory = searchParams.get('category') || '';
  const initialKeyword = searchParams.get('keyword') || '';
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: initialKeyword,
    category: initialCategory,
    tab: '',
    minPrice: '',
    maxPrice: '',
    sort: '-createdAt',
    page: 1,
    limit: 12,
  });
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, val]) => {
          if (val) params.append(key, val);
        });
        const [productsResponse, categoriesResponse] = await Promise.all([
          api.get(`/products?${params.toString()}`),
          api.get('/categories'),
        ]);
        setProducts(productsResponse.data.products || []);
        setPagination({ total: productsResponse.data.total, pages: productsResponse.data.pages });
        setCategories(categoriesResponse.data.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  return (
    <div className="peep-shop-page">
      <section className="peep-shop-section">
        <div className="section-eyebrow">Shop</div>
        <h1 className="section-title">All products</h1>
        <p className="section-sub peep-shop-subtitle">Genuine products · Competitive prices · WhatsApp to order</p>

        <div className="peep-shop-toolbar">
          <div className="peep-shop-category-filters" aria-label="Filter products by category">
            {[{ _id: '', name: 'All items' }, ...categories].map((category) => (
              <button
                key={category._id || 'all'}
                type="button"
                className={`btn btn-sm ${filters.category === category._id ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFilters((prev) => ({ ...prev, category: category._id, page: 1 }))}
              >
                {category.name}
              </button>
            ))}
          </div>
          <div className="peep-shop-category-filters" aria-label="Filter products by tab">
            {[{ value: '', label: 'All tabs' }, ...tabs.map((tab) => ({ value: tab, label: tab }))].map((tab) => (
              <button key={tab.value || 'all-tabs'} type="button" className={`btn btn-sm ${filters.tab === tab.value ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilters((prev) => ({ ...prev, tab: tab.value, page: 1 }))}>{tab.label}</button>
            ))}
          </div>
          <div className="peep-shop-controls">
            <label className="peep-shop-search">
              <i className="ti ti-search"></i>
              <input
                type="search"
                name="keyword"
                placeholder="Search products"
                aria-label="Search products"
                value={filters.keyword}
                onChange={handleFilterChange}
              />
            </label>
            <select
              name="sort"
              className="peep-shop-sort"
              aria-label="Sort products"
              value={filters.sort}
              onChange={handleFilterChange}
            >
              <option value="-createdAt">Newest</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="peep-shop-price-range">
          <input type="number" name="minPrice" placeholder="Min price" aria-label="Minimum price" value={filters.minPrice} onChange={handleFilterChange} />
          <span>to</span>
          <input type="number" name="maxPrice" placeholder="Max price" aria-label="Maximum price" value={filters.maxPrice} onChange={handleFilterChange} />
        </div>

        {loading ? <LoadingSpinner /> : products.length > 0 ? (
          <>
            <div className="peep-shop-grid">
              {products.map((product) => <ProductCard key={product._id} product={product} />)}
            </div>
            {pagination.pages > 1 && (
              <div className="peep-shop-pagination" aria-label="Product pages">
                {[...Array(pagination.pages).keys()].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, page: num + 1 }))}
                    className={filters.page === num + 1 ? 'active' : ''}
                    aria-label={`Go to page ${num + 1}`}
                  >
                    {num + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : <p className="peep-shop-empty">No products found. Try a different search or category.</p>}

        <div className="peep-shop-notice">
          <i className="ti ti-info-circle"></i>
          <span>WhatsApp <a href="https://wa.me/233503035014" target="_blank" rel="noopener noreferrer">+233 50 303 5014</a> to check stock, negotiate price, or place an order. Every item comes with a warranty.</span>
        </div>
      </section>
    </div>
  );
};

export default ShopPage;