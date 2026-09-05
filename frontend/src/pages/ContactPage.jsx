import { useState } from 'react';

const contactDetails = [
  { icon: 'ti-map-pin', label: 'Location', content: 'Circle Tiptoe Lane 5, Accra, Ghana' },
  { icon: 'ti-phone', label: 'Phone / WhatsApp', content: '+233 50 303 5014', href: 'tel:+233503035014' },
  { icon: 'ti-mail', label: 'Email', content: 'peeponline.marketplace@gmail.com', href: 'mailto:peeponline.marketplace@gmail.com' },
  { icon: 'ti-clock', label: 'Opening hours', content: 'Monday - Saturday · 8:00am - 7:00pm' },
  { icon: 'ti-brand-instagram', label: 'Instagram', content: '@PeepOnlinemarketplace', href: 'https://instagram.com/PeepOnlinemarketplace' },
];

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', phone: '', need: '', message: '' });

  const updateForm = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const sendMessage = (event) => {
    event.preventDefault();
    const text = `Hi Peep, my name is ${form.name}. Phone: ${form.phone}. I need help with: ${form.need || 'general enquiry'}. ${form.message}`;
    window.open(`https://wa.me/233503035014?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="peep-info-page">
      <section className="peep-info-section peep-contact-section">
        <div className="section-eyebrow">Contact</div>
        <h1 className="section-title">Let's talk tech.</h1>
        <div className="peep-contact-layout">
          <div className="peep-contact-details">
            {contactDetails.map((detail) => (
              <div className="card peep-contact-detail" key={detail.label}>
                <div className="peep-contact-icon"><i className={`ti ${detail.icon}`}></i></div>
                <div>
                  <div className="peep-contact-label">{detail.label}</div>
                  {detail.href ? <a href={detail.href} target={detail.href.startsWith('http') ? '_blank' : undefined} rel={detail.href.startsWith('http') ? 'noopener noreferrer' : undefined}>{detail.content}</a> : <div className="peep-contact-value">{detail.content}</div>}
                </div>
              </div>
            ))}
            <a href="https://wa.me/233503035014?text=Hi%20Peep%2C%20I%27d%20like%20to%20get%20in%20touch!" className="btn btn-green" target="_blank" rel="noopener noreferrer"><i className="ti ti-brand-whatsapp"></i> Chat on WhatsApp now</a>
          </div>

          <form className="card peep-contact-form" onSubmit={sendMessage}>
            <h2>Send a message</h2>
            <div className="peep-form-row">
              <label>Your name<input name="name" type="text" placeholder="John Mensah" value={form.name} onChange={updateForm} required /></label>
              <label>Phone / WhatsApp<input name="phone" type="tel" placeholder="+233 ..." value={form.phone} onChange={updateForm} required /></label>
            </div>
            <label>What do you need?
              <select name="need" value={form.need} onChange={updateForm} required>
                <option value="">Select a service or product</option>
                <option>Buy a laptop or desktop</option><option>Buy a phone or tablet</option><option>Accessories & parts</option><option>Repair my device</option><option>Custom PC build</option><option>Upgrade (RAM / SSD)</option><option>IT support</option><option>Data recovery</option><option>Business procurement</option><option>Something else</option>
              </select>
            </label>
            <label>Message<textarea name="message" placeholder="Tell us more about what you are looking for..." value={form.message} onChange={updateForm} required /></label>
            <button type="submit" className="btn btn-primary"><i className="ti ti-brand-whatsapp"></i> Send via WhatsApp</button>
            <p>This opens a pre-filled WhatsApp message. We respond within a few hours.</p>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
