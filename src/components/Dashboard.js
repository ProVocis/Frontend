import React, { useState, useEffect } from 'react';
import LeftSidebar from './LeftSidebar';
import './Dashboard.css';
import logo from '../assets/provocis-webheaderlogo.png';
import defaultAvatar from '../assets/MALE.jpeg';
import { API_URL } from '../config';

const AddMeetingModal = ({ isOpen, onClose, onSubmit, teamMembers }) => {
  const [meetingData, setMeetingData] = useState({
    title: '',
    date: '',
    time: '',
    participants: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting meeting data:', meetingData);
    
    try {
      await onSubmit(meetingData);
      setMeetingData({ title: '', date: '', time: '', participants: [] });
      onClose();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Schedule New Meeting</h2>
          <button className="close-modal" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Meeting Title</label>
            <input
              type="text"
              value={meetingData.title}
              onChange={(e) => setMeetingData({...meetingData, title: e.target.value})}
              placeholder="Enter meeting title"
              required
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={meetingData.date}
              onChange={(e) => setMeetingData({...meetingData, date: e.target.value})}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          <div className="form-group">
            <label>Time</label>
            <input
              type="time"
              value={meetingData.time}
              onChange={(e) => setMeetingData({...meetingData, time: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Participants</label>
            <div className="participants-select">
              {teamMembers.map(member => (
                <label key={member.id} className="participant-checkbox">
                  <input
                    type="checkbox"
                    checked={meetingData.participants.includes(member.name)}
                    onChange={(e) => {
                      const participants = e.target.checked
                        ? [...meetingData.participants, member.name]
                        : meetingData.participants.filter(p => p !== member.name);
                      setMeetingData({...meetingData, participants});
                    }}
                  />
                  <span className="participant-name">{member.name}</span>
                  <span className="participant-role">({member.role})</span>
                </label>
              ))}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-button">Schedule Meeting</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meetings, setMeetings] = useState([]);
  const [error, setError] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);

  const fetchTeamStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Using token:', token);

      if (!token) {
        console.error('No token found');
        return;
      }

      // Ensure token has Bearer prefix
      const tokenToUse = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const response = await fetch(`${API_URL}/api/users/status`, {
        headers: {
          'Authorization': tokenToUse
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Raw team data:', data);

      const updatedMembers = data.map(user => ({
        id: user._id,
        name: user.fullName,
        role: user.role,
        avatar: defaultAvatar,
        isOnline: user.isOnline,
        lastActive: user.lastActive || user.lastLogin
      }));

      console.log('Processed members:', updatedMembers);
      setTeamMembers(updatedMembers);

    } catch (error) {
      console.error('Error fetching team status:', error);
    }
  };

  const updateActiveStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      // Ensure token has Bearer prefix
      const tokenToUse = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      await fetch(`${API_URL}/api/users/active`, {
        method: 'POST',
        headers: {
          'Authorization': tokenToUse
        }
      });
    } catch (error) {
      console.error('Error updating active status:', error);
    }
  };

  useEffect(() => {
    fetchTeamStatus();
    const interval = setInterval(fetchTeamStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    updateActiveStatus();
    const activeInterval = setInterval(updateActiveStatus, 60000);
    return () => clearInterval(activeInterval);
  }, []);

  const formatLastActive = (lastActive) => {
    if (!lastActive) return 'Never';
    
    const now = new Date();
    const activeDate = new Date(lastActive);
    const diffInMinutes = Math.floor((now - activeDate) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    
    return activeDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const removeExpiredMeetings = () => {
    const now = new Date();
    const updatedMeetings = meetings.filter(meeting => {
      const meetingDateTime = new Date(`${meeting.date} ${meeting.time}`);
      return meetingDateTime > now;
    });
    
    if (updatedMeetings.length !== meetings.length) {
      setMeetings(updatedMeetings);
    }
  };

  useEffect(() => {
    // Check immediately when component mounts
    removeExpiredMeetings();

    // Check every minute
    const interval = setInterval(removeExpiredMeetings, 60000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [meetings]);

  useEffect(() => {
    // Initial fetch
    fetchMeetings();

    // Set up interval to fetch meetings every minute
    const interval = setInterval(() => {
      fetchMeetings();
    }, 60000); // 60000 ms = 1 minute

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/meetings`, {
        headers: {
          'Authorization': token
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch meetings');
      }

      const data = await response.json();
      console.log('Fetched meetings:', data);

      // Filter out past meetings
      const now = new Date();
      const upcomingMeetings = data.filter(meeting => {
        const meetingDate = new Date(`${meeting.date} ${meeting.time}`);
        return meetingDate > now;
      });

      // Sort by date and time
      upcomingMeetings.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateA - dateB;
      });

      // Format the meetings for display
      const formattedMeetings = upcomingMeetings.map(meeting => ({
        id: meeting._id,
        title: meeting.title,
        time: meeting.time,
        date: meeting.date,
        displayDate: new Date(meeting.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        participants: meeting.participants
      }));

      setMeetings(formattedMeetings);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setError('Failed to load meetings');
    }
  };

  const handleAddMeeting = async (meetingData) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token);
      console.log('Sending meeting data:', meetingData);

      const response = await fetch(`${API_URL}/api/meetings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(meetingData)
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(`Failed to add meeting: ${responseData.error || 'Unknown error'}`);
      }

      // Refresh meetings list
      await fetchMeetings();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding meeting:', error);
      setError('Failed to add meeting');
    }
  };

  const handleJoinMeeting = () => {
    window.open('https://discord.gg/ZAF25SpNVd', '_blank');
  };

  const getFirstName = () => {
    try {
      const userStr = localStorage.getItem('user');
      console.log('User data from localStorage:', userStr);
      
      if (!userStr) {
        console.log('No user data found in localStorage');
        return 'User';
      }
      
      const user = JSON.parse(userStr);
      console.log('Parsed user data:', user);
      
      // Try different properties in order of preference
      const firstName = user.firstName || 
                       (user.fullName ? user.fullName.split(' ')[0] : null) ||
                       user.username ||
                       'User';
                       
      console.log('Resolved firstName:', firstName);
      return firstName;
    } catch (error) {
      console.error('Error getting user name:', error);
      return 'User';
    }
  };

  // Add number formatting helper
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  useEffect(() => {
    console.log('Team members state updated:', teamMembers);
  }, [teamMembers]);

  return (
    <div className="dashboard-layout">
      <LeftSidebar />
      
      <div className="main-content">
        <div className="dashboard-content">
          <div className="welcome-header">
            <h1>Welcome Back, {getFirstName()}!</h1>
          </div>

          <div className="dashboard-sections">
            <section className="team-section">
              <h2>Team Members ({teamMembers.length})</h2>
              <div className="team-members-grid">
                {teamMembers.map(member => (
                  <div key={member.id} className="team-member-card">
                    <div className="member-avatar-container">
                      <img src={member.avatar} alt={member.name} className="member-avatar" />
                      <div className={`status-badge ${member.isOnline ? 'online' : 'offline'}`}>
                        {member.isOnline ? 'Online' : 'Offline'}
                      </div>
                    </div>
                    <div className="member-info">
                      <h3>{member.name}</h3>
                      <p className="member-role">{member.role}</p>
                      <p className="member-status">
                        {member.isOnline ? (
                          <span className="online-status">
                            <i className="fas fa-circle"></i> Active now
                          </span>
                        ) : (
                          <span className="last-seen">
                            <i className="far fa-clock"></i>
                            {` Last seen ${formatLastActive(member.lastActive)}`}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="meetings-section">
              <div className="meetings-header">
                <h2>Upcoming Meetings</h2>
                <button className="add-meeting-button" onClick={() => setIsModalOpen(true)}>
                  <i className="fas fa-plus"></i>
                  Add Meeting
                </button>
              </div>
              <div className="meetings-list">
                {meetings.map(meeting => (
                  <div key={meeting.id} className="meeting-card">
                    <div className="meeting-time">
                      <div className="time-badge">
                        <span className="time">{meeting.time}</span>
                        <span className="date">{meeting.displayDate}</span>
                      </div>
                    </div>
                    <div className="meeting-details">
                      <h3>{meeting.title}</h3>
                      <div className="participants-list">
                        <i className="fas fa-users"></i>
                        <span>{meeting.participants.join(', ')}</span>
                      </div>
                    </div>
                    <button className="join-meeting-button" onClick={handleJoinMeeting}>
                      <i className="fas fa-video"></i>
                      Join
                    </button>
                  </div>
                ))}
                {meetings.length === 0 && (
                  <div className="no-meetings">
                    <i className="fas fa-calendar-alt"></i>
                    <p>No upcoming meetings scheduled</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
      
      {isModalOpen && (
        <AddMeetingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddMeeting}
          teamMembers={teamMembers}
        />
      )}
    </div>
  );
};

export default Dashboard; 