import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  Upload as UploadIcon,
  Description as DescriptionIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  School as SchoolIcon,
  Event as EventIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openJobDialog, setOpenJobDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [resumeFile, setResumeFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [openResumeDialog, setOpenResumeDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterJobType, setFilterJobType] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [campusEvents, setCampusEvents] = useState([]);
  const [eventRegistrations, setEventRegistrations] = useState([]);
  const [recruitmentDrives, setRecruitmentDrives] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, jobsRes, applicationsRes, notificationsRes, recommendationsRes, eventsRes, registrationsRes, drivesRes] = await Promise.all([
        api.get('/students/profiles/me/').catch(() => ({ data: null })),
        api.get('/jobs/'),
        api.get('/applications/'),
        api.get('/notifications/'),
        api.get('/students/profiles/recommendations/'),
        api.get('/events/events/').catch(() => ({ data: { results: [], data: [] } })),
        api.get('/events/registrations/').catch(() => ({ data: { results: [], data: [] } })),
        api.get('/recruitment-drives/drives/').catch(() => ({ data: { results: [], data: [] } })),
      ]);
      setProfile(profileRes.data);
      if (profileRes.data) {
        setProfileForm({
          enrollment_number: profileRes.data.enrollment_number || '',
          department: profileRes.data.department || '',
          course: profileRes.data.course || '',
          year: profileRes.data.year || '',
          cgpa: profileRes.data.cgpa || '',
          phone: profileRes.data.phone || '',
          address: profileRes.data.address || '',
          skills: profileRes.data.skills || '',
        });
        // Get latest resume analysis
        if (profileRes.data.resume_analyses && profileRes.data.resume_analyses.length > 0) {
          setResumeAnalysis(profileRes.data.resume_analyses[0]);
        }
      }
      const allJobs = jobsRes.data.results || jobsRes.data;
      // Filter to only show approved and active jobs for students
      const filteredJobs = allJobs.filter(job => job.is_active && job.is_approved);
      setJobs(filteredJobs);
      setApplications(applicationsRes.data.results || applicationsRes.data);
      setNotifications(notificationsRes.data.results || notificationsRes.data);
      setRecommendations(recommendationsRes.data);
      setCampusEvents(eventsRes.data.results || eventsRes.data || []);
      setEventRegistrations(registrationsRes.data.results || registrationsRes.data || []);
      setRecruitmentDrives(drivesRes.data.results || drivesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const profileId = profile?.id;
      if (!profileId) {
        alert('Please create your profile first');
        return;
      }

      // Update profile with resume
      const formData2 = new FormData();
      formData2.append('resume', file);
      Object.keys(profileForm).forEach(key => {
        if (profileForm[key]) formData2.append(key, profileForm[key]);
      });

      await api.patch(`/students/profiles/${profileId}/`, formData2, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchData();
      alert('Resume uploaded successfully!');
    } catch (error) {
      alert('Failed to upload resume');
    }
  };

  const handleDocumentUpload = async () => {
    if (!documentFile || !documentType) {
      alert('Please select a document and type');
      return;
    }

    const formData = new FormData();
    formData.append('document', documentFile);
    formData.append('document_type', documentType);

    try {
      const profileId = profile?.id;
      if (!profileId) {
        alert('Please create your profile first');
        return;
      }

      await api.post(`/students/profiles/${profileId}/upload_document/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDocumentFile(null);
      setDocumentType('');
      fetchData();
      alert('Document uploaded successfully!');
    } catch (error) {
      alert('Failed to upload document');
    }
  };

  const handleAnalyzeResume = async () => {
    if (!profile?.id) {
      alert('Please create your profile first');
      return;
    }

    if (!profile.resume) {
      alert('Please upload a resume first');
      return;
    }

    try {
      const response = await api.post(`/students/profiles/${profile.id}/analyze_resume/`);
      setResumeAnalysis(response.data);
      setOpenResumeDialog(true);
      fetchData();
    } catch (error) {
      alert('Failed to analyze resume');
    }
  };

  const handleSaveProfile = async () => {
    try {
      const profileId = profile?.id;
      if (!profileId) {
        // Create new profile
        const formData = new FormData();
        Object.keys(profileForm).forEach(key => {
          if (profileForm[key]) formData.append(key, profileForm[key]);
        });
        if (resumeFile) formData.append('resume', resumeFile);

        await api.post('/students/profiles/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        // Update existing profile
        const formData = new FormData();
        Object.keys(profileForm).forEach(key => {
          if (profileForm[key]) formData.append(key, profileForm[key]);
        });
        if (resumeFile) formData.append('resume', resumeFile);

        await api.patch(`/students/profiles/${profileId}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setProfileEditMode(false);
      fetchData();
      alert('Profile saved successfully!');
    } catch (error) {
      alert('Failed to save profile');
    }
  };

  const handleRegisterForEvent = async (eventId) => {
    try {
      await api.post('/events/registrations/', { event: eventId });
      setSnackbar({ open: true, message: 'Successfully registered for event!', severity: 'success' });
      fetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to register for event';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleApply = (job) => {
    setSelectedJob(job);
    setOpenJobDialog(true);
  };

  const submitApplication = async () => {
    if (!selectedJob || !selectedJob.id) {
      setSnackbar({ open: true, message: 'Invalid job selected', severity: 'error' });
      setOpenJobDialog(false);
      return;
    }

    try {
      const response = await api.post('/applications/', {
        job: selectedJob.id,
        cover_letter: coverLetter,
      });
      setOpenJobDialog(false);
      setCoverLetter('');
      setSelectedJob(null);
      fetchData();
      setSnackbar({ open: true, message: 'Application submitted successfully!', severity: 'success' });
    } catch (error) {
      const errorMessage = error.response?.data?.job?.[0] || 
                          error.response?.data?.error || 
                          error.response?.data?.detail ||
                          'Failed to submit application';
      // Close dialog immediately
      setOpenJobDialog(false);
      setCoverLetter('');
      setSelectedJob(null);
      // Show error message
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      console.error('Application error:', error.response?.data);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Loading...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Toolbar>
          <SchoolIcon sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            PlaceMate - Student Dashboard
          </Typography>
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{
              borderRadius: 2,
              px: 2,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 4,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
              }}
            >
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Welcome back, {user?.first_name || user?.username}! 👋
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Manage your profile, explore opportunities, and track your applications
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              }}
            >
              <Tabs
                value={tab}
                onChange={(e, v) => setTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    minHeight: 72,
                    '&.Mui-selected': {
                      color: 'primary.main',
                    },
                  },
                }}
              >
                <Tab icon={<WorkIcon />} label="Jobs" iconPosition="start" />
                <Tab icon={<PersonIcon />} label="Profile" iconPosition="start" />
                <Tab icon={<AssessmentIcon />} label="Applications" iconPosition="start" />
                <Tab icon={<DescriptionIcon />} label="Resume Analyzer" iconPosition="start" />
                <Tab icon={<NotificationsIcon />} label="Notifications" iconPosition="start" />
                <Tab icon={<EventIcon />} label="Campus Events" iconPosition="start" />
                <Tab icon={<CalendarIcon />} label="Recruitment Drives" iconPosition="start" />
              </Tabs>

              <Box sx={{ p: 4 }}>
                {tab === 0 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                      <Typography variant="h6">Available Jobs</Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <TextField
                          size="small"
                          placeholder="Search jobs..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                          <InputLabel>Department</InputLabel>
                          <Select
                            value={filterDepartment}
                            onChange={(e) => setFilterDepartment(e.target.value)}
                            label="Department"
                          >
                            <MenuItem value="">All Departments</MenuItem>
                            {[...new Set(jobs.map(j => j.department))].map((dept) => (
                              <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                          <InputLabel>Job Type</InputLabel>
                          <Select
                            value={filterJobType}
                            onChange={(e) => setFilterJobType(e.target.value)}
                            label="Job Type"
                          >
                            <MenuItem value="">All Types</MenuItem>
                            <MenuItem value="full_time">Full Time</MenuItem>
                            <MenuItem value="part_time">Part Time</MenuItem>
                            <MenuItem value="internship">Internship</MenuItem>
                            <MenuItem value="contract">Contract</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>
                    {recommendations.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                          Recommended for You
                        </Typography>
                        <Grid container spacing={2}>
                          {recommendations.map((job) => (
                            <Grid item xs={12} md={6} key={job.id}>
                              <Card>
                                <CardContent>
                                  <Typography variant="h6">{job.title}</Typography>
                                  <Typography color="textSecondary">{job.company?.company_name}</Typography>
                                  <Typography variant="body2" sx={{ mt: 1 }}>
                                    {job.description.substring(0, 150)}...
                                  </Typography>
                                  <Box sx={{ mt: 2 }}>
                                    <Chip label={job.job_type} size="small" sx={{ mr: 1 }} />
                                    <Chip label={job.department} size="small" />
                                  </Box>
                                  <Button
                                    variant="contained"
                                    sx={{ mt: 2 }}
                                    onClick={() => handleApply(job)}
                                  >
                                    Apply
                                  </Button>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                    <Grid container spacing={2}>
                      {jobs
                        .filter((job) => {
                          const matchesSearch = !searchTerm || 
                            job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            job.company?.company_name.toLowerCase().includes(searchTerm.toLowerCase());
                          const matchesDepartment = !filterDepartment || job.department === filterDepartment;
                          const matchesJobType = !filterJobType || job.job_type === filterJobType;
                          return matchesSearch && matchesDepartment && matchesJobType;
                        })
                        .map((job) => (
                        <Grid item xs={12} md={6} key={job.id}>
                          <Card
                            sx={{
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              transition: 'all 0.3s ease',
                              borderRadius: 3,
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                              },
                            }}
                          >
                            <CardContent sx={{ flexGrow: 1, p: 3 }}>
                              <Typography variant="h6" fontWeight="bold" gutterBottom>
                                {job.title}
                              </Typography>
                              <Typography color="primary" fontWeight="600" gutterBottom>
                                {job.company?.company_name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                                {job.description.substring(0, 150)}...
                              </Typography>
                              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                <Chip
                                  label={job.job_type?.replace('_', ' ').toUpperCase()}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                                <Chip
                                  label={job.department}
                                  size="small"
                                  color="secondary"
                                  variant="outlined"
                                />
                                {job.salary_min && (
                                  <Chip
                                    label={`₹${job.salary_min} - ₹${job.salary_max || 'Negotiable'}`}
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                              <Button
                                variant="contained"
                                fullWidth
                                sx={{
                                  mt: 'auto',
                                  borderRadius: 2,
                                  py: 1.2,
                                  background: applications.some((app) => app.job?.id === job.id)
                                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  '&:hover': {
                                    transform: 'scale(1.02)',
                                    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
                                  },
                                }}
                                onClick={() => handleApply(job)}
                                disabled={
                                  applications.some((app) => app.job?.id === job.id) ||
                                  !job.is_active ||
                                  !job.is_approved
                                }
                              >
                                {applications.some((app) => app.job?.id === job.id)
                                  ? '✓ Applied'
                                  : !job.is_active || !job.is_approved
                                  ? 'Not Available'
                                  : 'Apply Now'}
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                    {jobs.filter((job) => {
                      const matchesSearch = !searchTerm || 
                        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        job.company?.company_name.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesDepartment = !filterDepartment || job.department === filterDepartment;
                      const matchesJobType = !filterJobType || job.job_type === filterJobType;
                      return matchesSearch && matchesDepartment && matchesJobType;
                    }).length === 0 && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        No jobs found matching your criteria.
                      </Alert>
                    )}
                  </Box>
                )}

                {tab === 1 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">My Profile</Typography>
                      <Button
                        variant={profileEditMode ? 'outlined' : 'contained'}
                        onClick={() => {
                          if (profileEditMode) {
                            setProfileEditMode(false);
                            fetchData();
                          } else {
                            setProfileEditMode(true);
                          }
                        }}
                      >
                        {profileEditMode ? 'Cancel' : 'Edit Profile'}
                      </Button>
                    </Box>

                    {profileEditMode ? (
                      <Card>
                        <CardContent>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Enrollment Number"
                                value={profileForm.enrollment_number}
                                onChange={(e) => setProfileForm({ ...profileForm, enrollment_number: e.target.value })}
                                margin="normal"
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Department"
                                value={profileForm.department}
                                onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                                margin="normal"
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Course"
                                value={profileForm.course}
                                onChange={(e) => setProfileForm({ ...profileForm, course: e.target.value })}
                                margin="normal"
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                type="number"
                                label="Year"
                                value={profileForm.year}
                                onChange={(e) => setProfileForm({ ...profileForm, year: e.target.value })}
                                margin="normal"
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                type="number"
                                step="0.01"
                                label="CGPA"
                                value={profileForm.cgpa}
                                onChange={(e) => setProfileForm({ ...profileForm, cgpa: e.target.value })}
                                margin="normal"
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Phone"
                                value={profileForm.phone}
                                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                margin="normal"
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Address"
                                value={profileForm.address}
                                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                                margin="normal"
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Skills (comma-separated)"
                                value={profileForm.skills}
                                onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                                margin="normal"
                                placeholder="e.g., Python, JavaScript, React"
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Upload Resume (PDF/DOC)
                                </Typography>
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx"
                                  onChange={(e) => setResumeFile(e.target.files[0])}
                                  style={{ marginBottom: '10px' }}
                                />
                                {resumeFile && <Typography variant="caption">{resumeFile.name}</Typography>}
                              </Box>
                            </Grid>
                            <Grid item xs={12}>
                              <Button variant="contained" onClick={handleSaveProfile} sx={{ mt: 2 }}>
                                Save Profile
                              </Button>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ) : (
                      <>
                        {profile ? (
                          <Card
                            sx={{
                              borderRadius: 3,
                              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                            }}
                          >
                            <CardContent sx={{ p: 4 }}>
                              <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                  <Typography><strong>Enrollment:</strong> {profile.enrollment_number}</Typography>
                                  <Typography><strong>Department:</strong> {profile.department}</Typography>
                                  <Typography><strong>Course:</strong> {profile.course}</Typography>
                                  <Typography><strong>Year:</strong> {profile.year}</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Typography><strong>CGPA:</strong> {profile.cgpa || 'N/A'}</Typography>
                                  <Typography><strong>Phone:</strong> {profile.phone || 'N/A'}</Typography>
                                  <Typography><strong>Skills:</strong> {profile.skills || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                                    {profile.resume ? (
                                      <>
                                        <Button variant="outlined" href={`http://localhost:8000${profile.resume}`} target="_blank">
                                          View Resume
                                        </Button>
                                        <Button
                                          variant="outlined"
                                          component="label"
                                          startIcon={<UploadIcon />}
                                        >
                                          Replace Resume
                                          <input
                                            type="file"
                                            hidden
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleResumeUpload}
                                          />
                                        </Button>
                                      </>
                                    ) : (
                                      <Button
                                        variant="outlined"
                                        component="label"
                                        startIcon={<UploadIcon />}
                                      >
                                        Upload Resume
                                        <input
                                          type="file"
                                          hidden
                                          accept=".pdf,.doc,.docx"
                                          onChange={handleResumeUpload}
                                        />
                                      </Button>
                                    )}
                                  </Box>
                                </Grid>
                                <Grid item xs={12}>
                                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                                    Academic Documents
                                  </Typography>
                                  {profile.documents && profile.documents.length > 0 ? (
                                    <Box>
                                      {profile.documents.map((doc) => (
                                        <Box key={doc.id} sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <Typography>{doc.document_type}</Typography>
                                          <Button size="small" href={`http://localhost:8000${doc.document}`} target="_blank">
                                            View
                                          </Button>
                                        </Box>
                                      ))}
                                    </Box>
                                  ) : (
                                    <Typography variant="body2" color="textSecondary">No documents uploaded</Typography>
                                  )}
                                  <Box sx={{ mt: 2 }}>
                                    <TextField
                                      select
                                      label="Document Type"
                                      value={documentType}
                                      onChange={(e) => setDocumentType(e.target.value)}
                                      sx={{ mr: 2, minWidth: 150 }}
                                      SelectProps={{
                                        native: true,
                                      }}
                                    >
                                      <option value="">Select Type</option>
                                      <option value="Transcript">Transcript</option>
                                      <option value="Certificate">Certificate</option>
                                      <option value="Degree">Degree</option>
                                      <option value="Other">Other</option>
                                    </TextField>
                                    <Button
                                      variant="outlined"
                                      component="label"
                                      startIcon={<UploadIcon />}
                                      disabled={!documentType}
                                    >
                                      Upload Document
                                      <input
                                        type="file"
                                        hidden
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        onChange={(e) => setDocumentFile(e.target.files[0])}
                                      />
                                    </Button>
                                    {documentFile && (
                                      <Button
                                        variant="contained"
                                        onClick={handleDocumentUpload}
                                        sx={{ ml: 2 }}
                                      >
                                        Save
                                      </Button>
                                    )}
                                  </Box>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        ) : (
                          <Alert severity="info">Please create your profile</Alert>
                        )}
                      </>
                    )}
                  </Box>
                )}

                {tab === 2 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      My Applications
                    </Typography>
                    {applications.length === 0 ? (
                      <Alert severity="info">You haven't applied to any jobs yet.</Alert>
                    ) : (
                      <Grid container spacing={2}>
                        {applications.map((app) => (
                          <Grid item xs={12} key={app.id}>
                            <Card
                              sx={{
                                borderRadius: 3,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateX(4px)',
                                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                                },
                              }}
                            >
                              <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                  <Box>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                      {app.job?.title}
                                    </Typography>
                                    <Typography color="primary" fontWeight="600">
                                      {app.job?.company?.company_name}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    label={app.status?.replace('_', ' ').toUpperCase() || 'N/A'}
                                    color={
                                      app.status === 'offer' || app.status === 'accepted'
                                        ? 'success'
                                        : app.status === 'rejected'
                                        ? 'error'
                                        : app.status === 'shortlisted' || app.status === 'interview_scheduled'
                                        ? 'info'
                                        : 'default'
                                    }
                                    sx={{ fontWeight: 600 }}
                                  />
                                </Box>
                                {(app.interview_date || app.interview_location) && (
                                  <Box
                                    sx={{
                                      bgcolor: 'info.light',
                                      color: 'white',
                                      p: 2,
                                      borderRadius: 2,
                                      mb: 2,
                                    }}
                                  >
                                    {app.interview_date && (
                                      <Typography variant="body2" fontWeight="600">
                                        📅 Interview: {new Date(app.interview_date).toLocaleString()}
                                      </Typography>
                                    )}
                                    {app.interview_location && (
                                      <Typography variant="body2" fontWeight="600" sx={{ mt: 0.5 }}>
                                        📍 Location: {app.interview_location}
                                      </Typography>
                                    )}
                                  </Box>
                                )}
                                <Typography variant="caption" color="text.secondary">
                                  Applied on: {new Date(app.applied_at).toLocaleDateString()}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>
                )}

                {tab === 3 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">ATS Resume Analyzer</Typography>
                      {profile?.resume && (
                        <Button variant="contained" onClick={handleAnalyzeResume}>
                          Analyze Resume
                        </Button>
                      )}
                    </Box>
                    {!profile?.resume ? (
                      <Alert severity="warning">
                        Please upload a resume first to use the ATS analyzer.
                      </Alert>
                    ) : resumeAnalysis ? (
                      <Card
                        sx={{
                          borderRadius: 3,
                          background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                          border: '2px solid',
                          borderColor: 'primary.light',
                        }}
                      >
                        <CardContent sx={{ p: 4 }}>
                          <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <Typography
                              variant="h3"
                              fontWeight="bold"
                              color="primary"
                              gutterBottom
                            >
                              {resumeAnalysis.ats_score}/100
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                              ATS Compatibility Score
                            </Typography>
                          </Box>
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="h6" gutterBottom>Feedback:</Typography>
                            <Typography>{resumeAnalysis.feedback}</Typography>
                          </Box>
                          {resumeAnalysis.keywords_found && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="h6" gutterBottom>Keywords Found:</Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {resumeAnalysis.keywords_found.split(',').map((keyword, idx) => (
                                  <Chip key={idx} label={keyword.trim()} color="success" size="small" />
                                ))}
                              </Box>
                            </Box>
                          )}
                          {resumeAnalysis.keywords_missing && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="h6" gutterBottom>Recommended Keywords:</Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {resumeAnalysis.keywords_missing.split(',').map((keyword, idx) => (
                                  <Chip key={idx} label={keyword.trim()} color="warning" size="small" />
                                ))}
                              </Box>
                            </Box>
                          )}
                          {resumeAnalysis.formatting_issues && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="h6" gutterBottom>Formatting Suggestions:</Typography>
                              <Typography>{resumeAnalysis.formatting_issues}</Typography>
                            </Box>
                          )}
                          <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
                            Analyzed on: {new Date(resumeAnalysis.analyzed_at).toLocaleString()}
                          </Typography>
                        </CardContent>
                      </Card>
                    ) : (
                      <Alert severity="info">
                        Click "Analyze Resume" to get your ATS compatibility score and feedback.
                      </Alert>
                    )}
                  </Box>
                )}

                {tab === 4 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Notifications
                    </Typography>
                    {notifications.length === 0 ? (
                      <Alert severity="info" sx={{ borderRadius: 2 }}>
                        No notifications at this time
                      </Alert>
                    ) : (
                      notifications.map((notif) => (
                        <Card
                          key={notif.id}
                          sx={{
                            mb: 2,
                            borderRadius: 2,
                            borderLeft: '4px solid',
                            borderColor: 'primary.main',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateX(4px)',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            },
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                              {notif.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                              {notif.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(notif.created_at).toLocaleString()}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </Box>
                )}

                {tab === 5 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Campus Events
                    </Typography>
                    {campusEvents.length === 0 ? (
                      <Alert severity="info" sx={{ borderRadius: 2 }}>
                        No upcoming events at this time
                      </Alert>
                    ) : (
                      <Grid container spacing={2}>
                        {campusEvents.map((event) => {
                          const isRegistered = eventRegistrations.some(reg => reg.event?.id === event.id);
                          const isFull = event.max_participants && (event.registered_count || 0) >= event.max_participants;
                          const canRegister = event.registration_required && !isRegistered && !isFull && event.is_approved;
                          
                          return (
                            <Grid item xs={12} md={6} key={event.id}>
                              <Card
                                sx={{
                                  borderRadius: 2,
                                  borderLeft: '4px solid',
                                  borderColor: 'primary.main',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                                  },
                                }}
                              >
                                <CardContent>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                    <Box>
                                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        {event.title}
                                      </Typography>
                                      <Chip
                                        label={event.event_type}
                                        size="small"
                                        color="primary"
                                        sx={{ mb: 1 }}
                                      />
                                    </Box>
                                    {isRegistered && (
                                      <Chip
                                        label="Registered"
                                        color="success"
                                        size="small"
                                      />
                                    )}
                                  </Box>
                                  <Typography variant="body2" color="text.secondary" paragraph>
                                    {event.description}
                                  </Typography>
                                  <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" gutterBottom>
                                      <strong>Date:</strong> {new Date(event.event_date).toLocaleString()}
                                    </Typography>
                                    <Typography variant="body2" gutterBottom>
                                      <strong>Location:</strong> {event.location}
                                    </Typography>
                                    {event.venue && (
                                      <Typography variant="body2" gutterBottom>
                                        <strong>Venue:</strong> {event.venue}
                                      </Typography>
                                    )}
                                    <Typography variant="body2" gutterBottom>
                                      <strong>Organizer:</strong> {event.organizer}
                                    </Typography>
                                    {event.company && (
                                      <Typography variant="body2" gutterBottom>
                                        <strong>Company:</strong> {event.company.company_name}
                                      </Typography>
                                    )}
                                    {event.max_participants && (
                                      <Typography variant="body2" gutterBottom>
                                        <strong>Participants:</strong> {event.registered_count || 0} / {event.max_participants}
                                      </Typography>
                                    )}
                                  </Box>
                                  {canRegister && (
                                    <Button
                                      variant="contained"
                                      fullWidth
                                      sx={{ mt: 2 }}
                                      onClick={() => handleRegisterForEvent(event.id)}
                                    >
                                      Register for Event
                                    </Button>
                                  )}
                                  {isFull && !isRegistered && (
                                    <Alert severity="warning" sx={{ mt: 2 }}>
                                      Event is full
                                    </Alert>
                                  )}
                                  {!event.registration_required && (
                                    <Alert severity="info" sx={{ mt: 2 }}>
                                      No registration required
                                    </Alert>
                                  )}
                                </CardContent>
                              </Card>
                            </Grid>
                          );
                        })}
                      </Grid>
                    )}
                  </Box>
                )}

                {tab === 6 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Recruitment Drives
                    </Typography>
                    {recruitmentDrives.length === 0 ? (
                      <Alert severity="info" sx={{ borderRadius: 2 }}>
                        No upcoming recruitment drives at this time
                      </Alert>
                    ) : (
                      <Grid container spacing={2}>
                        {recruitmentDrives.map((drive) => (
                          <Grid item xs={12} md={6} key={drive.id}>
                            <Card
                              sx={{
                                borderRadius: 2,
                                borderLeft: '4px solid',
                                borderColor: 'primary.main',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateY(-4px)',
                                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                                },
                              }}
                            >
                              <CardContent>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                  {drive.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                  {drive.description}
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                  <Typography variant="body2" gutterBottom>
                                    <strong>Company:</strong> {drive.company?.company_name}
                                  </Typography>
                                  <Typography variant="body2" gutterBottom>
                                    <strong>Date & Time:</strong> {new Date(drive.drive_date).toLocaleString()}
                                  </Typography>
                                  <Typography variant="body2" gutterBottom>
                                    <strong>Location:</strong> {drive.location}
                                  </Typography>
                                  {drive.venue && (
                                    <Typography variant="body2" gutterBottom>
                                      <strong>Venue:</strong> {drive.venue}
                                    </Typography>
                                  )}
                                  {drive.job && (
                                    <Typography variant="body2" gutterBottom>
                                      <strong>Related Job:</strong> {drive.job.title}
                                    </Typography>
                                  )}
                                </Box>
                                <Chip
                                  label={drive.status}
                                  size="small"
                                  color="primary"
                                  sx={{ mt: 2 }}
                                />
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Dialog open={openJobDialog} onClose={() => setOpenJobDialog(false)}>
        <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Cover Letter (Optional)"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenJobDialog(false)}>Cancel</Button>
          <Button onClick={submitApplication} variant="contained">
            Submit Application
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openResumeDialog} onClose={() => setOpenResumeDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Resume Analysis Results</DialogTitle>
        <DialogContent>
          {resumeAnalysis && (
            <>
              <Typography variant="h4" color="primary" gutterBottom>
                ATS Score: {resumeAnalysis.ats_score}/100
              </Typography>
              <Typography variant="h6" sx={{ mt: 2 }}>Feedback:</Typography>
              <Typography>{resumeAnalysis.feedback}</Typography>
              {resumeAnalysis.keywords_found && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6">Keywords Found:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {resumeAnalysis.keywords_found.split(',').map((keyword, idx) => (
                      <Chip key={idx} label={keyword.trim()} color="success" size="small" />
                    ))}
                  </Box>
                </Box>
              )}
              {resumeAnalysis.keywords_missing && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6">Recommended Keywords:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {resumeAnalysis.keywords_missing.split(',').map((keyword, idx) => (
                      <Chip key={idx} label={keyword.trim()} color="warning" size="small" />
                    ))}
                  </Box>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResumeDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default StudentDashboard;


