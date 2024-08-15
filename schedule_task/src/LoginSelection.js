import React from 'react';
import { Button, Container, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LoginSelection = () => {
    const navigate = useNavigate();

    const handleStudentLogin = () => {
        navigate('/studentlogin');
    };

    const handleTeacherLogin = () => {
        navigate('/mentorlogin');
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    mt: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3
                }}
            >
                <Typography variant="h4" component="h1" gutterBottom>
                    Select Login
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleStudentLogin}
                    fullWidth
                >
                    Student Login
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleTeacherLogin}
                    fullWidth
                >
                    Mentor Login
                </Button>
            </Box>
        </Container>
    );
};

export default LoginSelection;
