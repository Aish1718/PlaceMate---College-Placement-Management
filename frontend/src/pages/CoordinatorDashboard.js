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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  CheckCircle,
  Cancel,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function CoordinatorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [students, setStudents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [recruitmentDrives, setRecruitmentDrives] = useState([]);
  const [campusEvents, setCampusEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [approveDialog, setApproveDialog] = useState({ open: false, user: null });
  const [openAnnouncementDialog, setOpenAnnouncementDialog] = useState(false);
  const [openDriveDialog, setOpenDriveDialog] = useState(false);
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    target_role: 'student',
  });
  const [driveForm, setDriveForm] = useState({
    company: '',
    job: '',
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
    company: '',
    max_participants: '',
    registration_required: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, studentsRes, jobsRes, pendingRes, applicationsRes, companiesRes, drivesRes, eventsRes] = await Promise.all([
        api.get('/dashboard/stats/'),
        api.get('/students/profiles/'),
        api.get('/jobs/'),
        api.get('/auth/pending/').catch(() => ({ data: [] })),
        api.get('/applications/').catch(() => ({ data: { results: [], data: [] } })),
        api.get('/companies/').catch(() => ({ data: { results: [], data: [] } })),
        api.get('/recruitment-drives/drives/').catch(() => ({ data: { results: [], data: [] } })),
        api.get('/events/events/').catch(() => ({ data: { results: [], data: [] } })),
      ]);
      setStats(statsRes.data);
      setStudents(studentsRes.data.results || studentsRes.data);
      setJobs(jobsRes.data.results || jobsRes.data);
      setPendingUsers(pendingRes.data || []);
      setApplications(applicationsRes.data.results || applicationsRes.data || []);
      setCompanies(companiesRes.data.results || companiesRes.data || []);
      setRecruitmentDrives(drivesRes.data.results || drivesRes.data || []);
      setCampusEvents(eventsRes.data.results || eventsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveJob = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/approve/`);
      fetchData();
    } catch (error) {
      alert('Failed to approve job');
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await api.post(`/auth/${userId}/approve/`);
      setApproveDialog({ open: false, user: null });
      fetchData();
      alert('User approved successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to approve user');
    }
  };

  const handleRejectUser = async (userId) => {
    if (window.confirm('Are you sure you want to reject this user? This action cannot be undone.')) {
      try {
        await api.post(`/auth/${userId}/reject/`);
        fetchData();
        alert('User rejected successfully!');
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to reject user');
      }
    }
  };

  const handleApproveDrive = async (driveId) => {
    try {
      await api.post(`/recruitment-drives/drives/${driveId}/approve/`);
      fetchData();
      alert('Recruitment drive approved successfully!');
    } catch (error) {
      alert('Failed to approve recruitment drive');
    }
  };

  const handleApproveEvent = async (eventId) => {
    try {
      await api.post(`/events/events/${eventId}/approve/`);
      fetchData();
      alert('Event approved successfully!');
    } catch (error) {
      alert('Failed to approve event');
    }
  };

  const handleCreateDrive = async () => {
    try {
      await api.post('/recruitment-drives/drives/', driveForm);
      setOpenDriveDialog(false);
      setDriveForm({
        company: '',
        job: '',
        title: '',
        description: '',
        drive_date: '',
        location: '',
        venue: '',
        coordinator_notes: '',
      });
      fetchData();
      alert('Recruitment drive created successfully!');
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
        company: '',
        max_participants: '',
        registration_required: false,
      });
      fetchData();
      alert('Event created successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create event');
    }
  };

  const handleSendAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.message) {
      alert('Please fill all fields');
      return;
    }

    try {
      const response = await api.post('/notifications/send_announcement/', announcementForm);
      setOpenAnnouncementDialog(false);
      setAnnouncementForm({ title: '', message: '', target_role: 'student' });
      alert(`Announcement sent to ${response.data.sent_count} users!`);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to send announcement');
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
            PlaceMate - {user?.is_superuser ? 'Admin' : 'Placement Coordinator'} Dashboard
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
                    Dashboard Overview
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Manage students, companies, and job postings
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => setOpenAnnouncementDialog(true)}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                    },
                  }}
                >
                  Send Announcement
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                border: '1px solid',
                borderColor: 'primary.light',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(102, 126, 234, 0.2)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography color="text.secondary" fontWeight="600" gutterBottom>
                  Total Students
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {stats.total_students || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary">Total Companies</Typography>
                <Typography variant="h4">{stats.total_companies || 0}</Typography>
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
                <Typography color="textSecondary">Pending Approvals</Typography>
                <Typography variant="h4">{stats.pending_approvals || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary">Pending Users</Typography>
                <Typography variant="h4">{pendingUsers.length}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary">Total Applications</Typography>
                <Typography variant="h4">{applications.length}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Paper>
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
                <Tab label="Pending Users" />
                <Tab label="Pending Jobs" />
                <Tab label="All Applications" />
                <Tab label="All Students" />
                <Tab label="All Companies" />
                <Tab label="All Jobs" />
                <Tab label="Recruitment Drives" />
                <Tab label="Campus Events" />
              </Tabs>

              <Box sx={{ p: 2 }}>
                {tab === 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Users Pending Approval
                    </Typography>
                    {pendingUsers.length === 0 ? (
                      <Alert severity="info">No pending users</Alert>
                    ) : (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Username</TableCell>
                              <TableCell>Email</TableCell>
                              <TableCell>Role</TableCell>
                              <TableCell>Name</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {pendingUsers.map((pendingUser) => (
                              <TableRow key={pendingUser.id}>
                                <TableCell>{pendingUser.username}</TableCell>
                                <TableCell>{pendingUser.email}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={pendingUser.role?.replace('_', ' ').toUpperCase() || 'N/A'}
                                    size="small"
                                    color="primary"
                                  />
                                </TableCell>
                                <TableCell>
                                  {pendingUser.first_name} {pendingUser.last_name}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="contained"
                                    color="success"
                                    size="small"
                                    startIcon={<CheckCircle />}
                                    onClick={() => setApproveDialog({ open: true, user: pendingUser })}
                                    sx={{ mr: 1 }}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    startIcon={<Cancel />}
                                    onClick={() => handleRejectUser(pendingUser.id)}
                                  >
                                    Reject
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                )}

                {tab === 1 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Job Postings Pending Approval
                    </Typography>
                    {jobs.filter((job) => !job.is_approved).length === 0 ? (
                      <Alert severity="info">No pending job postings</Alert>
                    ) : (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Title</TableCell>
                              <TableCell>Company</TableCell>
                              <TableCell>Department</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {jobs.filter((job) => !job.is_approved).map((job) => (
                              <TableRow key={job.id}>
                                <TableCell>{job.title}</TableCell>
                                <TableCell>{job.company?.company_name}</TableCell>
                                <TableCell>{job.department}</TableCell>
                                <TableCell>
                                  <Button
                                    variant="contained"
                                    color="success"
                                    size="small"
                                    onClick={() => handleApproveJob(job.id)}
                                  >
                                    Approve
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                )}

                {tab === 2 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      All Applications
                    </Typography>
                    {applications.length === 0 ? (
                      <Alert severity="info">No applications found</Alert>
                    ) : (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Student</TableCell>
                              <TableCell>Job Title</TableCell>
                              <TableCell>Company</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Applied Date</TableCell>
                              <TableCell>Department</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {applications.map((app) => (
                              <TableRow key={app.id}>
                                <TableCell>
                                  {app.student?.user || 'N/A'}
                                </TableCell>
                                <TableCell>{app.job?.title || 'N/A'}</TableCell>
                                <TableCell>{app.job?.company?.company_name || 'N/A'}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={app.status?.replace('_', ' ').toUpperCase() || 'N/A'}
                                    size="small"
                                    color={
                                      app.status === 'offer' || app.status === 'accepted'
                                        ? 'success'
                                        : app.status === 'rejected'
                                        ? 'error'
                                        : app.status === 'shortlisted'
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
                                <TableCell>{app.job?.department || 'N/A'}</TableCell>
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
                    <Typography variant="h6" gutterBottom>
                      All Students ({students.length})
                    </Typography>
                    {students.length === 0 ? (
                      <Alert severity="info">No students registered</Alert>
                    ) : (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell>Enrollment</TableCell>
                              <TableCell>Department</TableCell>
                              <TableCell>Course</TableCell>
                              <TableCell>Year</TableCell>
                              <TableCell>CGPA</TableCell>
                              <TableCell>Skills</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {students.map((student) => (
                              <TableRow key={student.id}>
                                <TableCell>{student.user || 'N/A'}</TableCell>
                                <TableCell>{student.enrollment_number}</TableCell>
                                <TableCell>{student.department}</TableCell>
                                <TableCell>{student.course || 'N/A'}</TableCell>
                                <TableCell>{student.year || 'N/A'}</TableCell>
                                <TableCell>{student.cgpa || 'N/A'}</TableCell>
                                <TableCell>
                                  <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {student.skills || 'N/A'}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                )}

                {tab === 4 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      All Companies ({companies.length})
                    </Typography>
                    {companies.length === 0 ? (
                      <Alert severity="info">No companies registered</Alert>
                    ) : (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Company Name</TableCell>
                              <TableCell>Industry</TableCell>
                              <TableCell>Address</TableCell>
                              <TableCell>Website</TableCell>
                              <TableCell>Contact Email</TableCell>
                              <TableCell>Total Jobs</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {companies.map((company) => (
                              <TableRow key={company.id}>
                                <TableCell>{company.company_name}</TableCell>
                                <TableCell>{company.industry || 'N/A'}</TableCell>
                                <TableCell>{company.address || 'N/A'}</TableCell>
                                <TableCell>
                                  {company.website ? (
                                    <a href={company.website} target="_blank" rel="noopener noreferrer">
                                      {company.website}
                                    </a>
                                  ) : (
                                    'N/A'
                                  )}
                                </TableCell>
                                <TableCell>{company.user_email || 'N/A'}</TableCell>
                                <TableCell>
                                  {jobs.filter((job) => job.company?.id === company.id).length}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                )}

                {tab === 5 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      All Job Postings ({jobs.length})
                    </Typography>
                    {jobs.length === 0 ? (
                      <Alert severity="info">No job postings found</Alert>
                    ) : (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Title</TableCell>
                              <TableCell>Company</TableCell>
                              <TableCell>Department</TableCell>
                              <TableCell>Job Type</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Applications</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {jobs.map((job) => (
                              <TableRow key={job.id}>
                                <TableCell>{job.title}</TableCell>
                                <TableCell>{job.company?.company_name || 'N/A'}</TableCell>
                                <TableCell>{job.department}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={job.job_type?.replace('_', ' ').toUpperCase()}
                                    size="small"
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={job.is_approved ? 'Approved' : 'Pending'}
                                    color={job.is_approved ? 'success' : 'warning'}
                                    size="small"
                                  />
                                  {job.is_active && (
                                    <Chip
                                      label="Active"
                                      color="info"
                                      size="small"
                                      sx={{ ml: 1 }}
                                    />
                                  )}
                                </TableCell>
                                <TableCell>
                                  {applications.filter((app) => app.job?.id === job.id).length}
                                </TableCell>
                                <TableCell>
                                  {!job.is_approved && (
                                    <Button
                                      variant="contained"
                                      color="success"
                                      size="small"
                                      onClick={() => handleApproveJob(job.id)}
                                    >
                                      Approve
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                )}

                {tab === 6 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Recruitment Drives ({recruitmentDrives.length})
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
                              <TableCell>Company</TableCell>
                              <TableCell>Date & Time</TableCell>
                              <TableCell>Location</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {recruitmentDrives.map((drive) => (
                              <TableRow key={drive.id}>
                                <TableCell>{drive.title}</TableCell>
                                <TableCell>{drive.company?.company_name || 'N/A'}</TableCell>
                                <TableCell>{new Date(drive.drive_date).toLocaleString()}</TableCell>
                                <TableCell>{drive.location}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={drive.is_approved ? 'Approved' : 'Pending Approval'}
                                    color={drive.is_approved ? 'success' : 'warning'}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  {!drive.is_approved && (
                                    <Button
                                      variant="contained"
                                      color="success"
                                      size="small"
                                      onClick={() => handleApproveDrive(drive.id)}
                                      sx={{ mr: 1 }}
                                    >
                                      Approve
                                    </Button>
                                  )}
                                  {!drive.is_approved && (
                                    <Button
                                      variant="outlined"
                                      color="error"
                                      size="small"
                                      onClick={async () => {
                                        if (window.confirm('Are you sure you want to reject this drive?')) {
                                          try {
                                            await api.post(`/recruitment-drives/drives/${drive.id}/reject/`);
                                            fetchData();
                                            alert('Recruitment drive rejected');
                                          } catch (error) {
                                            alert('Failed to reject drive');
                                          }
                                        }
                                      }}
                                    >
                                      Reject
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                )}

                {tab === 7 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Campus Events ({campusEvents.length})
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
                              <TableCell>Company</TableCell>
                              <TableCell>Date & Time</TableCell>
                              <TableCell>Location</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {campusEvents.map((event) => (
                              <TableRow key={event.id}>
                                <TableCell>{event.title}</TableCell>
                                <TableCell>{event.event_type?.replace('_', ' ')}</TableCell>
                                <TableCell>{event.company?.company_name || 'N/A'}</TableCell>
                                <TableCell>{new Date(event.event_date).toLocaleString()}</TableCell>
                                <TableCell>{event.location}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={event.is_approved ? 'Approved' : 'Pending Approval'}
                                    color={event.is_approved ? 'success' : 'warning'}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  {!event.is_approved && (
                                    <Button
                                      variant="contained"
                                      color="success"
                                      size="small"
                                      onClick={() => handleApproveEvent(event.id)}
                                      sx={{ mr: 1 }}
                                    >
                                      Approve
                                    </Button>
                                  )}
                                  {!event.is_approved && (
                                    <Button
                                      variant="outlined"
                                      color="error"
                                      size="small"
                                      onClick={async () => {
                                        if (window.confirm('Are you sure you want to reject this event?')) {
                                          try {
                                            await api.post(`/events/events/${event.id}/reject/`);
                                            fetchData();
                                            alert('Event rejected');
                                          } catch (error) {
                                            alert('Failed to reject event');
                                          }
                                        }
                                      }}
                                    >
                                      Reject
                                    </Button>
                                  )}
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

      <Dialog
        open={approveDialog.open}
        onClose={() => setApproveDialog({ open: false, user: null })}
      >
        <DialogTitle>Approve User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to approve user <strong>{approveDialog.user?.username}</strong>?
            This will allow them to access the system.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialog({ open: false, user: null })}>Cancel</Button>
          <Button
            onClick={() => handleApproveUser(approveDialog.user?.id)}
            variant="contained"
            color="success"
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openAnnouncementDialog} onClose={() => setOpenAnnouncementDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Send Announcement</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={announcementForm.title}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Message"
              value={announcementForm.message}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Send To</InputLabel>
              <Select
                value={announcementForm.target_role}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, target_role: e.target.value })}
                label="Send To"
              >
                <MenuItem value="student">All Students</MenuItem>
                <MenuItem value="company">All Companies</MenuItem>
                <MenuItem value="all">Everyone</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAnnouncementDialog(false)}>Cancel</Button>
          <Button onClick={handleSendAnnouncement} variant="contained">
            Send Announcement
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDriveDialog} onClose={() => setOpenDriveDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Recruitment Drive</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Company</InputLabel>
              <Select
                value={driveForm.company}
                onChange={(e) => setDriveForm({ ...driveForm, company: e.target.value })}
                label="Company"
              >
                <MenuItem value="">Select Company</MenuItem>
                {companies.map((comp) => (
                  <MenuItem key={comp.id} value={comp.id}>{comp.company_name}</MenuItem>
                ))}
              </Select>
            </FormControl>
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
              label="Coordinator Notes"
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
            <Box sx={{ mt: 2 }}>
              <label>
                <input
                  type="checkbox"
                  checked={eventForm.registration_required}
                  onChange={(e) => setEventForm({ ...eventForm, registration_required: e.target.checked })}
                />
                {' '}Registration Required
              </label>
            </Box>
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

export default CoordinatorDashboard;

