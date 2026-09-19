// components/RatingStars.jsx
export default function RatingStars({ rating, max = 5 }) {
  const filled = Math.round(parseFloat(rating));
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < filled ? 'text-yellow-400' : 'text-gray-700'}>★</span>
      ))}
      <span className="ml-1 text-xs text-gray-500">{parseFloat(rating).toFixed(1)}</span>
    </div>
  );
}
