import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';

const OrderSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference') || searchParams.get('trxref');
      if (reference) {
        try {
          await api.get(`/payments/verify?reference=${encodeURIComponent(reference)}`);
          toast.success('Payment successful! Order confirmed.');
        } catch (error) {
          toast.error('Payment verification failed. Please contact support.');
        }
      } else {
        toast.error('Missing payment details');
      }
    };
    verifyPayment();
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">Thank You!</h1>
      <p className="text-lg mb-6">Your order has been placed successfully.</p>
      <p>You will receive a confirmation email shortly.</p>
      <button
        onClick={() => navigate('/')}
        className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Continue Shopping
      </button>
    </div>
  );
};

export default OrderSuccessPage;