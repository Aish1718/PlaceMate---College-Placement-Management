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
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  CheckCircle,
  Cancel,
  GetApp as GetAppIcon,
  School as SchoolIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

function ManagementDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [approveDialog, setApproveDialog] = useState({ open: false, user: null });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, pendingRes] = await Promise.all([
        api.get('/dashboard/stats/'),
        api.get('/auth/pending/').catch(() => ({ data: [] })),
      ]);
      setStats(statsRes.data);
      setPendingUsers(pendingRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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

  const handleExportPlacement = async () => {
    try {
      const response = await api.get('/dashboard/export/placement/', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'placement_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      alert('Placement report downloaded successfully!');
    } catch (error) {
      alert('Failed to export report');
    }
  };

  const handleExportStudents = async () => {
    try {
      const response = await api.get('/dashboard/export/students/', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'students_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      alert('Students report downloaded successfully!');
    } catch (error) {
      alert('Failed to export report');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const departmentData = stats.department_stats?.map((dept) => ({
    name: dept.department,
    placed: dept.placed,
    total: dept.total,
  })) || [];

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
          <AnalyticsIcon sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            PlaceMate - College Management Dashboard
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
                    Analytics Dashboard
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Strategic insights and placement analytics
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={<GetAppIcon />}
                    onClick={handleExportPlacement}
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Export Placement
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<GetAppIcon />}
                    onClick={handleExportStudents}
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Export Students
                  </Button>
                </Box>
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
                <Typography color="textSecondary">Placed Students</Typography>
                <Typography variant="h4">{stats.placed_students || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary">Placement Rate</Typography>
                <Typography variant="h4">{stats.placement_rate || 0}%</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary">Average Salary</Typography>
                <Typography variant="h4">
                  ₹{stats.avg_salary ? stats.avg_salary.toLocaleString() : '0'}
                </Typography>
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

          <Grid item xs={12}>
            <Paper>
              <Tabs value={tab} onChange={(e, v) => setTab(v)}>
                <Tab label="Analytics" />
                <Tab label="Pending Users" />
              </Tabs>

              <Box sx={{ p: 2 }}>
                {tab === 0 && (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          Department-wise Placement
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={departmentData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="placed" fill="#8884d8" name="Placed" />
                            <Bar dataKey="total" fill="#82ca9d" name="Total" />
                          </BarChart>
                        </ResponsiveContainer>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          Placement Statistics
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Placed', value: stats.placed_students || 0 },
                                {
                                  name: 'Not Placed',
                                  value: (stats.total_students || 0) - (stats.placed_students || 0),
                                },
                              ]}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {[
                                { name: 'Placed', value: stats.placed_students || 0 },
                                {
                                  name: 'Not Placed',
                                  value: (stats.total_students || 0) - (stats.placed_students || 0),
                                },
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </Paper>
                    </Grid>
                  </Grid>
                )}

                {tab === 1 && (
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
    </Box>
  );
}

export default ManagementDashboard;

