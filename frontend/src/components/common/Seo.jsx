import { useEffect } from 'react';

const DEFAULT_TITLE = 'Peep Online Marketplace | Tech Deals, Repair & Accessories in Accra';
const DEFAULT_DESCRIPTION = 'Shop laptops, phones, accessories, custom PC builds, and tech services in Accra with Peep Online Marketplace.';
const DEFAULT_CANONICAL = 'https://www.peeponline.store';

const pageMeta = {
  '/': {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  '/shop': {
    title: 'Shop Tech Products | Peep Online Marketplace',
    description: 'Browse laptops, desktops, phones, accessories, and gadgets online at Peep Online Marketplace.',
  },
  '/deals': {
    title: 'Tech Deals in Accra | Peep Online Marketplace',
    description: 'Find the latest laptop, phone, accessory, and gadget deals in Ghana with Peep Online Marketplace.',
  },
  '/about': {
    title: 'About Peep | Trusted Tech Store in Accra',
    description: 'Learn about Peep Online Marketplace, our mission, and the trusted tech services we offer in Accra.',
  },
  '/contact': {
    title: 'Contact Peep | Tech Store in Accra',
    description: 'Get in touch with Peep Online Marketplace for orders, support, repairs, and tech inquiries in Ghana.',
  },
  '/services': {
    title: 'Tech Repair & Services | Peep Online Marketplace',
    description: 'Book laptop repairs, custom PC builds, device upgrades, IT support, and data recovery from Peep.',
  },
  '/terms': {
    title: 'Terms of Service | Peep Online Marketplace',
    description: 'Read the Peep Online Marketplace terms of service for website use, store purchases, and services.',
  },
  '/refund-policy': {
    title: 'Refund Policy | Peep Online Marketplace',
    description: 'Review Peep Online Marketplace refund and return terms for products and services.',
  },
  '/privacy-policy': {
    title: 'Privacy Policy | Peep Online Marketplace',
    description: 'Learn how Peep Online Marketplace protects your privacy and handles your personal data.',
  },
  '/cart': {
    title: 'Shopping Cart | Peep Online Marketplace',
    description: 'Review your cart before checkout and complete your order with Peep Online Marketplace.',
  },
  '/login': {
    title: 'Login | Peep Online Marketplace',
    description: 'Sign in to your Peep Online Marketplace account and manage your orders and profile.',
  },
  '/register': {
    title: 'Create Account | Peep Online Marketplace',
    description: 'Create a Peep Online Marketplace account to shop, save orders, and manage your profile.',
  },
};

const ensureMeta = (selector, attr, value) => {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement('meta');
    if (selector.startsWith('meta[property=')) {
      tag.setAttribute('property', value);
    } else {
      tag.setAttribute('name', value);
    }
    document.head.appendChild(tag);
  }
  tag.setAttribute(attr, value);
};

const setMetaContent = (name, content) => {
  let tag = document.head.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const setPropertyContent = (property, content) => {
  let tag = document.head.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const setCanonical = (path) => {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  const canonicalUrl = `${DEFAULT_CANONICAL}${path === '/' ? '' : path}`;
  link.setAttribute('href', canonicalUrl);
};

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Peep Online Marketplace',
  url: DEFAULT_CANONICAL,
  logo: `${DEFAULT_CANONICAL}/logo.png`,
  sameAs: [
    'https://www.facebook.com/844395632089629',
    'https://instagram.com/PeepOnlinemarketplace',
    'https://wa.me/233503035014'
  ],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Circle Tiptoe Lane 5',
    addressLocality: 'Accra',
    addressCountry: 'GH'
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+233503035014',
    contactType: 'customer support',
    areaServed: 'GH',
    availableLanguage: ['English']
  }
};

const Seo = ({ pathname }) => {
  useEffect(() => {
    const meta = pageMeta[pathname] || pageMeta['/'];

    document.title = meta.title;
    setMetaContent('description', meta.description);
    setMetaContent('keywords', 'Peep, tech store Accra, laptops Ghana, phone shop Accra, repairs Accra, computer shop, accessories Ghana');
    setMetaContent('robots', 'index, follow');
    setMetaContent('theme-color', '#050d1a');
    setPropertyContent('og:type', 'website');
    setPropertyContent('og:title', meta.title);
    setPropertyContent('og:description', meta.description);
    setPropertyContent('og:site_name', 'Peep Online Marketplace');
    setPropertyContent('og:url', `${DEFAULT_CANONICAL}${pathname === '/' ? '' : pathname}`);
    setPropertyContent('og:image', `${DEFAULT_CANONICAL}/logo.png`);
    setPropertyContent('twitter:card', 'summary_large_image');
    setPropertyContent('twitter:title', meta.title);
    setPropertyContent('twitter:description', meta.description);
    setPropertyContent('twitter:image', `${DEFAULT_CANONICAL}/logo.png`);
    setCanonical(pathname);

    const existingScript = document.getElementById('peep-structured-data');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = 'peep-structured-data';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(orgSchema);
    document.head.appendChild(script);
  }, [pathname]);

  return null;
};

export default Seo;
