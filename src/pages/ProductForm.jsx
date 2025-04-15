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

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeField, setActiveField] = useState(null);
  const [activeButton, setActiveButton] = useState(null);
  const [formVisible, setFormVisible] = useState(false);

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
    
    // Set form as visible after a short delay for animation
    setTimeout(() => setFormVisible(true), 100);
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

  // Shared input field styling
  const getInputStyle = (fieldName) => ({
    width: '100%',
    color: 'black',
    padding: '12px 16px',
    fontSize: '15px',
    border: `1px solid ${activeField === fieldName ? '#4361ee' : '#ddd'}`,
    borderRadius: '8px',
    backgroundColor: '#f9fafc',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxShadow: activeField === fieldName ? '0 0 0 2px rgba(67, 97, 238, 0.15)' : 'none',
  });
  
  const getLabelStyle = (fieldName) => ({
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: activeField === fieldName ? '#4361ee' : '#555',
    transition: 'all 0.2s ease',
  });

  if (isLoading) {
    return (
      <div className="loading" style={{
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
            fontSize: '20px',
            color: '#4361ee',
            fontWeight: '500',
          }}>Loading product data...</div>
          <div style={{
            display: 'flex',
            gap: '8px',
          }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                width: '12px',
                height: '12px',
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
    <div className="product-form-page" style={{
      minHeight: '100vh',
      background: '#f8f9fa',
      animation: 'fadeIn 0.5s ease',
    }}>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        background: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        animation: 'slideDown 0.5s ease',
      }}>
        <h1 style={{
          color: '#333',
          margin: 0,
          fontSize: '24px',
          fontWeight: '600',
        }}>{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
        <div style={{
          display: 'flex',
          gap: '12px',
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
                padding: '8px 16px',
                borderRadius: '6px',
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
        maxWidth: '900px',
        margin: '30px auto',
        padding: '0 20px',
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
          padding: '30px',
          transform: formVisible ? 'translateY(0)' : 'translateY(20px)',
          opacity: formVisible ? 1 : 0,
          transition: 'all 0.5s ease',
        }}>
          {error && (
            <div style={{
              background: 'rgba(249, 65, 68, 0.05)',
              border: '1px solid rgba(249, 65, 68, 0.2)',
              color: '#f94144',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '14px',
              animation: 'shake 0.5s ease',
            }}>
              {error}
            </div>
          )}
          
          <form onSubmit={onSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '24px',
              marginBottom: '24px',
              color: 'black',
            }}>
              {[
                { name: 'title', label: 'Product Title*', type: 'text', placeholder: 'Enter product title', required: true, color: 'black' },
                { name: 'brand', label: 'Brand*', type: 'text', placeholder: 'Enter brand name', required: true, color: 'black' },
                { name: 'category', label: 'Category*', type: 'text', placeholder: 'Enter category', required: true, color: 'black' },
                { name: 'price', label: 'Price*', type: 'number', placeholder: 'Enter price', required: true, step: '0.01', min: '0' },
                { name: 'discountPercentage', label: 'Discount (%)', type: 'number', placeholder: 'Enter discount percentage', step: '0.01', min: '0', max: '100' },
                { name: 'stock', label: 'Stock*', type: 'number', placeholder: 'Enter stock quantity', min: '0', required: true },
                { name: 'rating', label: 'Rating', type: 'number', placeholder: 'Enter rating (0-5)', step: '0.1', min: '0', max: '5' },
              ].map((field) => (
                <div key={field.name} style={{
                  animation: `fadeIn 0.5s ease ${parseInt(field.name.length) % 5 * 0.1}s`,
                }}>
                  <label 
                    htmlFor={field.name}
                    style={getLabelStyle(field.name)}
                  >
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={onChange}
                    placeholder={field.placeholder}
                    required={field.required}
                    step={field.step}
                    min={field.min}
                    max={field.max}
                    onFocus={() => setActiveField(field.name)}
                    onBlur={() => setActiveField(null)}
                    style={getInputStyle(field.name)}
                  />
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '24px', animation: 'fadeIn 0.5s ease 0.4s' }}>
              <label 
                htmlFor="description"
                style={getLabelStyle('description')}
              >
                Description*
              </label>
              <textarea
                id="description"
                color='black'
                name="description"
                value={formData.description}
                onChange={onChange}
                placeholder="Enter product description"
                rows="4"
                required
                onFocus={() => setActiveField('description')}
                onBlur={() => setActiveField(null)}
                style={{
                  ...getInputStyle('description'),
                  resize: 'vertical',
                  minHeight: '100px',
                }}
              ></textarea>
            </div>

            <div style={{ marginBottom: '24px', animation: 'fadeIn 0.5s ease 0.5s' }}>
              <label 
                htmlFor="thumbnail"
                style={getLabelStyle('thumbnail')}
              >
                Thumbnail URL*
              </label>
              <input
                type="url"
                id="thumbnail"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={onChange}
                placeholder="Enter thumbnail URL"
                required
                onFocus={() => setActiveField('thumbnail')}
                onBlur={() => setActiveField(null)}
                style={getInputStyle('thumbnail')}
              />
              {formData.thumbnail && (
                <div style={{
                  marginTop: '10px',
                  padding: '10px',
                  background: '#f9fafc',
                  borderRadius: '8px',
                  border: '1px dashed #ddd',
                }}>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Thumbnail Preview:</div>
                  <img 
                    src={formData.thumbnail} 
                    alt="Thumbnail preview"
                    style={{
                      maxWidth: '100%',
                      height: '120px',
                      objectFit: 'contain',
                      borderRadius: '4px',
                    }} 
                  />
                </div>
              )}
            </div>

            <div style={{ marginBottom: '24px', animation: 'fadeIn 0.5s ease 0.6s' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#555',
              }}>
                Additional Images (Optional)
              </label>
              {formData.images.map((image, index) => (
                <div key={index} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="url"
                      name={`images-${index}`}
                      value={image}
                      onChange={onChange}
                      placeholder={`Image URL ${index + 1}`}
                      onFocus={() => setActiveField(`image-${index}`)}
                      onBlur={() => setActiveField(null)}
                      style={{
                        ...getInputStyle(`image-${index}`),
                        flex: 1,
                      }}
                    />
                  </div>
                  {image && (
                    <div style={{
                      marginTop: '8px',
                      padding: '8px',
                      background: '#f9fafc',
                      borderRadius: '6px',
                      border: '1px dashed #ddd',
                    }}>
                      <img 
                        src={image} 
                        alt={`Image ${index + 1} preview`}
                        style={{
                          height: '80px',
                          objectFit: 'contain',
                          borderRadius: '4px',
                        }} 
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '16px',
              marginTop: '32px',
              animation: 'fadeIn 0.5s ease 0.7s',
            }}>
              <button
                type="button"
                onClick={() => navigate('/products')}
                onMouseEnter={() => setActiveButton('cancel')}
                onMouseLeave={() => setActiveButton(null)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  background: 'white',
                  color: '#666',
                  fontSize: '15px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: activeButton === 'cancel' ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: activeButton === 'cancel' ? '0 4px 10px rgba(0,0,0,0.05)' : 'none',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                onMouseEnter={() => !isSubmitting && setActiveButton('submit')}
                onMouseLeave={() => setActiveButton(null)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isSubmitting ? '#a0b0ea' : '#4361ee',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '500',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  transform: activeButton === 'submit' && !isSubmitting ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: activeButton === 'submit' && !isSubmitting ? '0 4px 15px rgba(67, 97, 238, 0.3)' : '0 4px 10px rgba(67, 97, 238, 0.2)',
                }}
              >
                {isSubmitting ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Saving</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[0, 1, 2].map((i) => (
                        <span key={i} style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          background: 'white',
                          animation: 'bounce 1.4s infinite ease-in-out both',
                          animationDelay: `${i * 0.16}s`,
                        }}></span>
                      ))}
                    </div>
                  </div>
                ) : (
                  isEditing ? 'Update Product' : 'Add Product'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }
        
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ProductForm; 