import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (storedUser) setUser(storedUser);
            setLoading(false);
        } else {
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
            setLoading(false);
        }
    }, [token]);

    const login = async (email, password) => {
        const res = await axios.post('/api/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data));
        setToken(res.data.token);
        setUser(res.data);
        return res.data;
    };

    const register = async (name, email, password, role, country = '') => {
        const payload = { name, email, password, role };
        if (country) payload.country = country;
        const res = await axios.post('/api/auth/register', payload);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data));
        setToken(res.data.token);
        setUser(res.data);
        return res.data;
    };

    const oauthLogin = (tokenData, userData) => {
        localStorage.setItem('token', tokenData);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(tokenData);
        setUser(userData);
    };

    const updateProfile = async (userData) => {
        const res = await axios.put('/api/auth/profile', userData);
        const updatedUser = { ...res.data, token: token }; // Ensure token persists if not returned
        localStorage.setItem('user', JSON.stringify(updatedUser)); // Update local storage
        setUser(updatedUser);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, updateProfile, loading, oauthLogin }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
