import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (user && token) {
            // Establish socket connection
            const newSocket = io('http://localhost:5000', {
                transports: ['websocket', 'polling']
            });
            
            setSocket(newSocket);

            newSocket.on('connect', () => {
                const userId = user._id || user.id;
                newSocket.emit('registerUser', userId);
            });

            return () => newSocket.close();
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [user, token]);

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

    const reactivate = async (email, password) => {
        const res = await axios.post('/api/auth/reactivate', { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data));
        setToken(res.data.token);
        setUser(res.data);
        return res.data;
    };

    const login = async (email, password) => {
        const res = await axios.post('/api/auth/login', { email, password });
        if (res.data.requires2FA || res.data.requiresReactivation) {
            return res.data;
        }
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data));
        setToken(res.data.token);
        setUser(res.data);
        return res.data;
    };

    const verify2FALogin = async (userId, code) => {
        const res = await axios.post('/api/auth/login/verify-2fa', { userId, code });
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
        <AuthContext.Provider value={{ user, token, login, reactivate, verify2FALogin, register, logout, updateProfile, loading, oauthLogin, socket }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
