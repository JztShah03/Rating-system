import { motion } from 'framer-motion';
import TechnicianCard from '../components/TechnicianCard';
import { technicians } from '../data/technicians';

export default function TechnicianSelection({ onSelectTechnician }) {
  return (
    <main className="page page--selection">
      <motion.section
        className="hero"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <span className="eyebrow">Service Feedback</span>
        <h2>Which service did you receive?</h2>
        <p>
          Your feedback helps us improve service quality and enhance user experience.
        </p>
      </motion.section>

      <section className="technician-grid" aria-label="Service list">
        {technicians.map((technician) => (
          <TechnicianCard key={technician.name} technician={technician} onSelect={onSelectTechnician} />
        ))}
      </section>
    </main>
  );
}
