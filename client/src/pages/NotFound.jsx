import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl font-bold text-primary-100 select-none">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mt-4">Page not found</h1>
      <p className="text-gray-500 mt-2 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link to="/" className="btn-primary mt-8">
        ← Back to Home
      </Link>
    </div>
  );
}
