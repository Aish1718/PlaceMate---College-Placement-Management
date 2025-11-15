import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import heroVideo from '../../src/images/UpdatedVideo.mp4';
import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Grid,
  Card,
  CardContent,
  TextField,
  Paper,
  Fade,
  Slide,
  Zoom,
  useScrollTrigger,
} from '@mui/material';
import {
  School as SchoolIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  ArrowDownward as ArrowDownwardIcon,
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Support as SupportIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send an email or save to database
    alert('Thank you for your message! We will get back to you soon.');
    setContactForm({ name: '', email: '', message: '' });
  };

  if (user) {
    navigate('/dashboard');
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Navigation Bar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: '#E7E6E1',
          color: 'text.primary',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          borderRadius: '0px',
        }}
      >
        <Toolbar>
          <SchoolIcon sx={{ mr: 2, color: '#192655', fontSize: 32 }} />
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              color: '#192655',
              cursor: 'pointer',
            }}
            onClick={() => scrollToSection('home')}
          >
            PlaceMate
          </Typography>
          <Button color="inherit" onClick={() => scrollToSection('features')} sx={{ mr: 2 }}>
            Features
          </Button>
          <Button color="inherit" onClick={() => scrollToSection('about')} sx={{ mr: 2 }}>
            About
          </Button>
          <Button color="inherit" onClick={() => scrollToSection('contact')} sx={{ mr: 2 }}>
            Contact
          </Button>
          <Button color="inherit" onClick={() => navigate('/login')} sx={{ mr: 2 }}>
            Login
          </Button>
          <Button variant="contained" onClick={() => navigate('/register')}>
            Get Started
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        id="home"
        sx={{
          // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          // backgroundImage: 'url("https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80")',
          color: 'white',
          py: 12,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
    background: 'rgba(223,83,51,0.2)', // dark
    content: '""',
    position: 'absolute',
    inset: 0,
  },
        }}
      >
        {/* Background Video */}
  <video
  autoPlay
  loop
  muted
  playsInline
  style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 1,   // ok
  }}
