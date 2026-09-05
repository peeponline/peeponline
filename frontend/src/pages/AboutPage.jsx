import { Link } from 'react-router-dom';

const values = [
  { icon: 'ti-shield-check', title: '100% genuine products', text: 'We only source from verified suppliers. Every product is authentic and properly warrantied.' },
  { icon: 'ti-currency-dollar', title: 'Honest pricing', text: 'No hidden fees, no inflated prices. We tell you the fair price and we mean it.' },
  { icon: 'ti-clock', title: 'Fast service', text: 'Most repairs done in 24 hours. Orders confirmed fast. We respect your time.' },
  { icon: 'ti-heart', title: 'After-sales care', text: "We do not vanish after you pay. We follow up, support, and stand behind what we sell." },
];

const AboutPage = () => (
  <div className="peep-info-page">
    <section className="peep-about-intro peep-info-section">
      <div className="peep-about-copy">
        <div className="section-eyebrow">About us</div>
        <h1 className="section-title">The story behind Peep</h1>
        <p>Peep Online Marketplace was founded with a simple mission: to make quality consumer technology accessible and affordable for everyone in Accra and beyond.</p>
        <p>Based at Circle Tiptoe Lane 5, we started as a small computer shop and grew into Accra's go-to destination for laptops, phones, accessories, and expert tech services. We believe in honest pricing, genuine products, and treating every customer like family.</p>
        <p>When you peep online, you get the real deal: no inflated prices, no fake products, and no disappearing after the sale.</p>
      </div>
      <div className="peep-about-signature">
        <img src="/circle-top.jpg" alt="Circle Tiptoe Lane 5, Accra" />
        <div className="peep-about-signature-overlay">
          <strong>PEEP<span>.</span></strong>
          <small>Circle Tiptoe Lane 5, Accra</small>
        </div>
      </div>
    </section>

    <section className="peep-info-section peep-about-values">
      <div className="section-eyebrow">Our values</div>
      <h2 className="section-title">What we stand for</h2>
      <div className="peep-value-grid">
        {values.map((value) => (
          <article className="card peep-value-card" key={value.title}>
            <i className={`ti ${value.icon}`}></i>
            <h3>{value.title}</h3>
            <p>{value.text}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="peep-about-cta peep-info-section">
      <div className="section-eyebrow">Get in touch</div>
      <h2 className="section-title">Come see us or reach out anytime</h2>
      <p>Circle Tiptoe Lane 5, Accra · +233 50 303 5014 · peeponline.marketplace@gmail.com</p>
      <div className="peep-info-actions">
        <Link to="/contact" className="btn btn-primary"><i className="ti ti-map-pin"></i> Find us</Link>
        <a href="https://wa.me/233503035014" className="btn btn-ghost" target="_blank" rel="noopener noreferrer"><i className="ti ti-brand-whatsapp"></i> WhatsApp</a>
      </div>
    </section>
  </div>
);

export default AboutPage;
