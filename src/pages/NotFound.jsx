import { Link } from 'react-router-dom';
import { Ghost, House } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function NotFound({ title = 'Page not found', message = "The page you're looking for doesn't exist." }) {
  useDocumentTitle(title);
  return (
    <div className="page-pad">
      <EmptyState
        icon={Ghost}
        title={title}
        message={<p>{message}</p>}
        action={
          <Link to="/" className="btn btn--primary">
            <House size={18} aria-hidden="true" /> Back to home
          </Link>
        }
      />
    </div>
  );
}
