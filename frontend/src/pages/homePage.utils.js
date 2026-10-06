const isTruthyFlag = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return ['true', '1', 'yes', 'y', 'on'].includes(normalized);
  }
  return false;
};

export const normalizeProductList = (products = []) => {
  if (!Array.isArray(products)) return [];
  return products.filter(Boolean);
};

export const getHomeFeaturedProducts = (products = []) => {
  const catalog = normalizeProductList(products);
  if (catalog.length === 0) return [];

  const featured = catalog.filter((product) => isTruthyFlag(product?.isFeatured));

  return (featured.length ? featured : catalog).slice(0, 6);
};
