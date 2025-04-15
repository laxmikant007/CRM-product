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
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalBrands: 0,
    totalValue: 0,
  });
  const [activeButton, setActiveButton] = useState(null);
  const [activeCard, setActiveCard] = useState(null);
  const [chartHover, setChartHover] = useState(null);

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

      setStats({
        totalProducts: products.length,
        totalCategories: categories.length,
        totalBrands: brands.length,
        totalValue: totalValue.toFixed(2),
      });
    }
  }, [products]);

  const onLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Category distribution chart data
  const categoryData = {
    labels: products 
      ? [...new Set(products.map((product) => product.category))]
      : [],
    datasets: [
      {
        label: 'Products by Category',
        data: products
          ? [...new Set(products.map((product) => product.category))].map(
              (category) => products.filter((product) => product.category === category).length
            )
          : [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Price distribution chart data
  const priceData = {
    labels: products
      ? products.slice(0, 10).map((product) => product.title.substring(0, 15))
      : [],
    datasets: [
      {
        label: 'Product Prices',
        data: products ? products.slice(0, 10).map((product) => product.price) : [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Stock distribution chart data
  const stockData = {
    labels: products
      ? products.slice(0, 10).map((product) => product.title.substring(0, 15))
      : [],
    datasets: [
      {
        label: 'Product Stock',
        data: products ? products.slice(0, 10).map((product) => product.stock) : [],
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div style={{ animation: 'pulse 1.5s infinite' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>Loading Dashboard</div>
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
    <div className="dashboard-container" style={{ animation: 'fadeIn 0.5s ease' }}>
      <nav className="dashboard-nav" style={{ animation: 'fadeSlideUp 0.5s ease' }}>
        <h1>CRM Dashboard</h1>
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

      <div className="welcome-header" style={{ animation: 'fadeSlideUp 0.6s ease' }}>
        <h2>Welcome, <span style={{ color: 'var(--primary-dark)' }}>{user?.firstName || 'User'}</span></h2>
        <p>Here's what's happening with your products today</p>
      </div>

      <div className="stat-cards" style={{ animation: 'fadeSlideUp 0.7s ease' }}>
        <div 
          className="stat-card"
          onMouseEnter={() => setActiveCard('products')}
          onMouseLeave={() => setActiveCard(null)}
          style={{
            transform: activeCard === 'products' ? 'translateY(-5px)' : 'translateY(0)',
            boxShadow: activeCard === 'products' ? '0 8px 15px rgba(0, 0, 0, 0.1)' : 'var(--shadow)',
            borderLeft: activeCard === 'products' ? '4px solid var(--primary)' : '4px solid transparent',
            transition: 'all 0.3s ease'
          }}
        >
          <h3>Total Products</h3>
          <p className="stat-value">
            {stats.totalProducts}
          </p>
        </div>
        <div 
          className="stat-card"
          onMouseEnter={() => setActiveCard('categories')}
          onMouseLeave={() => setActiveCard(null)}
          style={{
            transform: activeCard === 'categories' ? 'translateY(-5px)' : 'translateY(0)',
            boxShadow: activeCard === 'categories' ? '0 8px 15px rgba(0, 0, 0, 0.1)' : 'var(--shadow)',
            borderLeft: activeCard === 'categories' ? '4px solid var(--secondary)' : '4px solid transparent',
            transition: 'all 0.3s ease'
          }}
        >
          <h3>Categories</h3>
          <p className="stat-value">{stats.totalCategories}</p>
        </div>
        <div 
          className="stat-card"
          onMouseEnter={() => setActiveCard('brands')}
          onMouseLeave={() => setActiveCard(null)}
          style={{
            transform: activeCard === 'brands' ? 'translateY(-5px)' : 'translateY(0)',
            boxShadow: activeCard === 'brands' ? '0 8px 15px rgba(0, 0, 0, 0.1)' : 'var(--shadow)',
            borderLeft: activeCard === 'brands' ? '4px solid var(--success)' : '4px solid transparent',
            transition: 'all 0.3s ease'
          }}
        >
          <h3>Brands</h3>
          <p className="stat-value">{stats.totalBrands}</p>
        </div>
        <div 
          className="stat-card"
          onMouseEnter={() => setActiveCard('value')}
          onMouseLeave={() => setActiveCard(null)}
          style={{
            transform: activeCard === 'value' ? 'translateY(-5px)' : 'translateY(0)',
            boxShadow: activeCard === 'value' ? '0 8px 15px rgba(0, 0, 0, 0.1)' : 'var(--shadow)',
            borderLeft: activeCard === 'value' ? '4px solid var(--warning)' : '4px solid transparent',
            transition: 'all 0.3s ease'
          }}
        >
          <h3>Total Value</h3>
          <p className="stat-value">${stats.totalValue}</p>
        </div>
      </div>

      <div className="charts-container">
        <div 
          className="chart chart-pie"
          onMouseEnter={() => setChartHover('pie')}
          onMouseLeave={() => setChartHover(null)}
          style={{
            animation: 'fadeSlideUp 0.8s ease',
            transform: chartHover === 'pie' ? 'translateY(-5px)' : 'translateY(0)',
            boxShadow: chartHover === 'pie' ? '0 8px 15px rgba(0, 0, 0, 0.1)' : 'var(--shadow)',
            transition: 'all 0.3s ease'
          }}
        >
          <h3>Products by Category</h3>
          <div style={{ animation: chartHover === 'pie' ? 'pulse 2s infinite' : 'none' }}>
            <Pie data={categoryData} />
          </div>
        </div>
        <div 
          className="chart chart-bar"
          onMouseEnter={() => setChartHover('bar')}
          onMouseLeave={() => setChartHover(null)}
          style={{
            animation: 'fadeSlideUp 0.9s ease',
            transform: chartHover === 'bar' ? 'translateY(-5px)' : 'translateY(0)',
            boxShadow: chartHover === 'bar' ? '0 8px 15px rgba(0, 0, 0, 0.1)' : 'var(--shadow)',
            transition: 'all 0.3s ease'
          }}
        >
          <h3>Top 10 Product Prices</h3>
          <Bar 
            data={priceData} 
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Price ($)'
                  }
                }
              },
              animation: {
                duration: chartHover === 'bar' ? 1000 : 500
              }
            }} 
          />
        </div>
        <div 
          className="chart chart-line"
          onMouseEnter={() => setChartHover('line')}
          onMouseLeave={() => setChartHover(null)}
          style={{
            animation: 'fadeSlideUp 1s ease',
            transform: chartHover === 'line' ? 'translateY(-5px)' : 'translateY(0)',
            boxShadow: chartHover === 'line' ? '0 8px 15px rgba(0, 0, 0, 0.1)' : 'var(--shadow)',
            transition: 'all 0.3s ease'
          }}
        >
          <h3>Top 10 Product Stock Levels</h3>
          <Line 
            data={stockData} 
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Stock Quantity'
                  }
                }
              },
              animation: {
                duration: chartHover === 'line' ? 1000 : 500
              }
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 