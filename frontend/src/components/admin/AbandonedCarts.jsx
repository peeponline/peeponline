import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axiosConfig';

const defaultSubject = 'You left something in your cart';
const defaultMessage = `Hi there,\n\nWe noticed you left a few items in your cart and wanted to make sure you did not forget about them.\n\nYou can return to your cart anytime to finish your order.\n\nThanks for shopping with Peep.\n\nPeep Online Marketplace`;

const AbandonedCarts = () => {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);
  const [emailDrafts, setEmailDrafts] = useState({});

  const loadAbandonedCarts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/abandoned-carts');
      const list = response.data.data || [];
      const drafts = {};
      list.forEach((cart) => {
        drafts[cart._id] = {
          subject: defaultSubject,
          message: defaultMessage.replace('Hi there', `Hi ${cart.user?.name || 'there'}`),
        };
      });
      setCarts(list);
      setEmailDrafts(drafts);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load abandoned carts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAbandonedCarts();
  }, []);

  const handleDraftChange = (cartId, field, value) => {
    setEmailDrafts((current) => ({
      ...current,
      [cartId]: {
        ...current[cartId],
        [field]: value,
      },
    }));
  };

  const sendReminder = async (cartId) => {
    const draft = emailDrafts[cartId] || {};
    const subject = (draft.subject || '').trim() || defaultSubject;
    const message = (draft.message || '').trim() || defaultMessage;

    setSendingId(cartId);

    try {
      await api.post(`/admin/abandoned-carts/${cartId}/email`, {
        subject,
        message,
      });
      toast.success('Reminder email sent');
      await loadAbandonedCarts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not send reminder');
    } finally {
      setSendingId(null);
    }
  };

  return (
    <section className="card peep-admin-panel peep-admin-table-panel">
      <div className="peep-admin-panel-heading">
        <div>
          <span>Recovery</span>
          <h2>Abandoned carts</h2>
        </div>
        <button className="peep-admin-refresh" type="button" onClick={loadAbandonedCarts} aria-label="Refresh abandoned carts" title="Refresh abandoned carts">
          <i className="ti ti-refresh"></i>
        </button>
      </div>

      {loading ? (
        <p className="peep-admin-muted">Loading abandoned carts...</p>
      ) : carts.length === 0 ? (
        <p className="peep-admin-muted">No abandoned carts found for users with active accounts.</p>
      ) : (
        <div className="peep-admin-abandoned-list">
          {carts.map((cart) => (
            <div className="peep-admin-abandoned-card" key={cart._id}>
              <div className="peep-admin-abandoned-header">
                <div>
                  <strong>{cart.user?.name || 'Unknown user'}</strong>
                  <span>{cart.user?.email || 'No email'}</span>
                </div>
                <div className="peep-admin-abandoned-meta">
                  <small>{new Date(cart.updatedAt).toLocaleDateString()} · {new Date(cart.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                  <em>{cart.hoursSinceUpdate}h since last update</em>
                </div>
              </div>

              <div className="peep-admin-abandoned-summary">
                <div>
                  <span>Items</span>
                  <strong>{cart.itemCount}</strong>
                </div>
                <div>
                  <span>Value</span>
                  <strong>GHS {Number(cart.totalPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                </div>
                <div>
                  <span>Joined</span>
                  <strong>{new Date(cart.user?.createdAt || Date.now()).toLocaleDateString()}</strong>
                </div>
              </div>

              <div className="peep-admin-abandoned-items">
                {(cart.items || []).map((item) => (
                  <span key={`${cart._id}-${item.product?._id || item.product || Math.random()}`}>
                    {item.product?.name || 'Product'} x{item.quantity || 1}
                  </span>
                ))}
              </div>

              <div className="peep-admin-abandoned-email">
                <label>
                  Subject
                  <input
                    type="text"
                    value={emailDrafts[cart._id]?.subject || defaultSubject}
                    onChange={(event) => handleDraftChange(cart._id, 'subject', event.target.value)}
                  />
                </label>

                <label>
                  Message
                  <textarea
                    rows="5"
                    value={emailDrafts[cart._id]?.message || defaultMessage}
                    onChange={(event) => handleDraftChange(cart._id, 'message', event.target.value)}
                  />
                </label>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => sendReminder(cart._id)}
                  disabled={sendingId === cart._id}
                >
                  {sendingId === cart._id ? 'Sending...' : 'Send reminder'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default AbandonedCarts;
