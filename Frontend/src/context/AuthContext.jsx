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

    const register = async (name, email, password, role, country) => {
        const res = await axios.post('/api/auth/register', { name, email, password, role, country });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data));
        setToken(res.data.token);
        setUser(res.data);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
