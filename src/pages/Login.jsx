import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, reset } from '../features/auth/authSlice';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [inputFocus, setInputFocus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { username, password } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    // Redirect when logged in
    if (isSuccess || user) {
      navigate('/');
    }

    // Display error
    if (isError) {
      setError(message);
      setIsSubmitting(false);
    }

    // Reset state
    return () => {
      dispatch(reset());
    };
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const userData = {
      username,
      password,
    };

    dispatch(login(userData));
  };

  return (
    <div className="login-page" style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn 0.6s ease-out'
    }}>
      <div className="login-card" style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 15px 25px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        transform: 'translateY(0)',
        animation: 'slideUp 0.5s ease-out',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}>
        <div className="login-header" style={{
          textAlign: 'center',
          marginBottom: '30px',
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#333',
            marginBottom: '10px',
            animation: 'fadeIn 0.8s ease-out'
          }}>CRM Product Management</h1>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '500',
            color: '#666',
            animation: 'fadeIn 1s ease-out'
          }}>Welcome Back</h2>
        </div>
        
        {error && (
          <div className="error-message" style={{
            background: 'rgba(255, 82, 82, 0.1)',
            border: '1px solid rgba(255, 82, 82, 0.3)',
            borderRadius: '6px',
            color: '#ff5252',
            padding: '12px 16px',
            marginBottom: '20px',
            fontSize: '14px',
            animation: 'shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={onSubmit}>
          <div className="form-group" style={{
            marginBottom: '24px',
            position: 'relative',
          }}>
            <label 
              htmlFor="username" 
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '15px',
                fontWeight: '500',
                color: inputFocus === 'username' ? '#4361ee' : '#555',
                transition: 'color 0.2s ease',
                animation: 'fadeIn 1.1s ease-out'
              }}
            >
              Username
            </label>
            <div style={{
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: inputFocus === 'username' ? '0 0 0 2px rgba(67, 97, 238, 0.3)' : 'none',
              transition: 'box-shadow 0.3s ease',
            }}>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={onChange}
                onFocus={() => setInputFocus('username')}
                onBlur={() => setInputFocus(null)}
                placeholder="Enter your username"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  border: `1px solid ${inputFocus === 'username' ? '#4361ee' : '#ddd'}`,
                  borderRadius: '8px',
                  transition: 'border 0.3s ease, transform 0.3s ease',
                  outline: 'none',
                  backgroundColor: '#f9fafc'
                }}
              />
            </div>
          </div>
          
          <div className="form-group" style={{
            marginBottom: '24px',
            position: 'relative',
          }}>
            <label 
              htmlFor="password" 
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '15px',
                fontWeight: '500',
                color: inputFocus === 'password' ? '#4361ee' : '#555',
                transition: 'color 0.2s ease',
                animation: 'fadeIn 1.2s ease-out'
              }}
            >
              Password
            </label>
            <div style={{
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: inputFocus === 'password' ? '0 0 0 2px rgba(67, 97, 238, 0.3)' : 'none',
              transition: 'box-shadow 0.3s ease',
            }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={password}
                onChange={onChange}
                onFocus={() => setInputFocus('password')}
                onBlur={() => setInputFocus(null)}
                placeholder="Enter your password"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  border: `1px solid ${inputFocus === 'password' ? '#4361ee' : '#ddd'}`,
                  borderRadius: '8px',
                  transition: 'border 0.3s ease, transform 0.3s ease',
                  outline: 'none',
                  backgroundColor: '#f9fafc',
                  paddingRight: '48px'
                }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: '5px',
                  color: '#888',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s ease',
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isLoading || isSubmitting}
            style={{
              width: '100%',
              padding: '14px',
              background: isLoading || isSubmitting ? '#a0b0ea' : '#4361ee',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading || isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 10px rgba(67, 97, 238, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              animation: 'fadeIn 1.3s ease-out'
            }}
            onMouseOver={(e) => {
              if (!isLoading && !isSubmitting) {
                e.currentTarget.style.background = '#3a53cc';
                e.currentTarget.style.boxShadow = '0 6px 15px rgba(67, 97, 238, 0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading && !isSubmitting) {
                e.currentTarget.style.background = '#4361ee';
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(67, 97, 238, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {isLoading || isSubmitting ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}>
                <span>Logging in</span>
                <div style={{
                  display: 'flex',
                  gap: '6px'
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'white',
                    display: 'inline-block',
                    animation: 'bounce 1.4s infinite ease-in-out both'
                  }}></span>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'white',
                    display: 'inline-block',
                    animation: 'bounce 1.4s infinite ease-in-out both',
                    animationDelay: '0.16s'
                  }}></span>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'white',
                    display: 'inline-block',
                    animation: 'bounce 1.4s infinite ease-in-out both',
                    animationDelay: '0.32s'
                  }}></span>
                </div>
              </div>
            ) : 'Login'}
          </button>
        </form>
        
        <div className="login-helper" style={{
          marginTop: '24px',
          padding: '16px',
          background: 'rgba(67, 97, 238, 0.05)',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#666',
          textAlign: 'center',
          animation: 'fadeIn 1.4s ease-out'
        }}>
          <p>
            <strong>Demo Account:</strong> Username: 'emilys' Password: 'emilyspass'
          </p>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
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

export default Login; 