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
  
  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [activeButton, setActiveButton] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [hoverRowIndex, setHoverRowIndex] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

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
      
      // Apply sorting
      if (sortConfig.key) {
        filtered.sort((a, b) => {
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        });
      }
      
      setFilteredProducts(filtered);
      
      // Set page as loaded after a short delay for animation
      setTimeout(() => setPageLoaded(true), 300);
    }
  }, [products, searchTerm, currentCategory, sortConfig]);

  const onLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const onDelete = (id) => {
    setDeleteConfirmation(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmation) {
      dispatch(deleteProduct(deleteConfirmation));
      setDeleteConfirmation(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const getUniqueCategories = () => {
    if (!products) return [];
    const categories = [...new Set(products.map((product) => product.category))];
    return ['all', ...categories];
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#f8f9fa',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'fadeIn 0.5s ease',
        }}>
          <div style={{
            marginBottom: '20px',
            fontSize: '22px',
            color: '#4361ee',
            fontWeight: '600',
          }}>Loading Products</div>
          <div style={{
            display: 'flex',
            gap: '10px',
          }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: '#4361ee',
                animation: 'bounce 1.4s infinite ease-in-out both',
                animationDelay: `${i * 0.16}s`,
              }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-list-page" style={{
      minHeight: '100vh',
      background: '#f8f9fa',
      animation: 'fadeIn 0.5s ease',
    }}>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 30px',
        background: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        animation: 'slideDown 0.5s ease',
      }}>
        <h1 style={{
          color: '#333',
          margin: 0,
          fontSize: '24px',
          fontWeight: '600',
        }}>Product Management</h1>
        <div style={{
          display: 'flex',
          gap: '16px',
        }}>
          {['Dashboard', 'Products', 'Logout'].map((btnText) => (
            <button
              key={btnText}
              onClick={() => {
                if (btnText === 'Dashboard') navigate('/');
                else if (btnText === 'Products') navigate('/products');
                else if (btnText === 'Logout') onLogout();
              }}
              onMouseEnter={() => setActiveButton(btnText)}
              onMouseLeave={() => setActiveButton(null)}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: 'none',
                background: activeButton === btnText ? '#f1f3ff' : 'transparent',
                color: btnText === 'Logout' 
                  ? (activeButton === btnText ? '#f9414a' : '#666')
                  : (activeButton === btnText ? '#4361ee' : '#666'),
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                transform: activeButton === btnText ? 'translateY(-2px)' : 'translateY(0)',
              }}
            >
              {btnText}
            </button>
          ))}
        </div>
      </nav>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '30px 20px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          animation: 'slideUp 0.5s ease',
        }}>
          <h2 style={{
            margin: 0,
            color: '#333',
            fontSize: '22px',
            fontWeight: '600',
          }}>All Products</h2>
          <button 
            onClick={() => navigate('/products/add')}
            onMouseEnter={() => setActiveButton('add')}
            onMouseLeave={() => setActiveButton(null)}
            style={{
              padding: '12px 20px',
              background: activeButton === 'add' ? '#3a53cc' : '#4361ee',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              transform: activeButton === 'add' ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow: activeButton === 'add' 
                ? '0 8px 15px rgba(67, 97, 238, 0.3)' 
                : '0 4px 10px rgba(67, 97, 238, 0.2)',
            }}
          >
            Add New Product
          </button>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '20px',
          marginBottom: '30px',
          animation: 'slideUp 0.6s ease',
        }}>
          <div style={{
            flex: '1',
            position: 'relative',
          }}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: '100%',
                padding: '14px 20px',
                backgroundColor: 'white',
                border: `1px solid ${searchFocused ? '#4361ee' : '#ddd'}`,
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxShadow: searchFocused 
                  ? '0 0 0 3px rgba(67, 97, 238, 0.15)' 
                  : '0 2px 6px rgba(0,0,0,0.03)',
              }}
            />
            <svg 
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '18px',
                height: '18px',
                color: searchFocused ? '#4361ee' : '#888',
                transition: 'color 0.2s ease',
              }}
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <div style={{
            width: '200px',
          }}>
            <select
              value={currentCategory}
              onChange={(e) => setCurrentCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 20px',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                appearance: 'none',
                backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>')`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 16px center',
              }}
            >
              {getUniqueCategories().map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredProducts && filteredProducts.length > 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
            overflow: 'hidden',
            animation: `${pageLoaded ? 'fadeIn 0.5s ease' : 'none'}`,
            opacity: pageLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}>
            <div style={{
              overflowX: 'auto',
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}>
                <thead>
                  <tr style={{
                    background: '#f9fafc',
                    borderBottom: '1px solid #eee',
                  }}>
                    {['Image', 'Title', 'Brand', 'Category', 'Price', 'Stock', 'Actions'].map((header) => (
                      <th 
                        key={header}
                        onClick={() => ['Title', 'Brand', 'Price', 'Stock'].includes(header) && requestSort(header.toLowerCase())}
                        style={{
                          padding: '16px 20px',
                          textAlign: 'left',
                          fontWeight: '600',
                          color: '#555',
                          fontSize: '14px',
                          cursor: ['Title', 'Brand', 'Price', 'Stock'].includes(header) ? 'pointer' : 'default',
                          transition: 'all 0.2s ease',
                          position: 'relative',
                          userSelect: 'none',
                        }}
                      >
                        {header}
                        {['Title', 'Brand', 'Price', 'Stock'].includes(header) && (
                          <span style={{ 
                            marginLeft: '4px',
                            color: sortConfig.key === header.toLowerCase() ? '#4361ee' : '#ccc',
                          }}>
                            {getSortIndicator(header.toLowerCase())}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => (
                    <tr 
                      key={product.id} 
                      style={{
                        borderBottom: '1px solid #eee',
                        backgroundColor: deleteConfirmation === product.id 
                          ? 'rgba(249, 65, 68, 0.05)'
                          : hoverRowIndex === index 
                            ? 'rgba(67, 97, 238, 0.02)' 
                            : 'white',
                        transition: 'all 0.2s ease',
                        animation: `slideUp ${0.3 + index * 0.05}s ease`,
                      }}
                      onMouseEnter={() => setHoverRowIndex(index)}
                      onMouseLeave={() => setHoverRowIndex(null)}
                    >
                      <td style={{
                        padding: '16px 20px',
                        width: '80px',
                      }}>
                        <div style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          transition: 'all 0.3s ease',
                          transform: hoverRowIndex === index ? 'scale(1.05)' : 'scale(1)',
                        }}>
                          <img 
                            src={product.thumbnail} 
                            alt={product.title} 
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.3s ease',
                            }}
                          />
                        </div>
                      </td>
                      <td style={{
                        padding: '16px 20px',
                        fontWeight: '500',
                        color: '#333',
                      }}>
                        <div style={{
                          maxWidth: '250px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {product.title}
                        </div>
                      </td>
                      <td style={{
                        padding: '16px 20px',
                        color: '#666',
                      }}>
                        {product.brand}
                      </td>
                      <td style={{
                        padding: '16px 20px',
                      }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: '#f1f3ff',
                          color: '#4361ee',
                          fontSize: '13px',
                          fontWeight: '500',
                        }}>
                          {product.category}
                        </span>
                      </td>
                      <td style={{ 
                        padding: '16px 20px',
                        fontWeight: '600',
                        color: '#4361ee',
                      }}>
                        ${product.price}
                      </td>
                      <td style={{
                        padding: '16px 20px',
                        fontWeight: '500',
                      }}>
                        <span style={{
                          color: product.stock < 10 
                            ? '#f94144' 
                            : product.stock < 50 
                              ? '#ff9800' 
                              : '#4caf50',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          background: product.stock < 10 
                            ? 'rgba(249, 65, 68, 0.1)' 
                            : product.stock < 50 
                              ? 'rgba(255, 152, 0, 0.1)' 
                              : 'rgba(76, 175, 80, 0.1)',
                          fontSize: '14px',
                        }}>
                          {product.stock}
                        </span>
                      </td>
                      <td style={{
                        padding: '16px 20px',
                      }}>
                        {deleteConfirmation === product.id ? (
                          <div style={{
                            display: 'flex',
                            gap: '8px',
                            animation: 'fadeIn 0.2s ease',
                          }}>
                            <button
                              onClick={confirmDelete}
                              style={{
                                padding: '8px 16px',
                                background: '#f94144',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              Confirm
                            </button>
                            <button
                              onClick={cancelDelete}
                              style={{
                                padding: '8px 16px',
                                background: '#f1f3f5',
                                color: '#666',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{
                            display: 'flex',
                            gap: '8px',
                          }}>
                            {[
                              { text: 'View', color: '#4361ee', hoverColor: '#3a53cc', action: () => navigate(`/products/${product.id}`) },
                              { text: 'Edit', color: '#4caf50', hoverColor: '#3e9142', action: () => navigate(`/products/edit/${product.id}`) },
                              { text: 'Delete', color: '#f94144', hoverColor: '#e03a3c', action: () => onDelete(product.id) },
                            ].map((btn) => (
                              <button
                                key={btn.text}
                                onClick={btn.action}
                                onMouseEnter={() => setSelectedProduct(`${product.id}-${btn.text}`)}
                                onMouseLeave={() => setSelectedProduct(null)}
                                style={{
                                  padding: '8px 16px',
                                  background: selectedProduct === `${product.id}-${btn.text}` ? btn.hoverColor : btn.color,
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  transform: selectedProduct === `${product.id}-${btn.text}` 
                                    ? 'translateY(-2px) scale(1.03)' 
                                    : 'translateY(0) scale(1)',
                                  boxShadow: selectedProduct === `${product.id}-${btn.text}` 
                                    ? `0 4px 12px rgba(0,0,0,0.15)` 
                                    : 'none',
                                }}
                              >
                                {btn.text}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
            padding: '50px 20px',
            textAlign: 'center',
            animation: 'fadeIn 0.5s ease',
          }}>
            <div style={{
              fontSize: '20px',
              color: '#666',
              marginBottom: '20px',
            }}>
              No products found
            </div>
            <button 
              onClick={() => navigate('/products/add')}
              onMouseEnter={() => setActiveButton('addFirst')}
              onMouseLeave={() => setActiveButton(null)}
              style={{
                padding: '12px 20px',
                background: activeButton === 'addFirst' ? '#3a53cc' : '#4361ee',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: activeButton === 'addFirst' ? 'translateY(-3px)' : 'translateY(0)',
                boxShadow: activeButton === 'addFirst' 
                  ? '0 10px 20px rgba(67, 97, 238, 0.3)' 
                  : '0 4px 10px rgba(67, 97, 238, 0.2)',
                animation: 'pulse 2s infinite',
              }}
            >
              Add Your First Product
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ProductList; 