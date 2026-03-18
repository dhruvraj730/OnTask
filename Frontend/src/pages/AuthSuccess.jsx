import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const { oauthLogin } = useContext(AuthContext);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Fetch user info
      axios.get('/api/auth/profile')
        .then(res => {
          const user = res.data;
          oauthLogin(token, user);
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
