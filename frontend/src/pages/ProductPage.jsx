import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { getAssetUrl } from '../api/axiosConfig';
import { useCart } from '../context/CartContext';
import { useSaved } from '../context/SavedContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProductReviews from '../components/product/ProductReviews';
import toast from 'react-hot-toast';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const swipeStart = useRef(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isSaved, toggleSaved } = useSaved();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.data);
      } catch (error) {
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) addToCart(product._id, quantity, product);
  };

  const handleSave = () => {
    if (!user) {
      toast.error('Sign in or create an account to save items');
      navigate('/login');
      return;
    }
    toggleSaved(product._id);
  };

  const changeImage = (direction) => {
    setSelectedImage((current) => (current + direction + images.length) % images.length);
  };

  const handlePointerDown = (event) => {
    swipeStart.current = event.clientX;
  };

  const handlePointerUp = (event) => {
    if (swipeStart.current === null) return;
    const distance = event.clientX - swipeStart.current;
    if (Math.abs(distance) > 45) changeImage(distance < 0 ? 1 : -1);
    swipeStart.current = null;
  };

  const openZoom = () => {
    setZoomLevel(1);
    setIsZoomed(true);
  };

  const closeZoom = () => {
    setIsZoomed(false);
    setZoomLevel(1);
  };

  useEffect(() => {
    if (!isZoomed) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeZoom();
      if (event.key === 'ArrowLeft') changeImage(-1);
      if (event.key === 'ArrowRight') changeImage(1);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isZoomed]);

  if (loading) return <LoadingSpinner />;
  if (!product) return <div>Product not found</div>;

  const images = product.images?.length ? product.images : [{ url: '/placeholder.png' }];
  const imageUrl = getAssetUrl(images[selectedImage]?.url || images[0].url);
  const discountedPrice = product.price * (1 - product.discount / 100);

  return (
    <div className="peep-product-detail-page">
      <main className="peep-product-detail-shell">
        <a className="peep-product-back" href="/shop"><i className="ti ti-arrow-left"></i> Back to shop</a>
        <div className="peep-product-detail-grid">
          <section className="peep-product-gallery">
            <div className="peep-product-main-image" onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerCancel={() => { swipeStart.current = null; }}>
              <button className="peep-gallery-zoom-trigger" type="button" onClick={openZoom} aria-label="Zoom product image"><i className="ti ti-zoom-in"></i></button>
              {images.length > 1 && <><button className="peep-gallery-arrow previous" type="button" onClick={() => changeImage(-1)} aria-label="Previous product image"><i className="ti ti-chevron-left"></i></button><button className="peep-gallery-arrow next" type="button" onClick={() => changeImage(1)} aria-label="Next product image"><i className="ti ti-chevron-right"></i></button></>}
              <img src={imageUrl} alt={product.name} draggable="false" />
              {product.discount > 0 && <span className="peep-product-deal-badge">Deal -{product.discount}%</span>}
            </div>
            {images.length > 1 && <div className="peep-product-thumbnails">{images.map((image, index) => <button className={selectedImage === index ? 'active' : ''} type="button" key={image._id || image.url} onClick={() => setSelectedImage(index)}><img src={getAssetUrl(image.url)} alt={`${product.name} view ${index + 1}`} /></button>)}</div>}
          </section>
          <section className="peep-product-detail-copy">
            <div className="peep-product-detail-kicker">{product.tab || 'Technology'}{product.category?.name && ` · ${product.category.name}`}</div>
            <h1>{product.name}</h1>
            <div className="peep-product-detail-price"><strong>GHS {discountedPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>{product.discount > 0 && <span>GHS {Number(product.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>}</div>
            <div className={`peep-product-detail-stock ${product.stock > 0 ? 'available' : ''}`}><i className="ti ti-circle-check"></i>{product.stock > 0 ? `${product.stock} available in stock` : 'Currently out of stock'}</div>
            <div className="peep-product-description"><h2>Product description</h2><p>{product.description}</p></div>
            <div className="peep-product-buy"><label>Quantity<div className="peep-quantity-stepper"><button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} disabled={quantity <= 1} aria-label="Reduce quantity"><i className="ti ti-minus"></i></button><input type="number" min="1" max={product.stock} value={quantity} onChange={(event) => setQuantity(Math.max(1, Math.min(product.stock || 1, parseInt(event.target.value, 10) || 1)))} aria-label="Quantity" /><button type="button" onClick={() => setQuantity((current) => Math.min(product.stock || 1, current + 1))} disabled={quantity >= product.stock} aria-label="Increase quantity"><i className="ti ti-plus"></i></button></div></label><button className="btn btn-primary" type="button" onClick={handleAddToCart} disabled={product.stock === 0}><i className="ti ti-shopping-cart"></i>{product.stock === 0 ? 'Out of stock' : 'Add to cart'}</button><button className={`peep-save-product ${isSaved(product._id) ? 'saved' : ''}`} type="button" onClick={handleSave} aria-pressed={isSaved(product._id)}>{isSaved(product._id) ? <span className="peep-filled-heart" aria-hidden="true">&#9829;</span> : <i className="ti ti-heart" aria-hidden="true"></i>}{isSaved(product._id) ? 'Saved' : 'Save'}</button></div>
          </section>
        </div>
      <section className="peep-product-reviews"><h2>Reviews</h2>
        <ProductReviews productId={product._id} />
      </section>
      </main>
      {isZoomed && <div className="peep-product-lightbox" role="dialog" aria-modal="true" aria-label={`${product.name} enlarged image`} onClick={closeZoom}>
        <button className="peep-lightbox-close" type="button" onClick={closeZoom} aria-label="Close enlarged image"><i className="ti ti-x"></i></button>
        {images.length > 1 && <><button className="peep-gallery-arrow previous" type="button" onClick={(event) => { event.stopPropagation(); changeImage(-1); }} aria-label="Previous product image"><i className="ti ti-chevron-left"></i></button><button className="peep-gallery-arrow next" type="button" onClick={(event) => { event.stopPropagation(); changeImage(1); }} aria-label="Next product image"><i className="ti ti-chevron-right"></i></button></>}
        <div className="peep-lightbox-content" onClick={(event) => event.stopPropagation()}>
          <img src={imageUrl} alt={product.name} style={{ transform: `scale(${zoomLevel})` }} />
          <div className="peep-lightbox-controls"><button type="button" onClick={() => setZoomLevel((level) => Math.max(1, level - 0.25))} aria-label="Zoom out"><i className="ti ti-minus"></i></button><span>{Math.round(zoomLevel * 100)}%</span><button type="button" onClick={() => setZoomLevel((level) => Math.min(3, level + 0.25))} aria-label="Zoom in"><i className="ti ti-plus"></i></button></div>
        </div>
      </div>}
    </div>
  );
};

export default ProductPage;