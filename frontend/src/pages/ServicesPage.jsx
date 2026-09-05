const services = [
  { id: 'repair', icon: 'ti-tools', title: 'Laptop & PC repair', text: 'Screen replacements, motherboard diagnostics, virus and malware removal, overheating fixes, charging port repairs, and more. We service all major brands.', points: ['Screen repair from GHS 200', 'Virus removal from GHS 80', 'Most repairs done in 24 hours'], action: 'Book repair', message: 'I need a repair quote' },
  { id: 'build', icon: 'ti-cpu', title: 'Custom PC builds', text: "Tell us your budget and what you need - gaming, video editing, office work - and we'll spec and build your perfect machine. Every build is fully tested and warrantied.", points: ['Gaming PCs from GHS 5,500', 'Office workstations from GHS 3,000', '1-year parts & labour warranty'], action: 'Get a build quote', message: 'I want a custom PC build' },
  { id: 'upgrade', icon: 'ti-arrows-up', title: 'Upgrades & speed boost', text: 'RAM upgrades, SSD installations, and OS reinstalls can make your old machine feel brand new. Usually cheaper than buying a new device.', points: ['RAM upgrade from GHS 180', 'SSD install from GHS 220', 'OS reinstall GHS 80'], action: 'Book upgrade', message: 'I want to upgrade my device' },
  { id: 'it', icon: 'ti-headset', title: 'IT support', text: 'Network setup and configuration, software installation, printer setup, email config, and ongoing monthly IT support contracts for SMEs.', points: ['One-time setup from GHS 150', 'Monthly retainer available', 'On-site & remote support'], action: 'Enquire now', message: 'I need IT support' },
  { id: 'data', icon: 'ti-database', title: 'Data recovery', text: 'Lost files from a crashed hard drive, formatted disk, or corrupted storage? Our technicians recover data confidentially, securely, and fast.', points: ['Hard drive recovery from GHS 200', 'Flash drive & SD card recovery', 'Confidential & secure process'], action: 'Get help now', message: 'I need data recovery' },
  { id: 'procurement', icon: 'ti-building-store', title: 'Business procurement', text: 'Equipping an office? We offer bulk pricing on laptops, desktops, printers, and accessories for businesses, schools, and institutions. Delivery and setup included.', points: ['Volume discounts on all products', 'Delivery & on-site setup', 'After-sales support contract'], action: 'Request quote', message: 'I need a bulk order quote' },
];

const ServicesPage = () => (
  <div className="peep-info-page">
    <section className="peep-info-section peep-services-heading">
      <div className="section-eyebrow">Expert services</div>
      <h1 className="section-title">We don't just sell -<br />we fix & build too.</h1>
      <p className="section-sub">Our trained technicians handle everything from a quick screen swap to full IT infrastructure setups for businesses.</p>
    </section>
    <section className="peep-services-section">
      <div className="peep-services-grid">
        {services.map((service) => (
          <article className="card card-hover peep-service-card" id={service.id} key={service.id}>
            <div className="peep-service-accent"></div>
            <i className={`ti ${service.icon} peep-service-icon`}></i>
            <h2>{service.title}</h2>
            <p className="peep-service-text">{service.text}</p>
            <ul>{service.points.map((point) => <li key={point}><i className="ti ti-check"></i>{point}</li>)}</ul>
            <a href={`https://wa.me/233503035014?text=${encodeURIComponent(`Hi Peep, ${service.message}`)}`} className="btn btn-green btn-sm" target="_blank" rel="noopener noreferrer"><i className="ti ti-brand-whatsapp"></i> {service.action}</a>
          </article>
        ))}
      </div>
    </section>
  </div>
);

export default ServicesPage;
