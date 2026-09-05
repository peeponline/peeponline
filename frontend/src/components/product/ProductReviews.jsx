import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [canReview, setCanReview] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get(`/products/${productId}/reviews`);
        setReviews(res.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchReviews();
  }, [productId]);

  useEffect(() => {
    if (!user) {
      setCanReview(false);
      return;
    }
    api.get(`/products/${productId}/review-eligibility`)
      .then((response) => setCanReview(response.data.eligible))
      .catch(() => setCanReview(false));
  }, [productId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/products/${productId}/reviews`, { rating, comment });
      toast.success('Review added');
      // Refresh reviews
      const res = await api.get(`/products/${productId}/reviews`);
      setReviews(res.data.data);
      setComment('');
      setRating(5);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add review');
    }
  };

  return (
    <div>
      {canReview && (
        <form onSubmit={handleSubmit} className="peep-review-form">
          <h3>Share your experience</h3>
          <p>You purchased this product. Tell other customers what you think.</p>
          <select
            value={rating}
            onChange={(e) => setRating(parseInt(e.target.value))}
            className="peep-review-rating"
          >
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>
                {r} Star{r > 1 ? 's' : ''}
              </option>
            ))}
          </select>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Your review..."
            className="peep-review-textarea"
            rows="3"
            required
          />
          <button
            type="submit"
            className="btn btn-primary"
          >
            Submit Review
          </button>
        </form>
      )}
      <div className="peep-review-list">
        {reviews.length === 0 && <p className="peep-review-empty">No reviews yet.</p>}
        {reviews.map((review) => (
          <div key={review._id} className="peep-review-item">
            <div className="peep-review-meta">
              <strong>{review.user?.name || 'Anonymous'}</strong>
              <span>{'★'.repeat(review.rating)}<i>{'★'.repeat(5 - review.rating)}</i></span>
            </div>
            <p>{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReviews;