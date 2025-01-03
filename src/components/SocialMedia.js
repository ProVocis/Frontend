import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LeftSidebar from './LeftSidebar';
import './SocialMedia.css';
import { API_URL } from '../config';

const SocialMedia = () => {
  const [socialData, setSocialData] = useState({
    followers: {
      linkedin: 0,
      instagram: 0,
      twitter: 0,
      tiktok: 0
    },
    posts: {
      instagram: 0,
      tiktok: 0
    },
    engagement: {
      linkedin: 0,
      instagram: 0,
      twitter: 0,
      tiktok: 0
    },
    growth: {
      linkedin: 0,
      instagram: 0,
      twitter: 0,
      tiktok: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSocialData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${API_URL}/api/social/stats`, {
          headers: {
            'Authorization': token
          }
        });

        if (response.status === 401) {
          navigate('/login');
          return;
        }

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        setSocialData(data);
      } catch (error) {
        console.error('Error fetching social data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSocialData();
  }, [navigate]);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const renderSocialCard = (platform) => {
    const followers = socialData.followers[platform];
    const posts = socialData.posts[platform];
    const engagement = socialData.engagement[platform];
    const growth = socialData.growth[platform];

    return (
      <div className={`social-card ${platform}`}>
        <div className="platform-header">
          <i className={`fab fa-${platform}`}></i>
          <h3>{platform.charAt(0).toUpperCase() + platform.slice(1)}</h3>
        </div>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Followers</span>
            <span className="stat-value">{formatNumber(followers)}</span>
          </div>
          {posts !== undefined && (
            <div className="stat-item">
              <span className="stat-label">Posts</span>
              <span className="stat-value">{formatNumber(posts)}</span>
            </div>
          )}
          {engagement > 0 && (
            <div className="stat-item">
              <span className="stat-label">Engagement</span>
              <span className="stat-value">{engagement}%</span>
            </div>
          )}
          {growth !== 0 && (
            <div className="stat-item">
              <span className="stat-label">Growth</span>
              <span className={`stat-value ${growth > 0 ? 'positive' : 'negative'}`}>
                {growth > 0 ? '+' : ''}{growth}%
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="dashboard-layout">
        <LeftSidebar />
        <div className="main-content">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-layout">
        <LeftSidebar />
        <div className="main-content">
          <div className="error-message">
            Error loading social media data: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <LeftSidebar />
      <div className="main-content">
        <div className="social-media-container">
          <h1>Social Media Analytics</h1>
          <div className="social-cards-grid">
            {renderSocialCard('linkedin')}
            {renderSocialCard('instagram')}
            {renderSocialCard('twitter')}
            {renderSocialCard('tiktok')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMedia; 