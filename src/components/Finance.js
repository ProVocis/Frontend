import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import LeftSidebar from './LeftSidebar';
import './Finance.css';

const Finance = () => {
  const [selectedUserCount, setSelectedUserCount] = useState(1000);
  const [timeframe, setTimeframe] = useState('monthly');
  const [customUserCount, setCustomUserCount] = useState('');
  const [customPremiumPercent, setCustomPremiumPercent] = useState('10');

  const calculateCustomRevenue = () => {
    if (!customUserCount || !customPremiumPercent) return null;
    
    const users = parseInt(customUserCount);
    const premiumPercent = parseInt(customPremiumPercent);
    
    if (isNaN(users) || isNaN(premiumPercent)) return null;
    
    const premiumUsers = Math.floor(users * (premiumPercent / 100));
    const freeUsers = users - premiumUsers;
    
    const adsRevenue = freeUsers * 1.50;
    const premiumRevenue = premiumUsers * 4.99;
    const totalMonthly = adsRevenue + premiumRevenue;
    
    return {
      users,
      freeUsers,
      premiumUsers,
      adsRevenue,
      premiumRevenue,
      totalMonthly,
      yearly: totalMonthly * 12
    };
  };

  const revenueData = [
    { users: 100, freeUsers: 90, premiumUsers: 10, adsRevenue: 135, premiumRevenue: 49.90, totalMonthly: 184.90, yearly: 2218.80 },
    { users: 500, freeUsers: 450, premiumUsers: 50, adsRevenue: 675, premiumRevenue: 249.50, totalMonthly: 924.50, yearly: 11094.00 },
    { users: 1000, freeUsers: 900, premiumUsers: 100, adsRevenue: 1350, premiumRevenue: 499.00, totalMonthly: 1849.00, yearly: 22188.00 },
    { users: 2500, freeUsers: 2250, premiumUsers: 250, adsRevenue: 3375, premiumRevenue: 1247.50, totalMonthly: 4622.50, yearly: 55470.00 },
    { users: 5000, freeUsers: 4500, premiumUsers: 500, adsRevenue: 6750, premiumRevenue: 2495.00, totalMonthly: 9245.00, yearly: 110940.00 },
    { users: 10000, freeUsers: 9000, premiumUsers: 1000, adsRevenue: 13500, premiumRevenue: 4990.00, totalMonthly: 18490.00, yearly: 221880.00 },
    { users: 15000, freeUsers: 13500, premiumUsers: 1500, adsRevenue: 20250, premiumRevenue: 7485.00, totalMonthly: 27735.00, yearly: 332820.00 }
  ];

  const selectedData = revenueData.find(data => data.users === selectedUserCount) || revenueData[2];
  const customData = calculateCustomRevenue();
  const displayData = customData || selectedData;

  const pieData = [
    { name: 'Ad Revenue', value: displayData.adsRevenue },
    { name: 'Premium Revenue', value: displayData.premiumRevenue }
  ];

  const userDistributionData = [
    { name: 'Free Users', value: displayData.freeUsers },
    { name: 'Premium Users', value: displayData.premiumUsers }
  ];

  const COLORS = ['#6366f1', '#10b981'];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US', {
      notation: "compact",
      compactDisplay: "short",
    }).format(value);
  };

  return (
    <div className="app-container">
      <LeftSidebar />
      <div className="main-content">
        <div className="finance-container">
          <div className="finance-header">
            <h1>Financial Analytics</h1>
            <div className="finance-controls">
              <div className="select-wrapper">
                <label>
                  <i className="fas fa-users"></i>
                  Preset User Base
                </label>
                <select 
                  value={selectedUserCount}
                  onChange={(e) => setSelectedUserCount(Number(e.target.value))}
                >
                  {revenueData.map(data => (
                    <option key={data.users} value={data.users}>
                      {formatNumber(data.users)} Users
                    </option>
                  ))}
                </select>
              </div>
              <div className="select-wrapper">
                <label>
                  <i className="fas fa-clock"></i>
                  Timeframe
                </label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
          </div>

          <div className="metrics-grid">
            <div className="metric-card total-revenue">
              <h3>
                <i className="fas fa-dollar-sign"></i>
                Total Revenue
              </h3>
              <div className="metric-info">
                <span className="metric-label">per {timeframe}</span>
                <span className="metric-value">
                  {timeframe === 'monthly' ? formatCurrency(displayData.totalMonthly) : formatCurrency(displayData.yearly)}
                </span>
              </div>
              <div className="metric-breakdown">
                <div className="breakdown-item">
                  <span>
                    <i className="fas fa-ad"></i>
                    Ad Revenue
                  </span>
                  <span>{formatCurrency(displayData.adsRevenue)}</span>
                </div>
                <div className="breakdown-item">
                  <span>
                    <i className="fas fa-crown"></i>
                    Premium Revenue
                  </span>
                  <span>{formatCurrency(displayData.premiumRevenue)}</span>
                </div>
              </div>
            </div>

            <div className="metric-card user-base">
              <h3>
                <i className="fas fa-users"></i>
                User Base
              </h3>
              <div className="metric-info">
                <span className="metric-label">total users</span>
                <span className="metric-value">{formatNumber(displayData.users)}</span>
              </div>
              <div className="metric-breakdown">
                <div className="breakdown-item">
                  <span>
                    <i className="fas fa-user"></i>
                    Free Users
                  </span>
                  <span>{formatNumber(displayData.freeUsers)}</span>
                </div>
                <div className="breakdown-item">
                  <span>
                    <i className="fas fa-crown"></i>
                    Premium Users
                  </span>
                  <span>{formatNumber(displayData.premiumUsers)}</span>
                </div>
              </div>
            </div>

            <div className="metric-card average-revenue">
              <h3>
                <i className="fas fa-chart-line"></i>
                Average Revenue
              </h3>
              <div className="metric-info">
                <span className="metric-label">per user/month</span>
                <span className="metric-value">
                  {formatCurrency(displayData.totalMonthly / displayData.users)}
                </span>
              </div>
              <div className="metric-breakdown">
                <div className="breakdown-item">
                  <span>
                    <i className="fas fa-user"></i>
                    Free User ARPU
                  </span>
                  <span>{formatCurrency(1.50)}</span>
                </div>
                <div className="breakdown-item">
                  <span>
                    <i className="fas fa-crown"></i>
                    Premium User ARPU
                  </span>
                  <span>{formatCurrency(4.99)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="calculator-section">
            <div className="calculator-header">
              <h2>Revenue Calculator</h2>
            </div>
            <div className="calculator-grid">
              <div className="calculator-input">
                <label>
                  <i className="fas fa-users"></i>
                  Custom User Count
                </label>
                <input
                  type="number"
                  value={customUserCount}
                  onChange={(e) => setCustomUserCount(e.target.value)}
                  placeholder="Enter number of users"
                />
              </div>
              <div className="calculator-input">
                <label>
                  <i className="fas fa-percentage"></i>
                  Premium Users (%)
                </label>
                <input
                  type="number"
                  value={customPremiumPercent}
                  onChange={(e) => setCustomPremiumPercent(e.target.value)}
                  placeholder="Enter premium percentage"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            {customData && (
              <div className="calculator-results">
                <div className="breakdown-item">
                  <span>
                    <i className="fas fa-calendar-alt"></i>
                    Monthly Revenue
                  </span>
                  <span>{formatCurrency(customData.totalMonthly)}</span>
                </div>
                <div className="breakdown-item">
                  <span>
                    <i className="fas fa-calendar"></i>
                    Yearly Revenue
                  </span>
                  <span>{formatCurrency(customData.yearly)}</span>
                </div>
                <div className="breakdown-item">
                  <span>
                    <i className="fas fa-ad"></i>
                    Ad Revenue
                  </span>
                  <span>{formatCurrency(customData.adsRevenue)}</span>
                </div>
                <div className="breakdown-item">
                  <span>
                    <i className="fas fa-crown"></i>
                    Premium Revenue
                  </span>
                  <span>{formatCurrency(customData.premiumRevenue)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="charts-grid">
            <div className="chart-card revenue-growth">
              <h3>Revenue Growth Projection</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis 
                      dataKey="users" 
                      tickFormatter={formatNumber}
                      label={{ value: 'Total Users', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value)}
                      label={{ value: 'Revenue', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      labelFormatter={(value) => `${formatNumber(value)} Users`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey={timeframe === 'monthly' ? 'totalMonthly' : 'yearly'} 
                      name={timeframe === 'monthly' ? 'Monthly Revenue' : 'Yearly Revenue'}
                      stroke="#6366f1" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card revenue-split">
              <h3>Revenue Distribution</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card user-distribution">
              <h3>User Distribution</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {userDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatNumber(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card revenue-comparison">
              <h3>Revenue Comparison</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis 
                      dataKey="users" 
                      tickFormatter={formatNumber}
                      label={{ value: 'Total Users', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value)}
                      label={{ value: 'Revenue', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      labelFormatter={(value) => `${formatNumber(value)} Users`}
                    />
                    <Legend />
                    <Bar dataKey="adsRevenue" name="Ad Revenue" fill="#6366f1" />
                    <Bar dataKey="premiumRevenue" name="Premium Revenue" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finance; 