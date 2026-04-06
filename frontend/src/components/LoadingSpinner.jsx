export default function LoadingSpinner({ size = 20, className = '' }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-gray-300 border-t-gray-700 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

