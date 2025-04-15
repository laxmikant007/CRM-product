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
            product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.brand.toLowerCase().includes(searchTerm.toLowerCase())
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
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id));
    }
  };

  const getUniqueCategories = () => {
    if (!products) return [];
    const categories = [...new Set(products.map((product) => product.category))];
    return ['all', ...categories];
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="product-list-container">
      <nav className="dashboard-nav">
        <h1>Product Management</h1>
        <div className="nav-links">
          <button onClick={() => navigate('/')}>Dashboard</button>
          <button onClick={() => navigate('/products')}>Products</button>
          <button onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <div className="product-controls">
        <h2>All Products</h2>
        <button className="add-product-btn" onClick={() => navigate('/products/add')}>
          Add New Product
        </button>
      </div>

      <div className="filter-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="category-filter">
          <select
            value={currentCategory}
            onChange={(e) => setCurrentCategory(e.target.value)}
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
        <div className="product-table-container">
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
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="product-image">
                    <img src={product.thumbnail} alt={product.title} />
                  </td>
                  <td>{product.title}</td>
                  <td>{product.brand}</td>
                  <td>{product.category}</td>
                  <td>${product.price}</td>
                  <td>{product.stock}</td>
                  <td className="action-buttons">
                    <button
                      className="view-btn"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      View
                    </button>
                    <button
                      className="edit-btn"
                      onClick={() => navigate(`/products/edit/${product.id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => onDelete(product.id)}
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
        <div className="no-products">
          <p>No products found.</p>
        </div>
      )}
    </div>
  );
};

export default ProductList; 