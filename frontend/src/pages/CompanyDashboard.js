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
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Tabs,
  Tab,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function CompanyDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [company, setCompany] = useState(null);
  const [openJobDialog, setOpenJobDialog] = useState(false);
  const [openInterviewDialog, setOpenInterviewDialog] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [interviewForm, setInterviewForm] = useState({
    interview_date: '',
    interview_location: '',
  });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [recruitmentDrives, setRecruitmentDrives] = useState([]);
  const [campusEvents, setCampusEvents] = useState([]);
  const [openDriveDialog, setOpenDriveDialog] = useState(false);
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [driveForm, setDriveForm] = useState({
    title: '',
    description: '',
    drive_date: '',
    location: '',
    venue: '',
    coordinator_notes: '',
  });
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_type: 'workshop',
    event_date: '',
    location: '',
    venue: '',
    organizer: '',
    max_participants: '',
    registration_required: false,
  });
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    job_type: 'full_time',
    department: '',
    required_skills: '',
    min_cgpa: '',
    salary_min: '',
    salary_max: '',
    location: '',
    application_deadline: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, jobsRes, applicationsRes, companyRes, drivesRes, eventsRes] = await Promise.all([
        api.get('/dashboard/stats/'),
        api.get('/jobs/'),
        api.get('/applications/'),
        api.get('/companies/me/').catch((err) => {
          // If company profile doesn't exist, return null
          if (err.response?.status === 404) {
            return { data: null };
          }
          throw err;
        }),
        api.get('/recruitment-drives/drives/').catch(() => ({ data: { results: [], data: [] } })),
        api.get('/events/events/').catch(() => ({ data: { results: [], data: [] } })),
      ]);
      setStats(statsRes.data);
      // Ensure we handle both paginated and non-paginated responses
      const jobsData = jobsRes.data?.results || jobsRes.data || [];
      const applicationsData = applicationsRes.data?.results || applicationsRes.data || [];
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setApplications(Array.isArray(applicationsData) ? applicationsData : []);
      setCompany(companyRes.data);
      setRecruitmentDrives(drivesRes.data.results || drivesRes.data || []);
      setCampusEvents(eventsRes.data.results || eventsRes.data || []);

      // Debug logging
      console.log('Fetched jobs:', jobsData.length);
      console.log('Fetched applications:', applicationsData.length);
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async () => {
    try {
      await api.post('/jobs/', jobForm);
      setOpenJobDialog(false);
      setJobForm({
        title: '',
        description: '',
        job_type: 'full_time',
        department: '',
        required_skills: '',
        min_cgpa: '',
        salary_min: '',
        salary_max: '',
        location: '',
        application_deadline: '',
      });
      fetchData();
      alert('Job posted successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.company?.[0] ||
                          error.response?.data?.error ||
                          error.response?.data?.message ||
                          'Failed to create job posting. Please ensure your company profile is created.';
      alert(errorMessage);
    }
  };

  const handleUpdateApplication = async (appId, status) => {
    try {
      await api.patch(`/applications/${appId}/`, { status });
      fetchData();
    } catch (error) {
      alert('Failed to update application');
    }
  };

  const handleDownloadResume = async (application) => {
    try {
      const response = await api.get(`/applications/${application.id}/download_resume/`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${application.student?.user || 'resume'}_resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to download resume');
    }
  };

  const handleScheduleInterview = (application) => {
    setSelectedApplication(application);
    setOpenInterviewDialog(true);
  };

  const submitInterview = async () => {
    if (!interviewForm.interview_date || !interviewForm.interview_location) {
      alert('Please fill all fields');
      return;
    }

    try {
      await api.patch(`/applications/${selectedApplication.id}/`, {
        status: 'interview_scheduled',
        interview_date: interviewForm.interview_date,
        interview_location: interviewForm.interview_location,
      });
      setOpenInterviewDialog(false);
      setInterviewForm({ interview_date: '', interview_location: '' });
      fetchData();
      alert('Interview scheduled successfully!');
    } catch (error) {
      alert('Failed to schedule interview');
    }
  };

  const handleCreateDrive = async () => {
    try {
      await api.post('/recruitment-drives/drives/', driveForm);
      setOpenDriveDialog(false);
      setDriveForm({
        title: '',
        description: '',
        drive_date: '',
        location: '',
        venue: '',
        coordinator_notes: '',
      });
      fetchData();
      alert('Recruitment drive created successfully! Awaiting coordinator approval.');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create recruitment drive');
    }
  };

  const handleCreateEvent = async () => {
    try {
      await api.post('/events/events/', eventForm);
      setOpenEventDialog(false);
      setEventForm({
        title: '',
        description: '',
        event_type: 'workshop',
        event_date: '',
        location: '',
        venue: '',
        organizer: '',
        max_participants: '',
        registration_required: false,
      });
      fetchData();
      alert('Event created successfully! Awaiting coordinator approval.');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create event');
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
          <BusinessIcon sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            PlaceMate - {company?.company_name || 'Company'} Dashboard
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
                mb: 3,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {company?.company_name || 'Company'} Dashboard
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Manage jobs, applications, recruitment drives, and events
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary">Total Jobs</Typography>
                <Typography variant="h4">{stats.total_jobs || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary">Active Jobs</Typography>
                <Typography variant="h4">{stats.active_jobs || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary">Total Applications</Typography>
                <Typography variant="h4">{stats.total_applications || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary">Pending Review</Typography>
                <Typography variant="h4">{stats.pending_review || 0}</Typography>
              </CardContent>
            </Card>
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
                <Tab label="Jobs" />
                <Tab label="Applications" />
                <Tab label="Recruitment Drives" />
                <Tab label="Campus Events" />
              </Tabs>

              <Box sx={{ p: 3 }}>
                {tab === 0 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        My Job Postings
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenJobDialog(true)}
                      >
                        Post New Job
                      </Button>
                    </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Applications</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>{job.title}</TableCell>
                        <TableCell>{job.department}</TableCell>
                        <TableCell>
                          <Chip
                            label={job.is_approved ? 'Approved' : 'Pending'}
                            color={job.is_approved ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {applications.filter((app) => app.job?.id === job.id).length}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
                  </Box>
                )}

                {tab === 1 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Applications
                    </Typography>
                    <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Job</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Applied Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>{app.student?.user || 'N/A'}</TableCell>
                        <TableCell>{app.job?.title}</TableCell>
                        <TableCell>
                          <Chip
                            label={app.status?.replace('_', ' ').toUpperCase() || 'N/A'}
                            size="small"
                            color={
                              app.status === 'offer' || app.status === 'accepted'
                                ? 'success'
                                : app.status === 'rejected'
                                ? 'error'
                                : app.status === 'shortlisted' || app.status === 'interview_scheduled'
                                ? 'info'
                                : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {app.applied_at
                            ? new Date(app.applied_at).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {app.student?.resume && (
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<DownloadIcon />}
                                onClick={() => handleDownloadResume(app)}
                              >
                                Resume
                              </Button>
                            )}
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<CalendarIcon />}
                              onClick={() => handleScheduleInterview(app)}
                            >
                              Interview
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleUpdateApplication(app.id, 'shortlisted')}
                            >
                              Shortlist
                            </Button>
                            <Button
                              size="small"
                              color="success"
                              variant="contained"
                              onClick={() => handleUpdateApplication(app.id, 'offer')}
                            >
                              Offer
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              onClick={() => handleUpdateApplication(app.id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
                  </Box>
                )}

                {tab === 2 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Recruitment Drives
                      </Typography>
                      <Button variant="contained" onClick={() => setOpenDriveDialog(true)}>
                        Create Drive
                      </Button>
                    </Box>
                    {recruitmentDrives.length === 0 ? (
                      <Alert severity="info">No recruitment drives found</Alert>
                    ) : (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Title</TableCell>
                              <TableCell>Date & Time</TableCell>
                              <TableCell>Location</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {recruitmentDrives.map((drive) => (
                              <TableRow key={drive.id}>
                                <TableCell>{drive.title}</TableCell>
                                <TableCell>{new Date(drive.drive_date).toLocaleString()}</TableCell>
                                <TableCell>{drive.location}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={drive.is_approved ? 'Approved' : 'Pending Approval'}
                                    color={drive.is_approved ? 'success' : 'warning'}
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                )}

                {tab === 3 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Campus Events
                      </Typography>
                      <Button variant="contained" onClick={() => setOpenEventDialog(true)}>
                        Create Event
                      </Button>
                    </Box>
                    {campusEvents.length === 0 ? (
                      <Alert severity="info">No campus events found</Alert>
                    ) : (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Title</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell>Date & Time</TableCell>
                              <TableCell>Location</TableCell>
                              <TableCell>Registrations</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {campusEvents.map((event) => (
                              <TableRow key={event.id}>
                                <TableCell>{event.title}</TableCell>
                                <TableCell>{event.event_type}</TableCell>
                                <TableCell>{new Date(event.event_date).toLocaleString()}</TableCell>
                                <TableCell>{event.location}</TableCell>
                                <TableCell>{event.registered_count || 0}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={event.is_approved ? 'Approved' : 'Pending Approval'}
                                    color={event.is_approved ? 'success' : 'warning'}
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Dialog open={openJobDialog} onClose={() => setOpenJobDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Post New Job</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Title"
                value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                select
                label="Job Type"
                value={jobForm.job_type}
                onChange={(e) => setJobForm({ ...jobForm, job_type: e.target.value })}
              >
                <MenuItem value="full_time">Full Time</MenuItem>
                <MenuItem value="part_time">Part Time</MenuItem>
                <MenuItem value="internship">Internship</MenuItem>
                <MenuItem value="contract">Contract</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Department"
                value={jobForm.department}
                onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Required Skills (comma-separated)"
                value={jobForm.required_skills}
                onChange={(e) => setJobForm({ ...jobForm, required_skills: e.target.value })}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Min CGPA"
                type="number"
                value={jobForm.min_cgpa}
                onChange={(e) => setJobForm({ ...jobForm, min_cgpa: e.target.value })}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Min Salary"
                type="number"
                value={jobForm.salary_min}
                onChange={(e) => setJobForm({ ...jobForm, salary_min: e.target.value })}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Max Salary"
                type="number"
                value={jobForm.salary_max}
                onChange={(e) => setJobForm({ ...jobForm, salary_max: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Location"
                value={jobForm.location}
                onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Application Deadline"
                type="datetime-local"
                value={jobForm.application_deadline}
                onChange={(e) => setJobForm({ ...jobForm, application_deadline: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenJobDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateJob} variant="contained">
            Post Job
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openInterviewDialog} onClose={() => setOpenInterviewDialog(false)}>
        <DialogTitle>Schedule Interview</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Interview Date & Time"
              type="datetime-local"
              value={interviewForm.interview_date}
              onChange={(e) => setInterviewForm({ ...interviewForm, interview_date: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Interview Location"
              value={interviewForm.interview_location}
              onChange={(e) => setInterviewForm({ ...interviewForm, interview_location: e.target.value })}
              margin="normal"
              placeholder="e.g., Room 101, Building A or Online Meeting Link"
            />
            {selectedApplication && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Interview will be scheduled for: {selectedApplication.student?.user} - {selectedApplication.job?.title}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInterviewDialog(false)}>Cancel</Button>
          <Button onClick={submitInterview} variant="contained">
            Schedule Interview
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDriveDialog} onClose={() => setOpenDriveDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Recruitment Drive</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={driveForm.title}
              onChange={(e) => setDriveForm({ ...driveForm, title: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={driveForm.description}
              onChange={(e) => setDriveForm({ ...driveForm, description: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              type="datetime-local"
              label="Drive Date & Time"
              value={driveForm.drive_date}
              onChange={(e) => setDriveForm({ ...driveForm, drive_date: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="Location"
              value={driveForm.location}
              onChange={(e) => setDriveForm({ ...driveForm, location: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Venue"
              value={driveForm.venue}
              onChange={(e) => setDriveForm({ ...driveForm, venue: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Notes"
              value={driveForm.coordinator_notes}
              onChange={(e) => setDriveForm({ ...driveForm, coordinator_notes: e.target.value })}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDriveDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateDrive} variant="contained">
            Create Drive
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEventDialog} onClose={() => setOpenEventDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Campus Event</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={eventForm.title}
              onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={eventForm.description}
              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Event Type</InputLabel>
              <Select
                value={eventForm.event_type}
                onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })}
                label="Event Type"
              >
                <MenuItem value="workshop">Workshop</MenuItem>
                <MenuItem value="seminar">Seminar</MenuItem>
                <MenuItem value="info_session">Information Session</MenuItem>
                <MenuItem value="career_fair">Career Fair</MenuItem>
                <MenuItem value="networking">Networking Event</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="datetime-local"
              label="Event Date & Time"
              value={eventForm.event_date}
              onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="Location"
              value={eventForm.location}
              onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Venue"
              value={eventForm.venue}
              onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Organizer"
              value={eventForm.organizer}
              onChange={(e) => setEventForm({ ...eventForm, organizer: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              type="number"
              label="Max Participants"
              value={eventForm.max_participants}
              onChange={(e) => setEventForm({ ...eventForm, max_participants: e.target.value })}
              margin="normal"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={eventForm.registration_required}
                  onChange={(e) => setEventForm({ ...eventForm, registration_required: e.target.checked })}
                />
              }
              label="Registration Required"
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEventDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateEvent} variant="contained">
            Create Event
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CompanyDashboard;


