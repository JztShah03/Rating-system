import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import EmojiBurst from '../components/EmojiBurst';
import RatingButton from '../components/RatingButton';
import { saveRating } from '../services/googleSheetService';
import { getDeviceType, getUserAgent } from '../utils/deviceHelpers';
import { getCampusByIp } from '../utils/campusHelpers';
import { ratingOptions } from '../utils/ratingHelpers';

export default function RatingPage({ selectedTechnician, onClearTechnician }) {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastAttempt, setLastAttempt] = useState(null);
  const [burstKey, setBurstKey] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!selectedTechnician) {
      navigate('/', { replace: true });
    }
  }, [navigate, selectedTechnician]);

  if (!selectedTechnician) return null;

  async function handleSubmit(option) {
    if (isSaving) return;

    setIsSaving(true);
    setSelectedRating(option.value);
    setLastAttempt(option);
    setErrorMessage('');
    setBurstKey(Date.now());

    const campus = await getCampusByIp();

    onClearTechnician();
    navigate('/thank-you', { replace: true });

    saveRating({
      technicianName: selectedTechnician.name,
      ratingValue: option.value,
      ratingLabel: option.label,
      emojiSelected: option.emoji,
      deviceType: getDeviceType(),
      userAgent: getUserAgent(),
      campus
    }).catch((error) => {
      console.error(error);
    });
  }

  function handleBack() {
    onClearTechnician();
    navigate('/', { replace: true });
  }

  return (
    <main className="page page--rating">
      <motion.section
        className="rating-panel"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <BackButton onClick={handleBack} label="Go Back" />

        <div className="selected-technician">
          <img src={selectedTechnician.image} alt={`${selectedTechnician.name} profile`} />
          <div className="service-name-box">
            <h1>{selectedTechnician.name}</h1>
          </div>
        </div>

        <div className="rating-copy">
          <h2>How was the service?</h2>
          <p>Please rate based on the service quality you received today.</p>
        </div>

        <div className="rating-actions" aria-label="Rating options">
          {ratingOptions.map((option) => (
            <RatingButton
              key={option.value}
              option={option}
              disabled={isSaving}
              isSelected={selectedRating === option.value}
              onClick={handleSubmit}
            />
          ))}
        </div>

        <div className="burst-anchor">
          <EmojiBurst emoji={lastAttempt?.emoji} burstKey={burstKey} />
        </div>

        <AnimatePresence>
          {errorMessage ? (
            <motion.div
              className="status-message status-message--error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              role="alert"
            >
              <p>{errorMessage}</p>
              <button type="button" onClick={() => lastAttempt && handleSubmit(lastAttempt)}>
                Retry
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.section>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="success-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="success-modal"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            >
              <div className="success-modal__icon">&#10003;</div>
              <h2>Thank you, we appreciate your evaluation!</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
