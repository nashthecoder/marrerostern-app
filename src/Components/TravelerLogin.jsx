import React, { useState } from 'react';

function TravelerLogin() {
  const [reservationNumber, setReservationNumber] = useState('');
  const [error, setError] = useState('');
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/traveler/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationNumber })
      });
      if (!res.ok) throw new Error('Login failed');
      // TODO: handle login (store token, redirect, etc.)
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <form onSubmit={handleLogin}>
      <input value={reservationNumber} onChange={e => setReservationNumber(e.target.value)} placeholder="Reservation Number" required />
      <button type="submit">Login</button>
      {error && <div>{error}</div>}
    </form>
  );
}
export default TravelerLogin;
