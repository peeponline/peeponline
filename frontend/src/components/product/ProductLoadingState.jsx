const ProductLoadingSkeleton = () => (
  <div className="prod-card peep-product-skeleton" aria-hidden="true">
    <div className="peep-skeleton-block peep-skeleton-image"></div>
    <div className="prod-info">
      <div className="peep-skeleton-block peep-skeleton-brand"></div>
      <div className="peep-skeleton-block peep-skeleton-title"></div>
      <div className="peep-skeleton-block peep-skeleton-description"></div>
      <div className="peep-skeleton-footer">
        <div className="peep-skeleton-block peep-skeleton-price"></div>
        <div className="peep-skeleton-block peep-skeleton-action"></div>
      </div>
    </div>
  </div>
);

const ProductLoadingState = () => (
  <div className="peep-shop-grid peep-shop-loading" role="status" aria-label="Loading products">
    {Array.from({ length: 6 }, (_, index) => <ProductLoadingSkeleton key={index} />)}
    <span className="sr-only">Loading products...</span>
  </div>
);

export default ProductLoadingState;