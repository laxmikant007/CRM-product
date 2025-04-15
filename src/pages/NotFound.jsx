import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for doesn't exist or has been moved.</p>
      <div className="not-found-actions">
        <button onClick={() => navigate('/')}>Go to Dashboard</button>
        <button onClick={() => navigate('/products')}>View Products</button>
      </div>
    </div>
  );
};

export default NotFound; 