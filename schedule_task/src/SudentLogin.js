import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Typography, Container, Box, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const StudentLoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.email || !formData.password) {
            setError('Both fields are required');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3000/student/login', formData);
            
            console.log('Login successful:', response.data);
            navigate('/schedulemeeting'); 
        } catch (err) {
            console.error('Login failed:', err);
            setError('Login failed. Please check your credentials and try again.');
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    mt: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                }}
            >
                <Typography variant="h4" component="h1" gutterBottom>
                    Student Login
                </Typography>
                <TextField
                    label="Email"
                    variant="outlined"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    fullWidth
                />
                <TextField
                    label="Password"
                    variant="outlined"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    fullWidth
                />
                {error && (
                    <Typography color="error" variant="body2">
                        {error}
                    </Typography>
                )}
                <Button type="submit" variant="contained" color="primary" fullWidth>
                    Login
                </Button>
                <Box mt={2} textAlign="center">
                    <Typography variant="body2">
                        Don’t have an account?{' '}
                        <Link
                            href="/studentsignup"
                            color="primary"
                        >
                            Sign up
                        </Link>
                    </Typography>
                </Box>
            </Box>
        </Container>
    );
};

export default StudentLoginPage;
