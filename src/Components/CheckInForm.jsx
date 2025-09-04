import React, { useState } from 'react';
function CheckInForm({ reservationId }) {
  const [form, setForm] = useState({ name: '', arrivalTime: '', notes: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const res = await fetch('/api/traveler/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId, ...form })
      });
      if (!res.ok) throw new Error('Check-in failed');
      setSuccess('Check-in submitted!');
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
      <input name="arrivalTime" value={form.arrivalTime} onChange={handleChange} placeholder="Arrival Time" required />
      <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" />
      <button type="submit">Submit Check-In</button>
      {success && <div>{success}</div>}
      {error && <div>{error}</div>}
    </form>
  );
}
export default CheckInForm;
