import React, { useState, useEffect } from 'react';
import LeftSidebar from './LeftSidebar';
import { toast } from 'react-hot-toast';
import './Messages.css';
import { API_URL } from '../config';

const Messages = () => {
  const [discussions, setDiscussions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [showReplyForm, setShowReplyForm] = useState({});

  // Fetch discussions from the server
  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to view discussions');
        setLoading(false);
        return;
      }

      console.log('Fetching discussions with token:', token);
      const response = await fetch(`${API_URL}/api/discussions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch discussions');
      }
      
      const data = await response.json();
      setDiscussions(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      toast.error(error.message || 'Failed to load discussions');
      setLoading(false);
    }
  };

  // Submit a new question
  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to post questions');
        return;
      }

      console.log('Posting question with token:', token);
      const response = await fetch(`${API_URL}/api/discussions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newQuestion
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to post question');
      }

      setNewQuestion('');
      fetchDiscussions();
      toast.success('Question posted successfully');
    } catch (error) {
      console.error('Error posting question:', error);
      toast.error(error.message || 'Failed to post question');
    }
  };

  // Submit a reply to a discussion
  const handleSubmitReply = async (discussionId) => {
    if (!replyText[discussionId]?.trim()) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to post replies');
        return;
      }

      const response = await fetch(`${API_URL}/api/discussions/${discussionId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: replyText[discussionId]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to post reply');
      }

      setReplyText({ ...replyText, [discussionId]: '' });
      setShowReplyForm({ ...showReplyForm, [discussionId]: false });
      fetchDiscussions();
      toast.success('Reply posted successfully');
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error(error.message || 'Failed to post reply');
    }
  };

  // Delete a discussion or reply
  const handleDelete = async (discussionId, replyId = null) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to delete');
        return;
      }

      const url = replyId 
        ? `${API_URL}/api/discussions/${discussionId}/replies/${replyId}`
        : `${API_URL}/api/discussions/${discussionId}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete');
      }

      fetchDiscussions();
      toast.success(replyId ? 'Reply deleted' : 'Discussion deleted');
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error(error.message || 'Failed to delete');
    }
  };

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="app-container">
      <LeftSidebar />
      <div className="main-content">
        <div className="messages-container">
          <div className="messages-header">
            <h1>Q&A Discussions</h1>
            <form className="new-question-form" onSubmit={handleSubmitQuestion}>
              <div className="input-group">
                <input
                  type="text"
                  className="question-input"
                  placeholder="Ask a question..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                />
                <button type="submit" className="submit-button">
                  <i className="fas fa-paper-plane"></i>
                  Post Question
                </button>
              </div>
            </form>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i> Loading discussions...
            </div>
          ) : discussions.length === 0 ? (
            <div className="no-discussions">
              <i className="fas fa-comments"></i>
              <p>No discussions yet. Be the first to ask a question!</p>
            </div>
          ) : (
            <div className="discussions-list">
              {discussions.map((discussion) => (
                <div key={discussion._id} className="discussion-card">
                  <div className="discussion-header">
                    <div className="user-info">
                      <i className="fas fa-user-circle"></i>
                      <span className="username">{discussion.username}</span>
                      <span className="timestamp">{formatDate(discussion.createdAt)}</span>
                    </div>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(discussion._id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                  <div className="question-content">{discussion.content}</div>
                  
                  <div className="discussion-actions">
                    <button
                      className="reply-button"
                      onClick={() => setShowReplyForm({
                        ...showReplyForm,
                        [discussion._id]: !showReplyForm[discussion._id]
                      })}
                    >
                      <i className="fas fa-reply"></i>
                      Reply
                    </button>
                  </div>

                  {showReplyForm[discussion._id] && (
                    <div className="reply-form">
                      <div className="input-group">
                        <input
                          type="text"
                          className="reply-input"
                          placeholder="Write a reply..."
                          value={replyText[discussion._id] || ''}
                          onChange={(e) => setReplyText({
                            ...replyText,
                            [discussion._id]: e.target.value
                          })}
                        />
                        <button
                          className="submit-button"
                          onClick={() => handleSubmitReply(discussion._id)}
                        >
                          <i className="fas fa-paper-plane"></i>
                          Post Reply
                        </button>
                      </div>
                    </div>
                  )}

                  {discussion.replies?.length > 0 && (
                    <div className="replies-section">
                      <div className="replies-list">
                        {discussion.replies.map((reply) => (
                          <div key={reply._id} className="reply-card">
                            <div className="reply-header">
                              <div className="user-info">
                                <i className="fas fa-user-circle"></i>
                                <span className="username">{reply.username}</span>
                                <span className="timestamp">{formatDate(reply.createdAt)}</span>
                              </div>
                              <button
                                className="delete-button"
                                onClick={() => handleDelete(discussion._id, reply._id)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                            <div className="reply-content">{reply.content}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages; 