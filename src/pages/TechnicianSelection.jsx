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
        <h1>Please Select the ICT Service you Received</h1>
        <p>
          
           Your feedback helps us improve service quality and enhance customer experience.
        </p>
      </motion.section>

      <section className="technician-grid" aria-label="Technician list">
        {technicians.map((technician) => (
          <TechnicianCard key={technician.id} technician={technician} onSelect={onSelectTechnician} />
        ))}
      </section>
    </main>
  );
}
