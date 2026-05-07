export const ratingOptions = [
  {
    value: 1,
    label: 'Very Unsatisfied',
    emoji: '😡',
    color: '#ef4444',
    background: '#fef2f2'
  },
  {
    value: 2,
    label: 'Unsatisfied',
    emoji: '🙁',
    color: '#f97316',
    background: '#fff7ed'
  },
  {
    value: 3,
    label: 'Neutral',
    emoji: '😐',
    color: '#eab308',
    background: '#fefce8'
  },
  {
    value: 4,
    label: 'Satisfied',
    emoji: '🙂',
    color: '#84cc16',
    background: '#f7fee7'
  },
  {
    value: 5,
    label: 'Excellent',
    emoji: '😄',
    color: '#22c55e',
    background: '#f0fdf4'
  }
];

export function getRatingOption(value) {
  return ratingOptions.find((option) => Number(option.value) === Number(value));
}

export function formatAverage(value) {
  if (!Number.isFinite(value)) return '0.00';
  return value.toFixed(2);
}

export function getRatingLabel(value) {
  return getRatingOption(value)?.label || 'Unknown';
}

export function getRatingEmoji(value) {
  return getRatingOption(value)?.emoji || '⭐';
}
