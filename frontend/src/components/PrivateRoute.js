import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';

function PrivateRoute({ children }) {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Allow superusers (admins) to bypass approval check
  if (!user.is_superuser && !user.is_approved) {
    const handleLogout = () => {
      logout();
      navigate('/login');
    };

    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
        }}
      >
        <Container maxWidth="sm">
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
              Account Pending Approval
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, mt: 2 }}>
              Your account is pending approval from the administrator.
              <br />
              You will be notified once your account has been reviewed.
            </Typography>
            <Button
              variant="contained"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                mt: 2,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #653a8f 100%)',
                },
              }}
            >
              Logout
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return <>{children}</>;
}

export default PrivateRoute;