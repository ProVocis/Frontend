import React, { useState } from 'react';
import { PieChart } from 'react-minimal-pie-chart';
import LeftSidebar from './LeftSidebar';
import './Analytics.css';

const Analytics = () => {
  const [selectedUserCount, setSelectedUserCount] = useState(100);

  const analyticsData = {
    monthlySubscriptionPrice: 4.99,
    activeSubscribers: 8420,
    revenue: {
      monthly: 42015.80,
      annual: 504189.60,
      growth: '+23%'
    },
    recurringRevenue: {
      value: 38500.20,
      growth: '+18%'
    },
    profits: {
      value: 31520.40,
      margin: '75%',
      growth: '+15%'
    }
  };

  const calculateRevenue = (totalUsers) => {
    const freeUsers = Math.floor(totalUsers * 0.9);
    const premiumUsers = Math.floor(totalUsers * 0.1);
    const adRevenue = freeUsers * 1.50;
    const premiumRevenue = premiumUsers * 4.99;
    const monthlyRevenue = adRevenue + premiumRevenue;
    const yearlyRevenue = monthlyRevenue * 12;

    return {
      freeUsers,
      premiumUsers,
      adRevenue,
      premiumRevenue,
      monthlyRevenue,
      yearlyRevenue
    };
  };

  const userPresets = [
    100, 500, 1000, 2500, 5000, 10000, 15000, 20000, 25000, 30000, 40000
  ];

  return (
    <div className="dashboard-layout">
      <LeftSidebar />
      
      <div className="main-content">
        <div className="analytics-content">
          <div className="welcome-header">
            <h1>Financial Analytics</h1>
          </div>

          <div className="analytics-overview">
            <div className="metrics-container">
              <div className="metric-card">
                <div className="metric-header">
                  <h3>Monthly Revenue</h3>
                  <span className="percentage positive">{analyticsData.revenue.growth}</span>
                </div>
                <div className="pie-chart-container">
                  <PieChart
                    data={[
                      { title: 'Revenue', value: analyticsData.revenue.monthly, color: '#4F46E5' },
                      { title: 'Other', value: 100000 - analyticsData.revenue.monthly, color: '#e0dcf5' }
                    ]}
                    lineWidth={20}
                    paddingAngle={2}
                    rounded
                    label={({ dataEntry }) => 
                      `${Math.round(dataEntry.percentage)}%`
                    }
                    labelStyle={{
                      fontSize: '8px',
                      fontFamily: 'sans-serif',
                      fill: '#fff'
                    }}
                  />
                </div>
                <div className="metric-value">
                  ${analyticsData.revenue.monthly.toLocaleString()}
                </div>
                <div className="metric-subtitle">
                  From {analyticsData.activeSubscribers.toLocaleString()} subscribers
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <h3>Recurring Revenue</h3>
                  <span className="percentage positive">{analyticsData.recurringRevenue.growth}</span>
                </div>
                <div className="pie-chart-container">
                  <PieChart
                    data={[
                      { title: 'Recurring', value: analyticsData.recurringRevenue.value, color: '#34D399' },
                      { title: 'Other', value: 100000 - analyticsData.recurringRevenue.value, color: '#e0dcf5' }
                    ]}
                    lineWidth={20}
                    paddingAngle={2}
                    rounded
                    label={({ dataEntry }) => 
                      `${Math.round(dataEntry.percentage)}%`
                    }
                    labelStyle={{
                      fontSize: '8px',
                      fontFamily: 'sans-serif',
                      fill: '#fff'
                    }}
                  />
                </div>
                <div className="metric-value">
                  ${analyticsData.recurringRevenue.value.toLocaleString()}
                </div>
                <div className="metric-subtitle">
                  Monthly recurring revenue (MRR)
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <h3>Net Profit</h3>
                  <span className="percentage positive">{analyticsData.profits.growth}</span>
                </div>
                <div className="pie-chart-container">
                  <PieChart
                    data={[
                      { title: 'Profit', value: analyticsData.profits.value, color: '#FFB020' },
                      { title: 'Other', value: 100000 - analyticsData.profits.value, color: '#e0dcf5' }
                    ]}
                    lineWidth={20}
                    paddingAngle={2}
                    rounded
                    label={({ dataEntry }) => 
                      `${Math.round(dataEntry.percentage)}%`
                    }
                    labelStyle={{
                      fontSize: '8px',
                      fontFamily: 'sans-serif',
                      fill: '#fff'
                    }}
                  />
                </div>
                <div className="metric-value">
                  ${analyticsData.profits.value.toLocaleString()}
                </div>
                <div className="metric-subtitle">
                  Profit margin: {analyticsData.profits.margin}
                </div>
              </div>
            </div>

            <div className="analytics-cards">
              <div className="analytics-card calculator">
                <div className="card-header">
                  <h3>Revenue Calculator</h3>
                </div>
                <div className="card-content">
                  <div className="calculator-controls">
                    <div className="control-group">
                      <label>Select User Base</label>
                      <div className="preset-buttons">
                        {userPresets.map(count => (
                          <button
                            key={count}
                            className={`preset-button ${selectedUserCount === count ? 'active' : ''}`}
                            onClick={() => setSelectedUserCount(count)}
                          >
                            {count.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="revenue-breakdown">
                      <div className="breakdown-section">
                        <h4>Revenue Breakdown</h4>
                        <div className="breakdown-items">
                          <div className="breakdown-item">
                            <div className="item-header">
                              <span>Free Users ({calculateRevenue(selectedUserCount).freeUsers.toLocaleString()})</span>
                              <span>${(calculateRevenue(selectedUserCount).adRevenue).toLocaleString()}</span>
                            </div>
                            <div className="progress-bar">
                              <div 
                                className="progress free" 
                                style={{ width: '90%' }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="breakdown-item">
                            <div className="item-header">
                              <span>Premium Users ({calculateRevenue(selectedUserCount).premiumUsers.toLocaleString()})</span>
                              <span>${(calculateRevenue(selectedUserCount).premiumRevenue).toLocaleString()}</span>
                            </div>
                            <div className="progress-bar">
                              <div 
                                className="progress premium" 
                                style={{ width: '10%' }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="total-section">
                        <div className="total-row">
                          <span>Monthly Revenue</span>
                          <span className="total-amount">
                            ${calculateRevenue(selectedUserCount).monthlyRevenue.toLocaleString()}
                          </span>
                        </div>
                        <div className="total-row">
                          <span>Annual Projection</span>
                          <span className="total-amount highlight">
                            ${calculateRevenue(selectedUserCount).yearlyRevenue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 