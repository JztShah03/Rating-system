import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ThankYouPage({ onClearTechnician }) {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(3);

  useEffect(() => {
    onClearTechnician();
  }, [onClearTechnician]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      navigate('/', { replace: true });
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [navigate, secondsLeft]);

  return (
    <main className="page page--thank-you">
      <motion.section
        className="thank-you-card"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        <div className="thank-you-card__icon">✓</div>
        <h1>Thank you for your feedback!</h1>
        <p>Redirecting in {secondsLeft} seconds...</p>
        <div className="countdown-bar" aria-hidden="true">
          <span style={{ width: `${(secondsLeft / 3) * 100}%` }} />
        </div>
      </motion.section>
    </main>
  );
}
