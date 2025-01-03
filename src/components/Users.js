import React, { useState, useEffect } from 'react';
import LeftSidebar from './LeftSidebar';
import './Users.css';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

// Add these custom tooltip components
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`${payload[0].name}: ${payload[0].value}%`}</p>
        {payload[0].payload.details && (
          <div className="tooltip-details">
            {payload[0].payload.details.slice(0, 3).map((detail, index) => (
              <p key={index}>{`${detail.role}: ${detail.users.toLocaleString()} users`}</p>
            ))}
            {payload[0].payload.details.length > 3 && (
              <p className="more">+{payload[0].payload.details.length - 3} more...</p>
            )}
          </div>
        )}
      </div>
    );
  }
  return null;
};

const CustomFeatureTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip">
        <p className="label">{data.feature}</p>
        <p className="total">Total Users: {data.users.toLocaleString()}</p>
        <div className="tooltip-details">
          {Object.entries(data.breakdown)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([key, value], index) => (
              <p key={index}>
                {`${key}: ${value.toLocaleString()} users (${((value/data.users)*100).toFixed(1)}%)`}
              </p>
            ))}
        </div>
      </div>
    );
  }
  return null;
};

const Users = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    newToday: 0,
    newThisWeek: 0,
    newThisMonth: 0
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    status: 'all',
    subscription: 'all',
    sortBy: 'date'
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const currentUser = localStorage.getItem('username');
  const isAdmin = currentUser === 'Nishanthdhina';

  // Mock data - replace with actual API calls
  const mockUsers = [
    {
      id: 1,
      username: 'Nishanth Dhinakar',
      email: 'nishanth@example.com',
      registrationDate: '2024-01-15',
      lastActive: '2024-03-20',
      subscription: 'premium',
      status: 'active',
      location: 'India',
      industry: 'Technology',
      wordsLearned: 250,
      streak: 15,
      points: 1200
    },
    {
      id: 2,
      username: 'Alexandru Barza',
      email: 'alex@example.com',
      registrationDate: '2024-02-01',
      lastActive: '2024-03-21',
      subscription: 'premium',
      status: 'active',
      location: 'Romania',
      industry: 'Technology',
      wordsLearned: 180,
      streak: 10,
      points: 950
    },
    {
      id: 3,
      username: 'Akshanan Mayuran',
      email: 'akshanan@example.com',
      registrationDate: '2024-02-15',
      lastActive: '2024-03-19',
      subscription: 'basic',
      status: 'active',
      location: 'Sri Lanka',
      industry: 'Finance',
      wordsLearned: 120,
      streak: 8,
      points: 720
    },
    {
      id: 4,
      username: 'Caleb Grobler',
      email: 'caleb@example.com',
      registrationDate: '2024-03-01',
      lastActive: '2024-03-21',
      subscription: 'basic',
      status: 'active',
      location: 'South Africa',
      industry: 'Design',
      wordsLearned: 90,
      streak: 5,
      points: 450
    }
  ];

  const growthData = [
    { month: 'Jan', users: 100 },
    { month: 'Feb', users: 150 },
    { month: 'Mar', users: 180 },
    // Add more data...
  ];

  const industryData = [
    { name: 'Healthcare', value: 28 },
    { name: 'Technology', value: 22 },
    { name: 'Business', value: 18 },
    { name: 'Education', value: 12 },
    { name: 'Legal', value: 8 },
    { name: 'Trades', value: 7 },
    { name: 'Creative', value: 5 }
  ];

  const engagementData = [
    { 
      feature: 'Industry Terms',
      users: 3850,
      breakdown: {
        healthcare: 1420,
        technology: 980,
        business: 680,
        education: 420,
        legal: 350
      }
    },
    { 
      feature: 'Professional Communication',
      users: 3200,
      breakdown: {
        email: 1200,
        meetings: 980,
        presentations: 620,
        reports: 400
      }
    },
    { 
      feature: 'Technical Vocabulary',
      users: 2800,
      breakdown: {
        medical: 980,
        IT: 820,
        engineering: 580,
        legal: 420
      }
    },
    { 
      feature: 'Daily Workplace Phrases',
      users: 2400,
      breakdown: {
        office: 980,
        customer_service: 620,
        management: 480,
        teamwork: 320
      }
    }
  ];

  const COLORS = ['#ab9ff2', '#9384d1', '#6f5b9c', '#3c315b'];

  const downloadStats = {
    total: 15420,
    thisMonth: 2840,
    lastMonth: 2100,
    growth: 35.2,
    platforms: {
      android: 8750,
      ios: 6670
    },
    regions: [
      { name: 'North America', downloads: 4500 },
      { name: 'Europe', downloads: 3800 },
      { name: 'Asia', downloads: 4200 },
      { name: 'Others', downloads: 2920 }
    ]
  };

  const retentionData = [
    { day: '1', rate: 100 },
    { day: '7', rate: 68 },
    { day: '14', rate: 45 },
    { day: '30', rate: 32 },
    { day: '60', rate: 28 },
    { day: '90', rate: 25 }
  ];

  const userBehavior = {
    avgSessionDuration: '18:45',
    avgWordsLearned: 12,
    mostActiveHours: '18:00 - 22:00',
    completionRate: 76,
    dailyActiveUsers: 3240,
    monthlyActiveUsers: 12800,
    avgSessionsPerUser: 4.2,
    avgTimeSpentPerDay: '45:20',
    practiceCompletion: 82,
    quizAccuracy: 78,
    pronunciationAttempts: 156,
    vocabularyGrowth: '+320',
    featureUsage: [
      { feature: 'Word Practice', usage: 85 },
      { feature: 'Pronunciation', usage: 72 },
      { feature: 'Quizzes', usage: 68 },
      { feature: 'Industry Terms', usage: 55 }
    ]
  };

  useEffect(() => {
    // Fetch users and stats
    setUsers(mockUsers);
    calculateStats();
  }, []);

  const calculateStats = () => {
    // Calculate user statistics
    setUserStats({
      total: mockUsers.length,
      active: mockUsers.filter(u => u.status === 'active').length,
      inactive: mockUsers.filter(u => u.status === 'inactive').length,
      newToday: 5,
      newThisWeek: 20,
      newThisMonth: 75
    });
  };

  const handleUserAction = (userId, action, data) => {
    switch (action) {
      case 'ban':
        // Implement ban logic
        break;
      case 'message':
        // Implement messaging logic
        break;
      case 'edit':
        setSelectedUser(users.find(u => u.id === userId));
        setIsModalOpen(true);
        break;
      default:
        break;
    }
  };

  const handleDeleteUser = (userId) => {
    if (!isAdmin) {
      alert('Only admin can delete users');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
      // Add notification
      addNotification('User has been deleted successfully', 'success');
    }
  };

  const handleUpdateUser = (userId, updatedData) => {
    if (!isAdmin) {
      alert('Only admin can modify user data');
      return;
    }
    
    setUsers(users.map(user => 
      user.id === userId ? { ...user, ...updatedData } : user
    ));
    setIsModalOpen(false);
    addNotification('User data updated successfully', 'success');
  };

  return (
    <div className="dashboard-layout">
      <LeftSidebar />
      
      <div className="main-content">
        <div className="users-container">
          <div className="users-header">
            <h1>User Management</h1>
            <div className="tab-navigation">
              <button 
                className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
                onClick={() => setActiveTab('list')}
              >
                User List
              </button>
              <button 
                className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`}
                onClick={() => setActiveTab('insights')}
              >
                Insights
              </button>
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="overview-section">
              <div className="quick-stats-grid">
                <div className="stat-card total-users">
                  <div className="stat-icon">
                    <i className="fas fa-users"></i>
                  </div>
                  <div className="stat-content">
                    <h3>Total Users</h3>
                    <p className="stat-number">{userStats.total}</p>
                    <span className="stat-trend positive">
                      <i className="fas fa-arrow-up"></i> 12% this month
                    </span>
                  </div>
                </div>

                <div className="stat-card active-users">
                  <div className="stat-icon">
                    <i className="fas fa-user-check"></i>
                  </div>
                  <div className="stat-content">
                    <h3>Active Users</h3>
                    <p className="stat-number">{userStats.active}</p>
                    <span className="stat-trend positive">
                      <i className="fas fa-arrow-up"></i> Active rate: {((userStats.active / userStats.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="stat-card new-users">
                  <div className="stat-icon">
                    <i className="fas fa-user-plus"></i>
                  </div>
                  <div className="stat-content">
                    <h3>New Users</h3>
                    <p className="stat-number">{userStats.newThisMonth}</p>
                    <div className="new-user-breakdown">
                      <span>Today: {userStats.newToday}</span>
                      <span>This Week: {userStats.newThisWeek}</span>
                    </div>
                  </div>
                </div>

                <div className="stat-card inactive-users">
                  <div className="stat-icon">
                    <i className="fas fa-user-clock"></i>
                  </div>
                  <div className="stat-content">
                    <h3>Inactive Users</h3>
                    <p className="stat-number">{userStats.inactive}</p>
                    <span className="stat-trend neutral">
                      Inactive rate: {((userStats.inactive / userStats.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="management-section">
                <div className="quick-actions-card">
                  <h3>Quick Actions</h3>
                  <div className="action-buttons">
                    <button className="action-btn add-user">
                      <i className="fas fa-user-plus"></i>
                      Add New User
                    </button>
                    <button className="action-btn bulk-edit">
                      <i className="fas fa-users-cog"></i>
                      Bulk Edit
                    </button>
                    <button className="action-btn export-data">
                      <i className="fas fa-file-export"></i>
                      Export Users
                    </button>
                    <button className="action-btn send-notification">
                      <i className="fas fa-bell"></i>
                      Send Notification
                    </button>
                  </div>
                </div>

                <div className="recent-activity-card">
                  <h3>Recent Activity</h3>
                  <div className="activity-list">
                    <div className="activity-item">
                      <div className="activity-icon user-registered">
                        <i className="fas fa-user-plus"></i>
                      </div>
                      <div className="activity-details">
                        <p>New user registered</p>
                        <span className="activity-meta">John Doe • 2 hours ago</span>
                      </div>
                    </div>
                    <div className="activity-item">
                      <div className="activity-icon user-upgraded">
                        <i className="fas fa-arrow-up"></i>
                      </div>
                      <div className="activity-details">
                        <p>User upgraded to Premium</p>
                        <span className="activity-meta">Alice Smith • 5 hours ago</span>
                      </div>
                    </div>
                    <div className="activity-item">
                      <div className="activity-icon user-deactivated">
                        <i className="fas fa-user-slash"></i>
                      </div>
                      <div className="activity-details">
                        <p>Account deactivated</p>
                        <span className="activity-meta">Bob Wilson • 1 day ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="user-trends-section">
                <div className="trends-card">
                  <h3>User Growth Trend</h3>
                  <div className="chart-container">
                    <LineChart width={600} height={300} data={growthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(171, 159, 242, 0.1)" />
                      <XAxis dataKey="month" stroke="#6f5b9c" />
                      <YAxis stroke="#6f5b9c" />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="users" 
                        stroke="#ab9ff2" 
                        strokeWidth={3}
                        dot={{ fill: '#ab9ff2', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </div>
                </div>

                <div className="role-distribution-card">
                  <h3>Role Distribution</h3>
                  <div className="role-stats">
                    <div className="role-item">
                      <span className="role-label">Administrators</span>
                      <div className="role-bar">
                        <div className="role-progress" style={{ width: '15%' }}></div>
                      </div>
                      <span className="role-count">3</span>
                    </div>
                    <div className="role-item">
                      <span className="role-label">Moderators</span>
                      <div className="role-bar">
                        <div className="role-progress" style={{ width: '25%' }}></div>
                      </div>
                      <span className="role-count">5</span>
                    </div>
                    <div className="role-item">
                      <span className="role-label">Regular Users</span>
                      <div className="role-bar">
                        <div className="role-progress" style={{ width: '60%' }}></div>
                      </div>
                      <span className="role-count">12</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'list' && (
            <div className="users-list-section">
              <div className="search-bar">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Subscription</th>
                      <th>Last Active</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter(user => 
                        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(user => (
                        <tr key={user.id}>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`status-badge ${user.status}`}>
                              {user.status}
                            </span>
                          </td>
                          <td>{user.subscription}</td>
                          <td>{user.lastActive}</td>
                          <td className="actions-cell">
                            {isAdmin && (
                              <>
                                <button 
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsModalOpen(true);
                                  }}
                                  className="edit-button"
                                  title="Edit user"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="delete-button"
                                  title="Delete user"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </>
                            )}
                            <button 
                              onClick={() => handleUserAction(user.id, 'message')}
                              className="message-button"
                              title="Message user"
                            >
                              <i className="fas fa-envelope"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="insights-section">
              <div className="insights-overview">
                <div className="insight-card main-metrics">
                  <h3>Key Performance Metrics</h3>
                  <div className="metrics-grid">
                    <div className="metric-item">
                      <i className="fas fa-users"></i>
                      <div className="metric-content">
                        <span className="metric-value">{userBehavior.monthlyActiveUsers.toLocaleString()}</span>
                        <span className="metric-label">Monthly Active Users</span>
                      </div>
                    </div>
                    <div className="metric-item">
                      <i className="fas fa-clock"></i>
                      <div className="metric-content">
                        <span className="metric-value">{userBehavior.avgTimeSpentPerDay}</span>
                        <span className="metric-label">Avg. Daily Time</span>
                      </div>
                    </div>
                    <div className="metric-item">
                      <i className="fas fa-graduation-cap"></i>
                      <div className="metric-content">
                        <span className="metric-value">{userBehavior.quizAccuracy}%</span>
                        <span className="metric-label">Quiz Accuracy</span>
                      </div>
                    </div>
                    <div className="metric-item">
                      <i className="fas fa-chart-line"></i>
                      <div className="metric-content">
                        <span className="metric-value">{userBehavior.vocabularyGrowth}</span>
                        <span className="metric-label">Vocabulary Growth</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="insights-grid">
                <div className="insight-card industry-analysis">
                  <div className="card-header">
                    <h3>Industry Distribution</h3>
                  </div>
                  <div className="industry-content">
                    <div className="chart-container">
                      <PieChart width={600} height={400}>
                        <Pie
                          data={industryData}
                          cx={300}
                          cy={200}
                          innerRadius={80}
                          outerRadius={140}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value, cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = outerRadius + 25;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);

                            return (
                              <text
                                x={x}
                                y={y}
                                fill="#3c315b"
                                textAnchor={x > cx ? 'start' : 'end'}
                                dominantBaseline="central"
                                fontSize="13"
                                fontWeight="500"
                              >
                                {`${name} (${value}%)`}
                              </text>
                            );
                          }}
                        >
                          {industryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </div>
                  </div>
                </div>

                <div className="insight-card retention-analysis">
                  <div className="card-header">
                    <h3>User Retention</h3>
                    <div className="retention-summary">
                      <div className="summary-item positive">
                        <span className="summary-label">30-Day</span>
                        <span className="summary-value">85%</span>
                      </div>
                      <div className="summary-item neutral">
                        <span className="summary-label">60-Day</span>
                        <span className="summary-value">72%</span>
                      </div>
                      <div className="summary-item warning">
                        <span className="summary-label">90-Day</span>
                        <span className="summary-value">68%</span>
                      </div>
                    </div>
                  </div>
                  <div className="retention-content">
                    <div className="chart-wrapper">
                      <LineChart width={600} height={300} data={retentionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(171, 159, 242, 0.1)" />
                        <XAxis dataKey="day" stroke="#6f5b9c" />
                        <YAxis stroke="#6f5b9c" />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="rate" 
                          stroke="#ab9ff2" 
                          strokeWidth={3}
                          dot={{ fill: '#ab9ff2', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </div>
                  </div>
                </div>

                <div className="insight-card feature-analysis">
                  <div className="card-header">
                    <h3>Feature Usage Analytics</h3>
                    <div className="time-selector">
                      <button className="time-btn active">Week</button>
                      <button className="time-btn">Month</button>
                      <button className="time-btn">Quarter</button>
                    </div>
                  </div>
                  
                  <div className="feature-content">
                    <div className="feature-overview">
                      <div className="feature-highlights">
                        <div className="highlight-card">
                          <div className="highlight-icon">
                            <i className="fas fa-star"></i>
                          </div>
                          <div className="highlight-info">
                            <h4>Most Used Feature</h4>
                            <p>Industry Terms</p>
                            <span className="highlight-stat">3,850 users</span>
                          </div>
                        </div>
                        <div className="highlight-card">
                          <div className="highlight-icon">
                            <i className="fas fa-chart-line"></i>
                          </div>
                          <div className="highlight-info">
                            <h4>Fastest Growing</h4>
                            <p>Technical Vocabulary</p>
                            <span className="highlight-stat">+45% this month</span>
                          </div>
                        </div>
                        <div className="highlight-card">
                          <div className="highlight-icon">
                            <i className="fas fa-clock"></i>
                          </div>
                          <div className="highlight-info">
                            <h4>Avg. Time per Feature</h4>
                            <p>18 minutes</p>
                            <span className="highlight-stat">+5min vs last month</span>
                          </div>
                        </div>
                      </div>

                      <div className="feature-chart-container">
                        <BarChart 
                          width={800} 
                          height={300} 
                          data={engagementData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(171, 159, 242, 0.1)" />
                          <XAxis 
                            dataKey="feature" 
                            stroke="#6f5b9c"
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            stroke="#6f5b9c"
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip content={<CustomFeatureTooltip />} />
                          <Bar 
                            dataKey="users" 
                            fill="url(#colorGradient)" 
                            radius={[4, 4, 0, 0]}
                          />
                          <defs>
                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#ab9ff2" />
                              <stop offset="100%" stopColor="#9384d1" />
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </div>

                      <div className="feature-details-grid">
                        {engagementData.map((feature, index) => (
                          <div key={index} className="feature-detail-card">
                            <div className="feature-detail-header">
                              <h4>{feature.feature}</h4>
                              <span className="total-users">{feature.users.toLocaleString()} users</span>
                            </div>
                            <div className="feature-metrics">
                              {Object.entries(feature.breakdown)
                                .sort(([,a], [,b]) => b - a)
                                .map(([key, value], idx) => (
                                  <div key={idx} className="metric-row">
                                    <div className="metric-label">
                                      <span className="dot"></span>
                                      <span>{key}</span>
                                    </div>
                                    <div className="metric-bar-container">
                                      <div 
                                        className="metric-bar"
                                        style={{ width: `${(value/feature.users)*100}%` }}
                                      >
                                        <span className="metric-value">{value.toLocaleString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                            <div className="feature-footer">
                              <div className="trend positive">
                                <i className="fas fa-arrow-up"></i>
                                <span>12% vs last month</span>
                              </div>
                              <button className="details-btn">
                                <i className="fas fa-chart-pie"></i>
                                Details
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Edit Modal */}
      {isModalOpen && selectedUser && isAdmin && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit User</h2>
              <button className="close-modal" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateUser(selectedUser.id, selectedUser);
            }}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={selectedUser.username}
                  onChange={(e) => setSelectedUser({
                    ...selectedUser,
                    username: e.target.value
                  })}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({
                    ...selectedUser,
                    email: e.target.value
                  })}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={selectedUser.status}
                  onChange={(e) => setSelectedUser({
                    ...selectedUser,
                    status: e.target.value
                  })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="form-group">
                <label>Subscription</label>
                <select
                  value={selectedUser.subscription}
                  onChange={(e) => setSelectedUser({
                    ...selectedUser,
                    subscription: e.target.value
                  })}
                >
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-button">
                  Save Changes
                </button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users; 