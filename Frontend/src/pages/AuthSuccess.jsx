import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Fetch user info
      axios.get('/api/auth/profile')
        .then(res => {
          const user = res.data;
          localStorage.setItem('user', JSON.stringify(user));
          // Navigate based on role
          if (user.role === 'employer') {
            navigate('/pro/dashboard');
          } else if (user.role === 'job_seeker') {
            navigate('/tasker/dashboard');
          } else {
            navigate('/');
          }
        })
        .catch(error => {
          console.error('Failed to fetch user:', error);
          navigate('/signup');
        });
    } else {
      navigate('/signup');
    }
  }, [navigate]);

  return <div>Logging you in...</div>;
};

export default AuthSuccess;