>
    <source src={heroVideo} type="video/mp4" />
  </video>

  {/* Overlay */}
  <Box
    sx={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(25, 38, 85, 0.45)',
      zIndex: 1,
    }}
  />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
          <Fade in timeout={1000}>
            <Box>
              <Typography variant="h2" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                Welcome to PlaceMate
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                Connect. Apply. Get hired.
                A modern, all-in-one platform for every placement need.
              </Typography>
              <Typography variant="body1" sx={{ mb: 6, fontSize: '1.1rem', opacity: 0.8, maxWidth: '600px', mx: 'auto' }}>
                Connect students, coordinators, and companies in one efficient platform.
                Manage placements, track applications, and make data-driven decisions.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': { bgcolor: '#f0f0f0', transform: 'translateY(-2px)' },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)', transform: 'translateY(-2px)' },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Login
                </Button>
              </Box>
              <Button
                onClick={() => scrollToSection('features')}
                sx={{ color: 'white', mt: 4 }}
                endIcon={<ArrowDownwardIcon
                sx={{
        animation: 'bounce 1.5s infinite',
        '@keyframes bounce': {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(4px)' },
          '100%': { transform: 'translateY(0)' },
        },
      }}
                />}
              >
                Learn More
              </Button>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Features Section */}
      <Container id="features" maxWidth="lg" sx={{ py: 10 }}>
        <Fade in timeout={1200}>
          <Box>
            <Typography variant="h3" textAlign="center" fontWeight="bold" gutterBottom>
              Features
            </Typography>
            <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 8, fontSize: '1.1rem' }}>
              Everything you need for efficient placement management
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Zoom in timeout={800}>
                  <Card sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 4,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                    }
                  }}>
                    <WorkIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      Job Management
                    </Typography>
                    <Typography color="text.secondary">
                      Browse and apply to job postings. Track your applications and get personalized recommendations.
                    </Typography>
                  </Card>
                </Zoom>
              </Grid>
              <Grid item xs={12} md={4}>
                <Zoom in timeout={1000}>
                  <Card sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 4,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                    }
                  }}>
                    <PeopleIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      Resume Analyzer
                    </Typography>
                    <Typography color="text.secondary">
                      Get instant feedback on your resume with ATS compatibility scores and improvement suggestions.
                    </Typography>
                  </Card>
                </Zoom>
              </Grid>
              <Grid item xs={12} md={4}>
                <Zoom in timeout={1200}>
                  <Card sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 4,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                    }
                  }}>
                    <TrendingUpIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      Analytics Dashboard
                    </Typography>
                    <Typography color="text.secondary">
                      Comprehensive analytics and reports for coordinators and management to track placement metrics.
                    </Typography>
                  </Card>
                </Zoom>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      </Container>

      {/* About Us Section */}
      <Box id="about" sx={{ bgcolor: 'grey.50', py: 10 }}>
        <Container maxWidth="lg">
          <Fade in timeout={1200}>
            <Typography variant="h3" textAlign="center" fontWeight="bold" gutterBottom>
              About Us
            </Typography>
          </Fade>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Our Mission
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                placeMate is designed to revolutionize the college placement process by providing a transparent,
                efficient, and data-driven platform that connects all stakeholders in the placement ecosystem.
              </Typography>
              <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mt: 4 }}>
                What We Offer
              </Typography>
              <Typography variant="body1" color="text.secondary">
                • Streamlined job application process for students<br />
                • Efficient recruitment management for companies<br />
                • Comprehensive oversight tools for coordinators<br />
                • Data-driven insights for college management
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 4, height: '100%' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Why Choose placeMate?
                </Typography>
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    ✓ <strong>User-Friendly Interface</strong> - Intuitive design for all user types
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    ✓ <strong>Real-Time Updates</strong> - Stay informed with instant notifications
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    ✓ <strong>Secure Platform</strong> - Your data is protected with industry-standard security
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    ✓ <strong>Comprehensive Analytics</strong> - Make data-driven decisions
                  </Typography>
                  <Typography variant="body1">
                    ✓ <strong>24/7 Access</strong> - Available whenever you need it
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Contact Us Section */}
      <Container id="contact" maxWidth="lg" sx={{ py: 10 }}>
        <Fade in timeout={1200}>
          <Typography variant="h3" textAlign="center" fontWeight="bold" gutterBottom>
            Contact Us
          </Typography>
        </Fade>
        <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          Have questions? We'd love to hear from you
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 4, height: '100%' }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Get in Touch
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography>rnsit@placemate.com</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <PhoneIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography>+1 (555) 123-4567</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography>RNS Institute of Technology, Dr. Vishnuvardhana Road, R R Nagar Post, Channasandra, Bengaluru - 560 098.</Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 4 }}>
              <form onSubmit={handleContactSubmit}>
                <TextField
                  fullWidth
                  label="Your Name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Your Email"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Message"
                  multiline
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  margin="normal"
                  required
                />
                <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
                  Send Message
                </Button>
              </form>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: '#CA7842', color: 'white', py: 4, mt: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <SchoolIcon sx={{ mr: 2, color: '#192655', fontSize: 32 }} />
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              color: '#192655',
              cursor: 'pointer',
            }}
            onClick={() => scrollToSection('home')}
          >
            PlaceMate
          </Typography>
              </div>
              {/* <Typography variant="h6" fontWeight="bold" color="primary.main" gutterBottom>
                PlaceMate
              </Typography> */}
              <Typography variant="body2" color="background.default">
                Streamlining college placement processes for better outcomes.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight="bold" color="primary.main" gutterBottom>
                Quick Links
              </Typography>
              <Box sx={{display: "flex", flexDirection: "row", gap: "24px", alignItems: "center"}}>
                <Button color="inherit" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} sx={{
    background: "transparent",
    padding: "0px",
    fontWeight: 400,
    boxShadow: "none",
    minWidth: "auto",
    "&:hover": {
      background: "transparent",
      textDecoration: "underline",
      boxShadow: "none",
    }
  }}>
                  Home
                </Button>
                <Button color="inherit" onClick={() => navigate('/login')} sx={{
    padding: "0px",
    fontWeight: 400,
    boxShadow: "none",
    minWidth: "auto",
    "&:hover": {
      background: "transparent",
      textDecoration: "underline",
      boxShadow: "none",
    }
  }}>
                  Login
                </Button>
                <Button color="inherit" onClick={() => navigate('/register')} sx={{
    background: "transparent",
    padding: "0px",
    fontWeight: 400,
    boxShadow: "none",
    minWidth: "auto",
    "&:hover": {
      background: "transparent",
      textDecoration: "underline",
      boxShadow: "none",
    }
  }}>
                  Register
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight="bold" color="primary.main" gutterBottom>
                Contact
              </Typography>
              <Typography variant="body2" color="background.default">
                Email: rnsit@placemate.com<br />
                Phone: +1 (555) 123-4567
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{ mt: 4, pt: 4, borderTop: 1, borderColor: 'grey.800', textAlign: 'center' }}>
            <Typography variant="body2" color="background.default">
              © {new Date().getFullYear()} placeMate. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 1000,
          }}
        >
          <Button
            variant="contained"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            sx={{
              minWidth: 48,
              width: 48,
              height: 48,
              borderRadius: '50%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            ↑
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default LandingPage;
