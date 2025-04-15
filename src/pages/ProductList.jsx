import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProducts, deleteProduct, reset } from '../features/product/productSlice';
import { logout } from '../features/auth/authSlice';

const ProductList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { products, isLoading, isError, message } = useSelector((state) => state.products);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [activeButton, setActiveButton] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [hoverRowIndex, setHoverRowIndex] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      dispatch(getProducts());
    }

    if (isError) {
      console.error(message);
    }

    return () => {
      dispatch(reset());
    };
  }, [user, navigate, isError, message, dispatch]);

  useEffect(() => {
    if (products) {
      // Filter products based on search term and category
      let filtered = [...products];
      
      if (searchTerm) {
        filtered = filtered.filter(
          (product) => 
            (product.title && product.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      if (currentCategory !== 'all') {
        filtered = filtered.filter(
          (product) => product.category === currentCategory
        );
      }
      
      setFilteredProducts(filtered);
    }
  }, [products, searchTerm, currentCategory]);

  const onLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const onDelete = (id) => {
    setSelectedProduct(id);
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id));
      setSelectedProduct(null);
    } else {
      setSelectedProduct(null);
    }
  };

  const getUniqueCategories = () => {
    if (!products) return [];
    const categories = [...new Set(products.map((product) => product.category))];
    return ['all', ...categories];
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div style={{ animation: 'pulse 1.5s infinite' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>Loading Products</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1.5s infinite' }}></span>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1.5s infinite .2s' }}></span>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1.5s infinite .4s' }}></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-list-container" style={{ animation: 'fadeIn 0.5s ease' }}>
      <nav className="dashboard-nav" style={{ animation: 'fadeSlideUp 0.5s ease' }}>
        <h1>Product Management</h1>
        <div className="nav-links">
          <button 
            onClick={() => navigate('/')}
            onMouseEnter={() => setActiveButton('dashboard')}
            onMouseLeave={() => setActiveButton(null)}
            style={{
              background: activeButton === 'dashboard' ? 'var(--gray-light)' : 'none',
              color: activeButton === 'dashboard' ? 'var(--primary)' : 'var(--dark)',
              transform: activeButton === 'dashboard' ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'all 0.2s ease'
            }}
          >
            Dashboard
          </button>
          <button 
            onClick={() => navigate('/products')}
            onMouseEnter={() => setActiveButton('products')}
            onMouseLeave={() => setActiveButton(null)}
            style={{
              background: activeButton === 'products' ? 'var(--gray-light)' : 'none',
              color: activeButton === 'products' ? 'var(--primary)' : 'var(--dark)',
              transform: activeButton === 'products' ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'all 0.2s ease'
            }}
          >
            Products
          </button>
          <button 
            onClick={onLogout}
            onMouseEnter={() => setActiveButton('logout')}
            onMouseLeave={() => setActiveButton(null)}
            style={{
              background: activeButton === 'logout' ? 'var(--gray-light)' : 'none',
              color: activeButton === 'logout' ? 'var(--danger)' : 'var(--dark)',
              transform: activeButton === 'logout' ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'all 0.2s ease'
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="product-controls" style={{ animation: 'fadeSlideUp 0.6s ease' }}>
        <h2>All Products</h2>
        <button 
          className="add-product-btn" 
          onClick={() => navigate('/products/add')}
          onMouseEnter={() => setActiveButton('add')}
          onMouseLeave={() => setActiveButton(null)}
          style={{
            transform: activeButton === 'add' ? 'translateY(-2px)' : 'translateY(0)',
            boxShadow: activeButton === 'add' ? '0 6px 12px rgba(0, 0, 0, 0.15)' : 'var(--shadow)',
            background: activeButton === 'add' ? 'var(--primary-dark)' : 'var(--primary)',
            transition: 'all 0.2s ease'
          }}
        >
          Add New Product
        </button>
      </div>

      <div className="filter-container" style={{ animation: 'fadeSlideUp 0.7s ease' }}>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              borderColor: searchFocused ? 'var(--primary)' : 'var(--gray-light)',
              boxShadow: searchFocused ? '0 0 0 3px rgba(67, 97, 238, 0.1)' : 'none',
              transition: 'all 0.2s ease'
            }}
          />
        </div>
        <div className="category-filter">
          <select
            value={currentCategory}
            onChange={(e) => setCurrentCategory(e.target.value)}
            style={{
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
          >
            {getUniqueCategories().map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredProducts && filteredProducts.length > 0 ? (
        <div className="product-table-container" style={{ animation: 'fadeSlideUp 0.8s ease' }}>
          <table className="product-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => (
                <tr 
                  key={product.id} 
                  style={{
                    background: selectedProduct === product.id 
                      ? 'rgba(249, 65, 68, 0.05)'
                      : hoverRowIndex === index 
                        ? 'rgba(67, 97, 238, 0.05)' 
                        : 'transparent',
                    transition: 'background-color 0.2s ease',
                    animation: `fadeSlideUp ${0.8 + index * 0.05}s ease`
                  }}
                  onMouseEnter={() => setHoverRowIndex(index)}
                  onMouseLeave={() => setHoverRowIndex(null)}
                >
                  <td className="product-image">
                    <img 
                      src={product.thumbnail} 
                      alt={product.title} 
                      style={{
                        transform: hoverRowIndex === index ? 'scale(1.1)' : 'scale(1)',
                        transition: 'transform 0.3s ease'
                      }}
                    />
                  </td>
                  <td>{product.title}</td>
                  <td>{product.brand}</td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: 'var(--gray-light)',
                        color: 'var(--dark)',
                        fontSize: '14px',
                      }}
                    >
                      {product.category}
                    </span>
                  </td>
                  <td style={{ 
                    fontWeight: '600', 
                    color: 'var(--primary-dark)'
                  }}>
                    ${product.price}
                  </td>
                  <td
                    style={{
                      color: product.stock < 10 ? 'var(--danger)' : product.stock < 50 ? 'var(--warning)' : 'var(--success)'
                    }}
                  >
                    {product.stock}
                  </td>
                  <td className="action-buttons">
                    <button
                      className="view-btn"
                      onClick={() => navigate(`/products/${product.id}`)}
                      style={{
                        transform: hoverRowIndex === index ? 'scale(1.05)' : 'scale(1)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      View
                    </button>
                    <button
                      className="edit-btn"
                      onClick={() => navigate(`/products/edit/${product.id}`)}
                      style={{
                        transform: hoverRowIndex === index ? 'scale(1.05)' : 'scale(1)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => onDelete(product.id)}
                      style={{
                        transform: hoverRowIndex === index ? 'scale(1.05)' : 'scale(1)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-products" style={{ animation: 'fadeIn 0.5s ease' }}>
          <p style={{ fontSize: '18px' }}>No products found.</p>
          <button 
            className="add-product-btn" 
            onClick={() => navigate('/products/add')}
            style={{ 
              marginTop: '15px',
              animation: 'pulse 2s infinite'
            }}
          >
            Add Your First Product
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList; 