import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  MenuItem,
  Avatar,
  Grid,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'company', label: 'Company/Recruiter' },
  { value: 'placement_coordinator', label: 'Placement Coordinator' },
  { value: 'college_management', label: 'College Management' },
];

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    role: 'student',
    first_name: '',
    last_name: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password2) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register(formData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        Object.values(err.response?.data || {}).flat().join(', ') ||
        'Registration failed. Please try again.'
      );
    }
  };

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={24}
            sx={{
              p: 5,
              borderRadius: 4,
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.98)',
            }}
          >
            <Avatar
              sx={{
                m: 'auto',
                mb: 2,
                bgcolor: 'success.main',
                width: 64,
                height: 64,
              }}
            >
              <SchoolIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Registration Successful!
              </Typography>
              <Typography>Redirecting to login...</Typography>
            </Alert>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={24}
          sx={{
            p: 5,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Avatar
              sx={{
                m: 1,
                bgcolor: 'primary.main',
                width: 64,
                height: 64,
                mb: 2,
              }}
            >
              <PersonAddIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Join PlaceMate - College Placement Management System
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                >
                  {ROLES.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="password2"
                  type="password"
                  value={formData.password2}
                  onChange={handleChange}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                mt: 4,
                mb: 3,
                py: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #653a8f 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
                },
              }}
            >
              Create Account
            </Button>
            <Typography align="center" color="text.secondary">
              Already have an account?{' '}
              <Link
                to="/login"
                style={{
                  color: '#667eea',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Login here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Register;


