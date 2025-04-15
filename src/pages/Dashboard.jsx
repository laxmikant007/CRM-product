import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { getProducts } from '../features/product/productSlice';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { products, isLoading } = useSelector((state) => state.products);
  
  // State for stats and UI interactions
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalBrands: 0,
    totalValue: 0,
    lowStockProducts: 0,
  });
  const [activeButton, setActiveButton] = useState(null);
  const [activeCard, setActiveCard] = useState(null);
  const [activeChart, setActiveChart] = useState(null);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [chartData, setChartData] = useState({
    categories: { labels: [], data: [] },
    prices: { labels: [], data: [] },
    stock: { labels: [], data: [] }
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      dispatch(getProducts());
    }
  }, [user, navigate, dispatch]);

  useEffect(() => {
    if (products && products.length > 0) {
      // Calculate statistics
      const categories = [...new Set(products.map((product) => product.category))];
      const brands = [...new Set(products.map((product) => product.brand))];
      const totalValue = products.reduce((acc, product) => acc + product.price, 0);
      const lowStockProducts = products.filter(product => product.stock < 10).length;

      setStats({
        totalProducts: products.length,
        totalCategories: categories.length,
        totalBrands: brands.length,
        totalValue: totalValue.toFixed(2),
        lowStockProducts,
      });

      // Prepare chart data
      const categoryLabels = [...new Set(products.map(product => product.category))];
      const categoryData = categoryLabels.map(category => 
        products.filter(product => product.category === category).length
      );
      
      // Sort products by price for price chart (top 8)
      const topPriceProducts = [...products]
        .sort((a, b) => b.price - a.price)
        .slice(0, 8);
      
      // Sort products by low stock for stock chart (top 8)
      const lowStockProductsData = [...products]
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 8);

      setChartData({
        categories: {
          labels: categoryLabels,
          data: categoryData,
        },
        prices: {
          labels: topPriceProducts.map(p => p.title.substring(0, 12) + (p.title.length > 12 ? '...' : '')),
          data: topPriceProducts.map(p => p.price),
        },
        stock: {
          labels: lowStockProductsData.map(p => p.title.substring(0, 12) + (p.title.length > 12 ? '...' : '')),
          data: lowStockProductsData.map(p => p.stock),
        }
      });
      
      // Set page as loaded for animations
      setTimeout(() => setPageLoaded(true), 300);
    }
  }, [products]);

  const onLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Category distribution chart data
  const categoryChartData = {
    labels: chartData.categories.labels,
    datasets: [
      {
        label: 'Products by Category',
        data: chartData.categories.data,
        backgroundColor: [
          'rgba(67, 97, 238, 0.7)',
          'rgba(76, 175, 80, 0.7)',
          'rgba(255, 152, 0, 0.7)',
          'rgba(249, 65, 68, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(0, 188, 212, 0.7)',
          'rgba(121, 85, 72, 0.7)',
          'rgba(158, 158, 158, 0.7)',
        ],
        borderWidth: 1,
        borderColor: '#fff',
      },
    ],
  };

  // Price chart data
  const priceChartData = {
    labels: chartData.prices.labels,
    datasets: [
      {
        label: 'Product Prices',
        data: chartData.prices.data,
        backgroundColor: 'rgba(67, 97, 238, 0.7)',
        borderColor: 'rgba(67, 97, 238, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Stock chart data
  const stockChartData = {
    labels: chartData.stock.labels,
    datasets: [
      {
        label: 'Product Stock',
        data: chartData.stock.data,
        fill: false,
        backgroundColor: 'rgba(249, 65, 68, 0.7)',
        borderColor: 'rgba(249, 65, 68, 1)',
        tension: 0.3,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          boxWidth: 15,
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
      },
    },
    animation: {
      duration: 1500,
    },
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
          }}>Loading Dashboard</div>
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
    <div style={{
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
        }}>CRM Dashboard</h1>
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
        <header style={{
          marginBottom: '30px',
          animation: 'slideUp 0.6s ease',
        }}>
          <h2 style={{
            margin: '0 0 10px 0',
            color: '#333',
            fontSize: '28px',
            fontWeight: '600',
          }}>
            Welcome, <span style={{ color: '#4361ee' }}>{user?.firstName || 'User'}</span>
          </h2>
          <p style={{
            margin: 0,
            color: '#666',
            fontSize: '16px',
          }}>
            Here's what's happening with your products today
          </p>
        </header>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '20px',
          marginBottom: '30px',
        }}>
          {[
            { 
              title: 'Total Products', 
              value: stats.totalProducts, 
              icon: '📦', 
              color: '#4361ee',
              light: '#f1f3ff' 
            },
            { 
              title: 'Categories', 
              value: stats.totalCategories, 
              icon: '🏷️', 
              color: '#4caf50',
              light: '#f1f8e9' 
            },
            { 
              title: 'Brands', 
              value: stats.totalBrands, 
              icon: '🏢', 
              color: '#ff9800',
              light: '#fff8e1' 
            },
            { 
              title: 'Inventory Value', 
              value: `$${stats.totalValue}`, 
              icon: '💰', 
              color: '#9c27b0',
              light: '#f3e5f5' 
            },
            { 
              title: 'Low Stock Items', 
              value: stats.lowStockProducts, 
              icon: '⚠️', 
              color: '#f94144',
              light: '#ffebee' 
            },
          ].map((card, index) => (
            <div 
              key={card.title}
              onMouseEnter={() => setActiveCard(card.title)}
              onMouseLeave={() => setActiveCard(null)}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '25px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease',
                transform: activeCard === card.title ? 'translateY(-5px)' : 'translateY(0)',
                borderLeft: `4px solid ${card.color}`,
                animation: `slideUp ${0.3 + index * 0.1}s ease`,
                opacity: pageLoaded ? 1 : 0,
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <h3 style={{
                    margin: '0 0 10px 0',
                    color: '#555',
                    fontSize: '15px',
                    fontWeight: '500',
                  }}>{card.title}</h3>
                  <p style={{
                    margin: 0,
                    fontSize: '28px',
                    fontWeight: '600',
                    color: card.color,
                  }}>{card.value}</p>
                </div>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '10px',
                  background: card.light,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  transition: 'all 0.3s ease',
                  transform: activeCard === card.title ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0)',
                }}>
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px',
          marginBottom: '30px',
        }}>
          <div 
            onMouseEnter={() => setActiveChart('pie')}
            onMouseLeave={() => setActiveChart(null)}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '25px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease',
              transform: activeChart === 'pie' ? 'translateY(-5px)' : 'translateY(0)',
              animation: 'slideUp 0.7s ease',
              opacity: pageLoaded ? 1 : 0,
            }}
          >
            <h3 style={{
              margin: '0 0 20px 0',
              color: '#333',
              fontSize: '18px',
              fontWeight: '600',
            }}>Products by Category</h3>
            <div style={{
              height: '300px',
              position: 'relative',
            }}>
              <Pie 
                data={categoryChartData} 
                options={{
                  ...chartOptions,
                  animation: {
                    ...chartOptions.animation,
                    duration: activeChart === 'pie' ? 800 : 1500,
                  },
                }} 
              />
            </div>
          </div>
          
          <div 
            onMouseEnter={() => setActiveChart('bar')}
            onMouseLeave={() => setActiveChart(null)}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '25px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease',
              transform: activeChart === 'bar' ? 'translateY(-5px)' : 'translateY(0)',
              animation: 'slideUp 0.8s ease',
              opacity: pageLoaded ? 1 : 0,
            }}
          >
            <h3 style={{
              margin: '0 0 20px 0',
              color: '#333',
              fontSize: '18px',
              fontWeight: '600',
            }}>Top Product Prices</h3>
            <div style={{
              height: '300px',
              position: 'relative',
            }}>
              <Bar 
                data={priceChartData} 
                options={{
                  ...chartOptions,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)',
                      },
                      ticks: {
                        callback: function(value) {
                          return '$' + value;
                        }
                      }
                    },
                    x: {
                      grid: {
                        display: false,
                      }
                    }
                  },
                  animation: {
                    ...chartOptions.animation,
                    duration: activeChart === 'bar' ? 800 : 1500,
                  },
                }} 
              />
            </div>
          </div>
          
          <div 
            onMouseEnter={() => setActiveChart('line')}
            onMouseLeave={() => setActiveChart(null)}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '25px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease',
              transform: activeChart === 'line' ? 'translateY(-5px)' : 'translateY(0)',
              animation: 'slideUp 0.9s ease',
              opacity: pageLoaded ? 1 : 0,
              gridColumn: '1 / -1',
            }}
          >
            <h3 style={{
              margin: '0 0 20px 0',
              color: '#333',
              fontSize: '18px',
              fontWeight: '600',
            }}>Low Stock Products</h3>
            <div style={{
              height: '300px',
              position: 'relative',
            }}>
              <Line 
                data={stockChartData} 
                options={{
                  ...chartOptions,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)',
                      }
                    },
                    x: {
                      grid: {
                        display: false,
                      }
                    }
                  },
                  elements: {
                    point: {
                      radius: 5,
                      hoverRadius: 7,
                      backgroundColor: 'rgba(249, 65, 68, 0.8)',
                      borderWidth: 2,
                      borderColor: 'white',
                    },
                    line: {
                      tension: 0.3,
                    }
                  },
                  animation: {
                    ...chartOptions.animation,
                    duration: activeChart === 'line' ? 800 : 1500,
                  },
                }} 
              />
            </div>
          </div>
        </div>
        
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '25px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
          marginBottom: '30px',
          animation: 'slideUp 1s ease',
          opacity: pageLoaded ? 1 : 0,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}>
            <h3 style={{
              margin: 0,
              color: '#333',
              fontSize: '18px',
              fontWeight: '600',
            }}>
              Recently Added Products
            </h3>
            <button 
              onClick={() => navigate('/products')}
              onMouseEnter={() => setActiveButton('viewAll')}
              onMouseLeave={() => setActiveButton(null)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: activeButton === 'viewAll' ? '#4361ee' : '#f1f3ff',
                color: activeButton === 'viewAll' ? 'white' : '#4361ee',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              View All
            </button>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '20px',
          }}>
            {products && products.slice(0, 4).map((product, index) => (
              <div 
                key={product.id}
                onClick={() => navigate(`/products/${product.id}`)}
                onMouseEnter={() => setActiveCard(`recent-${product.id}`)}
                onMouseLeave={() => setActiveCard(null)}
                style={{
                  background: activeCard === `recent-${product.id}` ? '#f9fafc' : 'white',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: activeCard === `recent-${product.id}` 
                    ? '0 8px 20px rgba(0,0,0,0.1)' 
                    : '0 3px 10px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  transform: activeCard === `recent-${product.id}` ? 'translateY(-5px)' : 'translateY(0)',
                  animation: `fadeIn ${0.5 + index * 0.1}s ease`,
                  border: '1px solid #eee',
                }}
              >
                <div style={{
                  height: '120px',
                  overflow: 'hidden',
                }}>
                  <img 
                    src={product.thumbnail}
                    alt={product.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease',
                      transform: activeCard === `recent-${product.id}` ? 'scale(1.1)' : 'scale(1)',
                    }}
                  />
                </div>
                <div style={{
                  padding: '15px',
                }}>
                  <h4 style={{
                    margin: '0 0 8px 0',
                    fontSize: '15px',
                    fontWeight: '500',
                    color: '#333',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {product.title}
                  </h4>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#4361ee',
                    }}>
                      ${product.price}
                    </span>
                    <span style={{
                      fontSize: '13px',
                      color: product.stock < 10 ? '#f94144' : '#4caf50',
                      background: product.stock < 10 ? 'rgba(249, 65, 68, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                      padding: '3px 8px',
                      borderRadius: '4px',
                    }}>
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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
        
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard; 