import { Link } from 'react-router-dom';

export default function Forbidden() {
  return (
    <div className="mx-auto mt-10 max-w-xl rounded-xl border border-red-200 bg-white p-6 text-center">
      <h1 className="text-2xl font-bold text-red-700">403 Forbidden</h1>
      <p className="mt-2 text-sm text-gray-700">You do not have permission to access this page.</p>
      <Link
        to="/"
        className="mt-4 inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
      >
        Back to Home
      </Link>
    </div>
  );
}

