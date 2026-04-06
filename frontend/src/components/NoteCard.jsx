import { Link } from 'react-router-dom';

export default function NoteCard({ title, subtitle, thumbnailUrl, children, footer, to }) {
  const containerClasses = "mx-auto block w-full overflow-hidden rounded-2xl border border-white/60 bg-white/40 bg-gradient-to-br from-white/80 to-amber-50/30 shadow-md backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:border-white/80 hover:shadow-xl hover:shadow-amber-900/10";

  // If there's a destination URL, wrap the entire card cleanly in a React Router Link
  if (to) {
    return (
      <Link to={to} className={containerClasses}>
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title || 'thumbnail'} className="w-full aspect-[1] object-cover" />
        ) : null}

        <div className="p-4">
          {title ? <h3 className="text-base font-semibold text-gray-900">{title}</h3> : null}
          {subtitle ? <p className="mt-1 text-sm text-gray-600">{subtitle}</p> : null}

          {children ? <div className="mt-3">{children}</div> : null}

          {footer ? <div className="mt-4">{footer}</div> : null}
        </div>
      </Link>
    );
  }

  // Otherwise, just return a standard un-clickable <div> container
  return (
    <div className={containerClasses}>
      {thumbnailUrl ? (
        <img src={thumbnailUrl} alt={title || 'thumbnail'} className="w-full aspect-[1] object-cover" />
      ) : null}

      <div className="p-4">
        {title ? <h3 className="text-base font-semibold text-gray-900">{title}</h3> : null}
        {subtitle ? <p className="mt-1 text-sm text-gray-600">{subtitle}</p> : null}

        {children ? <div className="mt-3">{children}</div> : null}

        {footer ? <div className="mt-4">{footer}</div> : null}
      </div>
    </div>
  );
}

