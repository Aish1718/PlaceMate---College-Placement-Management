import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Allow superusers (admins) to bypass approval check
  if (!user.is_superuser && !user.is_approved) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Account Pending Approval</h2>
        <p>Your account is pending approval from the administrator.</p>
      </div>
    );
  }

  return <>{children}</>;
}

export default PrivateRoute;

