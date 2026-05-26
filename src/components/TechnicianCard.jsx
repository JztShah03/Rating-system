import { motion } from 'framer-motion';

export default function TechnicianCard({ technician, onSelect }) {
  return (
    <motion.button
      className="technician-card"
      onClick={() => onSelect(technician)}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      type="button"
      aria-label={`Select technician ${technician.name}`}
    >
      <img className="technician-card__image" src={technician.image} alt={`${technician.name} profile`} />
      <div className="technician-card__content">
        <h2>{technician.name}</h2>
        <p>{technician.id}</p>
      </div>
    </motion.button>
  );
}
