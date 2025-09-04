import React, { useState } from 'react';
function ReviewForm({ reservationId }) {
  const [review, setReview] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const res = await fetch('/api/traveler/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId, review })
      });
      if (!res.ok) throw new Error('Review failed');
      setSuccess('Review submitted!');
      setReview('');
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <textarea value={review} onChange={e => setReview(e.target.value)} required placeholder="Your review" />
      <button type="submit">Submit Review</button>
      {success && <div>{success}</div>}
      {error && <div>{error}</div>}
    </form>
  );
}
export default ReviewForm;
