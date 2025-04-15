import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProduct, reset, deleteProduct } from '../features/product/productSlice';
import { logout } from '../features/auth/authSlice';

const ProductDetail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const { product, isLoading, isError, message } = useSelector((state) => state.products);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (id) {
      dispatch(getProduct(id));
    }

    if (isError) {
      console.error(message);
    }

    return () => {
      dispatch(reset());
    };
  }, [id, user, navigate, isError, message, dispatch]);

  const onLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const onDelete = () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id));
      navigate('/products');
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!product) {
    return <div className="loading">Product not found</div>;
  }

  return (
    <div className="product-detail-container">
      <nav className="dashboard-nav">
        <h1>Product Detail</h1>
        <div className="nav-links">
          <button onClick={() => navigate('/')}>Dashboard</button>
          <button onClick={() => navigate('/products')}>Products</button>
          <button onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <div className="product-detail-card">
        <div className="product-header">
          <h2>{product.title}</h2>
          <div className="action-buttons">
            <button className="edit-btn" onClick={() => navigate(`/products/edit/${product.id}`)}>
              Edit Product
            </button>
            <button className="delete-btn" onClick={onDelete}>
              Delete Product
            </button>
          </div>
        </div>

        <div className="product-content">
          <div className="product-images">
            <div className="main-image">
              <img src={product.thumbnail} alt={product.title} />
            </div>
            <div className="image-gallery">
              {product.images && product.images.map((image, index) => (
                <img key={index} src={image} alt={`${product.title}-${index}`} />
              ))}
            </div>
          </div>

          <div className="product-info">
            <div className="info-group">
              <h3>Basic Information</h3>
              <div className="info-row">
                <span className="info-label">Brand:</span>
                <span className="info-value">{product.brand}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Category:</span>
                <span className="info-value">{product.category}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Price:</span>
                <span className="info-value">${product.price}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Stock:</span>
                <span className="info-value">{product.stock}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Rating:</span>
                <span className="info-value">{product.rating} / 5</span>
              </div>
            </div>

            <div className="info-group">
              <h3>Description</h3>
              <p className="product-description">{product.description}</p>
            </div>

            <div className="info-group">
              <h3>Additional Details</h3>
              <div className="info-row">
                <span className="info-label">Discount:</span>
                <span className="info-value">{product.discountPercentage}%</span>
              </div>
              <div className="info-row">
                <span className="info-label">Product ID:</span>
                <span className="info-value">{product.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 