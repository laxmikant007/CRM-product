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
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <h1>CRM Dashboard</h1>
        <div className="nav-links">
          <button onClick={() => navigate('/')}>Dashboard</button>
          <button onClick={() => navigate('/products')}>Products</button>
          <button onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <div className="welcome-header">
        <h2>Welcome, {user?.firstName || 'User'}</h2>
        <p>Here's what's happening with your products today</p>
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <h3>Total Products</h3>
          <p className="stat-value">{stats.totalProducts}</p>
        </div>
        <div className="stat-card">
          <h3>Categories</h3>
          <p className="stat-value">{stats.totalCategories}</p>
        </div>
        <div className="stat-card">
          <h3>Brands</h3>
          <p className="stat-value">{stats.totalBrands}</p>
        </div>
        <div className="stat-card">
          <h3>Total Value</h3>
          <p className="stat-value">${stats.totalValue}</p>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart chart-pie">
          <h3>Products by Category</h3>
          <Pie data={categoryData} />
        </div>
        <div className="chart chart-bar">
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
              }
            }} 
          />
        </div>
        <div className="chart chart-line">
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
              }
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 