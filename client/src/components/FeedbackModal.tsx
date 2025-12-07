// src/components/FeedbackModal.tsx
import React, { useState } from 'react';
import './FeedbackModal.css';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment,
          email: email || 'anonymous',
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          onClose();
          // Reset form
          setRating(0);
          setComment('');
          setEmail('');
          setSubmitted(false);
        }, 2000);
      } else {
        alert('Failed to send feedback. Please try again.');
      }
    } catch (error) {
      console.error('Feedback error:', error);
      alert('Failed to send feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feedback-overlay" onClick={onClose}>
      <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
        <button className="feedback-close" onClick={onClose}>×</button>
        
        {!submitted ? (
          <>
            <h2 className="feedback-title">Send Feedback</h2>
            <p className="feedback-subtitle">Help us improve your meal planning experience!</p>
            
            <form onSubmit={handleSubmit}>
              <div className="feedback-section">
                <label>How would you rate your experience?</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star ${rating >= star ? 'active' : ''}`}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="feedback-section">
                <label htmlFor="comment">Tell us more (optional)</label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you like? What could be better?"
                  rows={4}
                />
              </div>

              <div className="feedback-section">
                <label htmlFor="email">Email (optional - for follow-up)</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>

              <button 
                type="submit" 
                className="feedback-submit"
                disabled={rating === 0 || isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Feedback'}
              </button>
            </form>
          </>
        ) : (
          <div className="feedback-success">
            <div className="success-icon">✓</div>
            <h3>Thank you!</h3>
            <p>Your feedback helps us improve.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
