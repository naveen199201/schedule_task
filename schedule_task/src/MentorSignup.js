import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Typography, Container, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const MentorSignupForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        area_of_interest: ''
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

        if (!formData.name || !formData.email || !formData.password || !formData.area_of_interest) {
            setError('All fields are required');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3000/mentor/signup', formData);
            console.log('Signup successful:', response.data);
            navigate('/mentoravailability'); // Navigate to the mentor page
        } catch (err) {
            console.error('Signup failed:', err);
            setError('Signup failed. Please try again.');
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
                    Mentor Signup
                </Typography>
                <TextField
                    label="Name"
                    variant="outlined"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    fullWidth
                />
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
                <TextField
                    label="Area of Interest"
                    variant="outlined"
                    name="area_of_interest"
                    value={formData.area_of_interest}
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
                    Signup
                </Button>
            </Box>
        </Container>
    );
};

export default MentorSignupForm;
