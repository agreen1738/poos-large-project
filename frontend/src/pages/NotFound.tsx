import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found">
      <h1>404</h1>
      <p>Page Not Found</p>
      <button onClick={() => navigate('/')}>Go Home</button>
    </div>
  );
}

export default NotFound;