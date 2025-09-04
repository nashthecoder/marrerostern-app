import React, { useEffect, useState } from 'react';
function WelcomeBooklet({ reservationId }) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    fetch(`/api/traveler/booklet?reservationId=${reservationId}`)
      .then(res => res.ok ? res.text() : Promise.reject('Not found'))
      .then(setContent)
      .catch(setError);
  }, [reservationId]);
  if (error) return <div>Error: {error}</div>;
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}
export default WelcomeBooklet;
