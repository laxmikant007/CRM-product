import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProduct, createProduct, updateProduct, reset } from '../features/product/productSlice';
import { logout } from '../features/auth/authSlice';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { product, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.products
  );

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    discountPercentage: '',
    rating: '',
    stock: '',
    brand: '',
    category: '',
    thumbnail: '',
    images: ['', '', ''],
  });

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Check if editing or adding
  const isEditing = Boolean(id);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (isEditing) {
      dispatch(getProduct(id));
    }

    return () => {
      dispatch(reset());
    };
  }, [id, user, isEditing, navigate, dispatch]);

  useEffect(() => {
    // If editing and product is loaded, populate form
    if (isEditing && product) {
      // Create a copy of the product with only the fields we need
      const productCopy = {
        title: product.title || '',
        description: product.description || '',
        price: product.price || '',
        discountPercentage: product.discountPercentage || '',
        rating: product.rating || '',
        stock: product.stock || '',
        brand: product.brand || '',
        category: product.category || '',
        thumbnail: product.thumbnail || '',
        images: product.images || ['', '', ''],
      };
      
      setFormData(productCopy);
    }
  }, [product, isEditing]);

  useEffect(() => {
    if (isSubmitting && isSuccess) {
      setIsSubmitting(false);
      navigate('/products');
    }

    if (isSubmitting && isError) {
      setIsSubmitting(false);
      setError(message);
    }
  }, [isSubmitting, isSuccess, isError, message, navigate]);

  const onLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('images')) {
      const index = parseInt(name.split('-')[1]);
      const newImages = [...formData.images];
      newImages[index] = value;
      
      setFormData({
        ...formData,
        images: newImages,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Filter out empty image URLs
    const images = formData.images.filter(image => image.trim() !== '');

    // Convert price, discount, rating, and stock to numbers
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      discountPercentage: parseFloat(formData.discountPercentage),
      rating: parseFloat(formData.rating),
      stock: parseInt(formData.stock),
      images,
    };

    if (isEditing) {
      dispatch(updateProduct({ id, productData }));
    } else {
      dispatch(createProduct(productData));
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="product-form-container">
      <nav className="dashboard-nav">
        <h1>{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
        <div className="nav-links">
          <button onClick={() => navigate('/')}>Dashboard</button>
          <button onClick={() => navigate('/products')}>Products</button>
          <button onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <div className="form-card">
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={onSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="title">Product Title*</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={onChange}
                placeholder="Enter product title"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="brand">Brand*</label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={onChange}
                placeholder="Enter brand name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category*</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={onChange}
                placeholder="Enter category"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price*</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={onChange}
                placeholder="Enter price"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="discountPercentage">Discount (%)</label>
              <input
                type="number"
                id="discountPercentage"
                name="discountPercentage"
                value={formData.discountPercentage}
                onChange={onChange}
                placeholder="Enter discount percentage"
                step="0.01"
                min="0"
                max="100"
              />
            </div>

            <div className="form-group">
              <label htmlFor="stock">Stock*</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={onChange}
                placeholder="Enter stock quantity"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="rating">Rating</label>
              <input
                type="number"
                id="rating"
                name="rating"
                value={formData.rating}
                onChange={onChange}
                placeholder="Enter rating (0-5)"
                step="0.1"
                min="0"
                max="5"
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">Description*</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={onChange}
              placeholder="Enter product description"
              rows="4"
              required
            ></textarea>
          </div>

          <div className="form-group full-width">
            <label htmlFor="thumbnail">Thumbnail URL*</label>
            <input
              type="url"
              id="thumbnail"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={onChange}
              placeholder="Enter thumbnail URL"
              required
            />
          </div>

          <div className="form-group full-width">
            <label>Additional Images (Optional)</label>
            {formData.images.map((image, index) => (
              <input
                key={index}
                type="url"
                name={`images-${index}`}
                value={image}
                onChange={onChange}
                placeholder={`Image URL ${index + 1}`}
                className="image-input"
              />
            ))}
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => navigate('/products')}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm; 