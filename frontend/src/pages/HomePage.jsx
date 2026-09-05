import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import ProductCard from '../components/product/ProductCard';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadStorefront = async () => {
      const [productsResponse, categoriesResponse] = await Promise.allSettled([
          api.get('/products?limit=100&sort=-createdAt'),
        api.get('/categories'),
      ]);
      if (productsResponse.status === 'fulfilled') {
        setProducts((productsResponse.value.data.products || []).filter((product) => product.isFeatured === true || product.isFeatured === 'true').slice(0, 6));
      }
      if (categoriesResponse.status === 'fulfilled') {
        setCategories(categoriesResponse.value.data.data || []);
      }
    };
    loadStorefront();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('in');
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.anim').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [products, categories]);

  return (
    <>
      {/* Hero Section */}
      <section className="peep-home-hero">
        <div className="peep-home-hero-image"></div>
        <div className="peep-home-hero-overlay"></div>
        <div className="peep-home-hero-scanline">
          <div className="peep-home-scanline"></div>
        </div>

        <div className="peep-home-hero-container">
          <div className="peep-home-hero-content">
          <div className="peep-home-location peep-home-fade-up">
            <i className="ti ti-map-pin"></i> Circle Tiptoe Lane 5 · Accra, Ghana
          </div>
          <h1 className="peep-home-title peep-home-fade-up peep-home-delay-100">
            Peep online.<br />
            Get the <span className="peep-home-teal">best</span><br />
            <span className="peep-home-blue">tech deals.</span>
          </h1>
          <p className="peep-home-description peep-home-fade-up peep-home-delay-200">
            Consumer tech, accessories, and expert services — all in one place. Your trusted computer shop in Accra.
          </p>
          <div className="peep-home-actions peep-home-fade-up peep-home-delay-300">
            <Link to="/shop" className="btn btn-primary"><i className="ti ti-device-laptop"></i> Shop now</Link>
            <a href="https://wa.me/233503035014" className="btn btn-ghost" target="_blank" rel="noopener noreferrer"><i className="ti ti-brand-whatsapp"></i> WhatsApp us</a>
          </div>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="ticker">
        <div className="ticker-track">
          {[
            'Laptops & Desktops', 'Phones & Tablets', 'Repairs & Servicing',
            'Custom PC Builds', 'Accessories', 'IT Support', 'Data Recovery',
            'Free Consultation'
          ].concat([
            'Laptops & Desktops', 'Phones & Tablets', 'Repairs & Servicing',
            'Custom PC Builds', 'Accessories', 'IT Support', 'Data Recovery',
            'Free Consultation'
          ]).map((item, i) => (
            <span className="ticker-item" key={i}>
              <span className="ticker-dot"></span>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item"><div className="stat-num">{products.length}</div><div className="stat-label">Featured products</div></div>
        <div className="stat-item"><div className="stat-num">{categories.length}</div><div className="stat-label">Categories</div></div>
        <div className="stat-item"><div className="stat-num">24hr</div><div className="stat-label">Repair turnaround</div></div>
        <div className="stat-item"><div className="stat-num">100%</div><div className="stat-label">Genuine products</div></div>
      </div>

      {/* Featured Products */}
      <section className="section dark">
        <div className="section-eyebrow anim">Featured products</div>
        <div className="section-title anim">Popular right now</div>
        <div className="peep-shop-grid peep-home-product-grid">
          {products.length ? products.map((product, idx) => (
            <div className="anim" key={product._id} style={{ transitionDelay: `${idx * 50}ms` }}>
              <ProductCard product={product} />
            </div>
          )) : <p className="peep-shop-empty">No products are available yet.</p>}
        </div>
        <div className="peep-home-products-link anim">
          <Link to="/shop" className="btn btn-ghost"><i className="ti ti-arrow-right"></i> View all products</Link>
        </div>
      </section>

      {/* Products & Services */}
      <section className="section">
        <div className="section-eyebrow anim">What we do</div>
        <div className="section-title anim">Products & Services</div>
        <div className="peep-home-service-grid">
          {[
            { icon: 'ti-device-laptop', title: 'Laptops', desc: 'HP, Dell, Lenovo, Asus, Apple — new & refurbished' },
            { icon: 'ti-device-desktop', title: 'Desktops', desc: 'Gaming rigs, office workstations & custom builds' },
            { icon: 'ti-device-mobile', title: 'Phones & tablets', desc: 'Top smartphones at the best prices in Accra' },
            { icon: 'ti-keyboard', title: 'Accessories', desc: 'Keyboards, mice, chargers, cables & more' },
            { icon: 'ti-tools', title: 'Repairs', desc: 'Fast, honest repairs for all brands & models' },
            { icon: 'ti-cpu', title: 'Custom builds', desc: 'Your spec, your budget — built by our technicians' }
          ].map((item, idx) => (
            <div className="card card-hover anim peep-home-service-card" key={item.title} style={{ transitionDelay: `${idx * 50}ms` }}>
              <div className="peep-home-service-icon">
                <i className={`ti ${item.icon}`}></i>
              </div>
              <div className="peep-home-service-title">{item.title}</div>
              <div className="peep-home-service-description">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section dark peep-home-cta">
        <div className="section-eyebrow anim">Ready to order?</div>
        <div className="section-title anim peep-home-cta-title">The easiest way to buy tech in Accra</div>
        <p className="peep-home-cta-description anim">Browse our full catalogue, WhatsApp us to confirm availability, and we'll sort the rest.</p>
        <div className="peep-home-cta-actions anim">
          <Link to="/shop" className="btn btn-primary"><i className="ti ti-shopping-cart"></i> Browse catalogue</Link>
          <Link to="/services" className="btn btn-ghost"><i className="ti ti-tools"></i> Our services</Link>
        </div>
      </section>
    </>
  );
};

export default HomePage;