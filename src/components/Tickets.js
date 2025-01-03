import React, { useState, useEffect } from 'react';
import LeftSidebar from './LeftSidebar';
import axios from 'axios';
import { API_URL } from '../config';
import './Tickets.css';

const TicketCard = ({ ticket, isSelected, onClick }) => {
  if (!ticket) return null;

  // Helper function to render object fields
  const renderFields = (obj, title) => {
    if (!obj || Object.keys(obj).length === 0) return null;

    return (
      <div className={`${title.toLowerCase()}-details`}>
        <h4>{title}</h4>
        {Object.entries(obj).map(([key, value]) => (
          value && (
            <div key={key} className="detail-item">
              <span className="detail-label">
                {key.charAt(0).toUpperCase() + key.slice(1)}:
              </span>
              <span className="detail-value">{value}</span>
            </div>
          )
        ))}
      </div>
    );
  };

  // Helper function to render suggestions
  const renderSuggestions = (suggestions) => {
    if (!suggestions || suggestions.length === 0) return null;

    return (
      <div className="suggestions-details">
        <h4>Suggestions</h4>
        <ul>
          {suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div 
      className={`ticket-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="ticket-header">
        <h3>{ticket.type || 'No Type'}</h3>
        <span className={`status-badge ${(ticket.status || 'pending').toLowerCase()}`}>
          {ticket.status || 'Pending'}
        </span>
      </div>
      
      <div className="ticket-info">
        <div className="ticket-meta">
          <span className="ticket-email">{ticket.email}</span>
          <span className="ticket-date">
            {new Date(ticket.timestamp).toLocaleString()}
          </span>
        </div>

        {/* Render all non-empty sections */}
        {renderFields(ticket.details, 'Details')}
        {renderFields(ticket.profession, 'Profession')}
        {ticket.topic && (
          <div className="topic-details">
            <span className="detail-label">Topic:</span>
            <span className="detail-value">{ticket.topic}</span>
          </div>
        )}
        {ticket.message && (
          <div className="message-details">
            <span className="detail-label">Message:</span>
            <span className="detail-value">{ticket.message}</span>
          </div>
        )}
        {ticket.feature && (
          <div className="feature-details">
            <span className="detail-label">Feature:</span>
            <span className="detail-value">{ticket.feature}</span>
          </div>
        )}
        {renderSuggestions(ticket.suggestions)}
      </div>
    </div>
  );
};

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        console.log('Fetching tickets...');
        const response = await axios.get(`${API_URL}/api/tickets/tickets`);
        console.log('Tickets response:', response.data);
        setTickets(response.data);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
    const interval = setInterval(fetchTickets, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !reply.trim()) return;

    try {
      await axios.post(`${API_URL}/api/tickets/reply`, {
        email: selectedTicket.email,
        reply: reply
      });
      
      // Update ticket status
      const updatedTickets = tickets.map(ticket => 
        ticket.email === selectedTicket.email 
          ? { ...ticket, status: 'Responded' }
          : ticket
      );
      
      setTickets(updatedTickets);
      setReply('');
      setSelectedTicket(null);
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  // Add safe filtering function
  const getFilteredTickets = () => {
    if (!tickets) return [];
    
    return tickets.filter(ticket => {
      // Status filter
      if (filterStatus !== 'all' && ticket?.status?.toLowerCase() !== filterStatus.toLowerCase()) {
        return false;
      }

      // Search filter
      const searchLower = searchQuery.toLowerCase();
      return (
        ticket?.email?.toLowerCase().includes(searchLower) ||
        ticket?.type?.toLowerCase().includes(searchLower) ||
        ticket?.details?.bugType?.toLowerCase().includes(searchLower) ||
        ticket?.profession?.word?.toLowerCase().includes(searchLower) ||
        ticket?.message?.toLowerCase().includes(searchLower)
      );
    }).sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? new Date(a.timestamp) - new Date(b.timestamp)
          : new Date(b.timestamp) - new Date(a.timestamp);
      }
      // Add other sort options if needed
      return 0;
    });
  };

  // Get filtered tickets
  const filteredTickets = getFilteredTickets();

  return (
    <div className="app-container">
      <LeftSidebar />
      <div className="tickets-container">
        <div className="tickets-header">
          <h1>Support Tickets</h1>
          <div className="tickets-controls">
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="responded">Responded</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="date">Date</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="sort-order"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        <div className="tickets-content">
          <div className="tickets-list">
            {loading ? (
              <div className="loading">Loading tickets...</div>
            ) : !filteredTickets || filteredTickets.length === 0 ? (
              <div className="no-tickets">No tickets found</div>
            ) : (
              filteredTickets.map((ticket) => (
                <TicketCard 
                  key={`${ticket.email}-${ticket.timestamp}`}
                  ticket={ticket}
                  isSelected={selectedTicket?.email === ticket.email}
                  onClick={() => setSelectedTicket(ticket)}
                />
              ))
            )}
          </div>

          {selectedTicket && (
            <div className="ticket-detail">
              <div className="detail-header">
                <h2>Ticket Details</h2>
                <button 
                  className="close-detail"
                  onClick={() => setSelectedTicket(null)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="detail-content">
                <div className="detail-info">
                  <h3>{selectedTicket.type}</h3>
                  <p className="detail-email">{selectedTicket.email}</p>
                  <span className={`status-badge ${selectedTicket.status?.toLowerCase() || 'pending'}`}>
                    {selectedTicket.status || 'Pending'}
                  </span>
                </div>
                <div className="detail-message">
                  <h4>Details</h4>
                  {selectedTicket.type?.includes('Bug') ? (
                    <div className="bug-info">
                      <p><strong>Bug Type:</strong> {selectedTicket.details?.bugType}</p>
                      <p><strong>Device:</strong> {selectedTicket.details?.device}</p>
                      <p><strong>Additional Info:</strong> {selectedTicket.details?.additionalInfo}</p>
                    </div>
                  ) : selectedTicket.type?.includes('Word') ? (
                    <div className="word-info">
                      <p><strong>Profession:</strong> {selectedTicket.profession?.name}</p>
                      <p><strong>Word:</strong> {selectedTicket.profession?.word}</p>
                      <p><strong>Definition:</strong> {selectedTicket.profession?.definition}</p>
                      <p><strong>Origin:</strong> {selectedTicket.profession?.origin}</p>
                    </div>
                  ) : (
                    <p>{selectedTicket.message || 'No message provided'}</p>
                  )}
                </div>
                <form onSubmit={handleReply} className="reply-form">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your reply..."
                    required
                  />
                  <button type="submit" className="send-reply">
                    <i className="fas fa-paper-plane"></i>
                    Send Reply
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tickets; 