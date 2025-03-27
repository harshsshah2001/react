import React from 'react';
import './thankyou.css';

const ThankYouPage = () => {
  return (
    <div className="thank-you-container">
      <div className="thank-you-card">
        <h1 className="thank-you-title">Thank You!</h1>
        <p className="thank-you-message">
          We appreciate your time and effort. Your submission has been received successfully.
        </p>
        <div className="thank-you-details">
          <p>We'll get back to you soon.</p>
          <p>If you have any questions, feel free to contact us at:</p>
          <a href="mailto:info@endel.digital" className="contact-link">
          info@endel.digital
          </a>
        </div>
        <button className="home-button" onClick={() => window.location.href = '#/'}>
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default ThankYouPage;
