import React from 'react';
import { useSelector } from 'react-redux';
import './Profile.css';

const EmployeeProfile = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="profile">
      <h1>My Profile</h1>
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2>{user?.name}</h2>
        </div>
        <div className="profile-details">
          <div className="detail-item">
            <label>Employee ID</label>
            <p>{user?.employeeId}</p>
          </div>
          <div className="detail-item">
            <label>Email</label>
            <p>{user?.email}</p>
          </div>
          <div className="detail-item">
            <label>Department</label>
            <p>{user?.department}</p>
          </div>
          <div className="detail-item">
            <label>Role</label>
            <p className="role-badge">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;

