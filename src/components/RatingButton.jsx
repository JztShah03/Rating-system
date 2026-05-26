import { motion } from 'framer-motion';

export default function RatingButton({ option, disabled, isSelected, onClick }) {
  return (
    <motion.button
      className={`rating-button ${isSelected ? 'rating-button--selected' : ''}`}
      style={{
        '--rating-color': option.color,
        '--rating-bg': option.background
      }}
      onClick={() => onClick(option)}
      disabled={disabled}
      type="button"
      whileHover={disabled ? undefined : { y: -5 }}
      whileTap={disabled ? undefined : { scale: 0.94 }}
      aria-label={`Rate ${option.label}`}
    >
      <span className="rating-button__emoji" aria-hidden="true">
        {option.emoji}
      </span>
      <span className="rating-button__label">{option.label}</span>
      {/* The rating number has been removed here */}
    </motion.button>
  );
}