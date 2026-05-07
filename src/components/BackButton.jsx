import { ArrowLeft } from 'lucide-react';

export default function BackButton({ onClick, label = 'Back' }) {
  return (
    <button className="back-button" onClick={onClick} type="button" aria-label={label}>
      <ArrowLeft size={20} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
