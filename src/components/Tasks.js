import React, { useState, useEffect } from 'react';
import LeftSidebar from './LeftSidebar';
import './Tasks.css';
import defaultAvatar from '../assets/MALE.jpeg';
import Notification from './Notification';
import { API_URL } from '../config';
import { toast } from 'react-hot-toast';

const getDecodedToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    // Remove 'Bearer ' if present
    const tokenString = token.startsWith('Bearer ') ? token.slice(7) : token;
    // Split the token and get the payload
    const base64Url = tokenString.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    return payload;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

const TaskItem = ({ task, onUpdateProgress, onAddNote }) => {
  const [progress, setProgress] = useState(task.progress);
  const [note, setNote] = useState('');

  const handleProgressChange = async (e) => {
    const newProgress = parseInt(e.target.value);
    setProgress(newProgress);
    await onUpdateProgress(task._id, newProgress);
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (note.trim()) {
      await onAddNote(task._id, note);
      setNote('');
    }
  };

  return (
    <div className="task-card">
      <div className="task-header">
        <h3>{task.title}</h3>
        <span className={`status-badge ${task.status}`}>
          {task.status.replace('_', ' ')}
        </span>
      </div>
      
      <p className="task-description">{task.description}</p>
      
      <div className="task-progress">
        <div className="progress-label">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleProgressChange}
        />
      </div>

      <div className="task-notes">
        <h4>Notes</h4>
        {task.notes.map((note, index) => (
          <div key={index} className="note-item">
            <div className="note-header">
              <span>{note.addedBy.fullName}</span>
              <span>{new Date(note.addedAt).toLocaleString()}</span>
            </div>
            <p className="note-text">{note.text}</p>
          </div>
        ))}
        
        <form onSubmit={handleAddNote} className="add-note-form">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note..."
          />
          <button type="submit">Add Note</button>
        </form>
      </div>
    </div>
  );
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: [],
    dueDate: '',
    priority: 'medium'
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  const handleTokenExpired = (error) => {
    console.log('Token validation failed:', error);
    
    // Only clear token and redirect if it's definitely expired/invalid
    if (error?.message?.toLowerCase().includes('token') && 
        (error.message.toLowerCase().includes('expired') || 
         error.message.toLowerCase().includes('invalid'))) {
      console.log('Clearing token and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userFullName');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    } else {
      console.log('Token error but not expired/invalid:', error);
    }
  };
  
  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          return;
        }

        // Remove Bearer prefix if it exists
        const tokenToUse = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

        const response = await fetch(`${API_URL}/api/tasks`, {
          headers: {
            'Authorization': tokenToUse
          }
        });

        if (response.ok) {
          const data = await response.json();
          setTasks(data);
        } else if (response.status === 401) {
          const errorData = await response.json();
          handleTokenExpired(errorData);
        } else {
          console.error('Failed to fetch tasks:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  // Fetch users for task assignment
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found in localStorage');
          return;
        }

        // Remove Bearer prefix if it exists
        const tokenToUse = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

        const response = await fetch(`${API_URL}/api/users/status`, {
          headers: {
            'Authorization': tokenToUse
          }
        });
        
        if (response.ok) {
          const fetchedUsers = await response.json();
          console.log('Fetched users:', fetchedUsers.map(u => ({ username: u.username, role: u.role })));
          
          // Create a Map to ensure uniqueness
          const uniqueUsers = new Map();
          fetchedUsers.forEach(user => {
            if (!uniqueUsers.has(user.username)) {
              uniqueUsers.set(user.username, user);
            }
          });
          
          // Convert Map values back to array and sort by name
          const uniqueUsersArray = Array.from(uniqueUsers.values())
            .sort((a, b) => a.fullName.localeCompare(b.fullName));
          
          setUsers(uniqueUsersArray);
        } else if (response.status === 401) {
          const errorData = await response.json();
          handleTokenExpired(errorData);
        } else {
          console.error('Failed to fetch users:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  // Fetch leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          return;
        }

        // Remove Bearer prefix if it exists
        const tokenToUse = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

        const response = await fetch(`${API_URL}/api/tasks/leaderboard`, {
          headers: {
            'Authorization': tokenToUse
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.error('Token expired or invalid');
            return;
          }
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch leaderboard');
        }

        const data = await response.json();
        setLeaderboard(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        addNotification('Failed to fetch leaderboard', 'error');
      }
    };
    fetchLeaderboard();
  }, [tasks]);

  // Add useEffect to get current user info
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found in localStorage');
          return;
        }

        // Remove Bearer prefix if it exists
        const tokenToUse = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        console.log('Fetching current user with token:', tokenToUse);

        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            'Authorization': tokenToUse
          }
        });
        
        if (response.ok) {
          const user = await response.json();
          console.log('Current user data:', user);
          localStorage.setItem('userId', user._id);
          localStorage.setItem('userFullName', user.fullName);
          localStorage.setItem('userRole', user.role);
          setCurrentUser(user);
        } else if (response.status === 401) {
          const errorData = await response.json();
          handleTokenExpired(errorData);
        } else {
          console.log('Failed to fetch current user:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  const addNotification = (message, type) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  useEffect(() => {
    const checkDeadlines = () => {
      tasks.forEach(task => {
        const deadline = new Date(task.dueDate);
        const now = new Date();
        const timeUntilDeadline = deadline - now;
        
        if (timeUntilDeadline > 0 && timeUntilDeadline <= 86400000) {
          addNotification(
            `Task "${task.title}" is due in ${Math.ceil(timeUntilDeadline / 3600000)} hours!`,
            'deadline'
          );
        }
      });
    };

    const interval = setInterval(checkDeadlines, 3600000);
    return () => clearInterval(interval);
  }, [tasks]);

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    
    if (selectedUsers.length === 0) {
      addNotification('Please select at least one user to assign the task to', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        addNotification('Please log in again', 'error');
        return;
      }

      // Remove Bearer prefix if it exists
      const tokenToUse = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const taskData = {
        title: newTask.title,
        description: newTask.description,
        dueDate: newTask.dueDate,
        priority: newTask.priority,
        assignedTo: selectedUsers.map(userId => userId)
      };

      console.log('Creating task with data:', taskData);
      console.log('Using token:', tokenToUse);

      const response = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': tokenToUse
        },
        body: JSON.stringify(taskData)
      });

      console.log('Task creation response:', response);

      if (response.status === 401) {
        const errorData = await response.json();
        console.error('Authentication error:', errorData);
        addNotification('Authentication failed. Please log in again.', 'error');
        handleTokenExpired(errorData);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Task creation failed:', errorData);
        throw new Error(errorData.message || 'Failed to create task');
      }

      const task = await response.json();
      console.log('Created task:', task);
      
      // Update tasks list
      setTasks(prev => [...prev, task]);
      
      // Reset form
      setIsModalOpen(false);
      setNewTask({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium'
      });
      setSelectedUsers([]);
      
      // Show success message
      addNotification('Task created successfully', 'success');
      
      // Refresh tasks list
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      addNotification(error.message || 'Failed to create task', 'error');
    }
  };

  // Add fetchTasks function
  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      // Remove Bearer prefix if it exists
      const tokenToUse = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const response = await fetch(`${API_URL}/api/tasks`, {
        headers: {
          'Authorization': tokenToUse
        }
      });

      if (response.status === 401) {
        const errorData = await response.json();
        handleTokenExpired(errorData);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch tasks');
      }

      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      addNotification('Failed to fetch tasks', 'error');
    }
  };

  const handleVote = async (taskId, voteType) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const tokenToUse = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const response = await fetch(`${API_URL}/api/tasks/${taskId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': tokenToUse
        },
        body: JSON.stringify({ voteType })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process vote');
      }

      const result = await response.json();
      
      if (result.message === 'Task deleted') {
        // Remove the task from the UI
        setTasks(prev => prev.filter(t => t._id !== taskId));
        toast.success('Task has been deleted');
        
        // Fetch updated leaderboard
        const leaderboardResponse = await fetch(`${API_URL}/api/tasks/leaderboard`, {
          headers: {
            'Authorization': tokenToUse
          }
        });
        
        if (leaderboardResponse.ok) {
          const leaderboardData = await leaderboardResponse.json();
          setLeaderboard(leaderboardData);
        }
      } else {
        // Update the task in the UI
        setTasks(prev => prev.map(t => t._id === taskId ? result : t));
        
        // Check if task has been reset (2 redo votes)
        if (result.status === 'pending' && voteType === 'redo') {
          toast.success('Task has been reset for redo');
          
          // Fetch updated leaderboard
          const leaderboardResponse = await fetch(`${API_URL}/api/tasks/leaderboard`, {
            headers: {
              'Authorization': tokenToUse
            }
          });
          
          if (leaderboardResponse.ok) {
            const leaderboardData = await leaderboardResponse.json();
            setLeaderboard(leaderboardData);
          }
          
          // Refresh tasks to ensure proper state
          fetchTasks();
        } else if (voteType === 'redo') {
          // Show progress towards redo
          const redoVotes = result.votes?.redo?.length || 0;
          if (redoVotes === 1) {
            toast.info('Task needs one more vote to be reset');
          }
        } else if (voteType === 'delete') {
          // Show progress towards deletion
          const deleteVotes = result.votes?.delete?.length || 0;
          if (deleteVotes === 1) {
            toast.info('Task needs one more vote to be deleted');
          }
        }
      }
    } catch (error) {
      console.error('Error processing vote:', error);
      toast.error(error.message || 'Failed to process vote');
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const tokenToUse = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const response = await fetch(`${API_URL}/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': tokenToUse
        },
        body: JSON.stringify({ action: 'complete' })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to complete task');
      }

      const updatedTask = await response.json();
      
      // Update tasks list
      setTasks(prev => prev.map(t => t._id === taskId ? updatedTask : t));
      
      // Fetch updated leaderboard
      const leaderboardResponse = await fetch(`${API_URL}/api/tasks/leaderboard`, {
        headers: {
          'Authorization': tokenToUse
        }
      });
      
      if (leaderboardResponse.ok) {
        const leaderboardData = await leaderboardResponse.json();
        setLeaderboard(leaderboardData);
      }
      
      // Show success message
      toast.success('Task completed successfully!');
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error(error.message || 'Failed to complete task');
    }
  };

  const handleStartWorking = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const tokenToUse = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const response = await fetch(`${API_URL}/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': tokenToUse
        },
        body: JSON.stringify({ action: 'start' })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to start task');
      }

      const updatedTask = await response.json();
      // Update the task in the UI
      setTasks(prev => prev.map(t => t._id === taskId ? updatedTask : t));
      
      // Show success message
      toast.success('Started working on task successfully!');
    } catch (error) {
      console.error('Error starting task:', error);
      toast.error(error.message || 'Failed to start task');
    }
  };

  const handleUpdateProgress = async (taskId, progress) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Remove Bearer prefix if it exists
      const tokenToUse = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const response = await fetch(`${API_URL}/api/tasks/${taskId}/progress`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': tokenToUse
        },
        body: JSON.stringify({ progress })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update progress');
      }

      const updatedTask = await response.json();
      setTasks(prev => prev.map(t => t._id === taskId ? updatedTask : t));
    } catch (error) {
      console.error('Error updating progress:', error);
      addNotification(error.message || 'Failed to update progress', 'error');
    }
  };

  const handleAddNote = async (taskId, text) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Remove Bearer prefix if it exists
      const tokenToUse = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const response = await fetch(`${API_URL}/api/tasks/${taskId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': tokenToUse
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add note');
      }

      const updatedTask = await response.json();
      setTasks(prev => prev.map(t => t._id === taskId ? updatedTask : t));
    } catch (error) {
      console.error('Error adding note:', error);
      addNotification(error.message || 'Failed to add note', 'error');
    }
  };

  const formatTimeStatus = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
    } else if (diffDays < 0) {
      const overdueDays = Math.abs(diffDays);
      return `Overdue by ${overdueDays} day${overdueDays === 1 ? '' : 's'}`;
    } else {
      return 'Due today';
    }
  };

  // Update the isUserAssigned function to properly check user assignment
  const isUserAssigned = (task) => {
    const userId = currentUser?._id || localStorage.getItem('userId');
    const userFullName = currentUser?.fullName || localStorage.getItem('userFullName');
    
    console.log('Checking task assignment:', {
      userId,
      userFullName,
      taskAssignedTo: task.assignedTo,
      task: task
    });
    
    return task.assignedTo && task.assignedTo.some(user => {
      console.log('Comparing user:', {
        assignedUser: user,
        userId: userId,
        match: user._id === userId || user.fullName === userFullName
      });
      return user._id === userId || user.fullName === userFullName;
    });
  };

  // Update the isUserWorkingOnTask function
  const isUserWorkingOnTask = (task) => {
    const userId = currentUser?._id || localStorage.getItem('userId');
    const userFullName = currentUser?.fullName || localStorage.getItem('userFullName');
    
    return task.status === 'in-progress' && task.inProgressBy && 
           (task.inProgressBy._id === userId || task.inProgressBy.fullName === userFullName);
  };

  // Add sorting function for tasks
  const sortTasksByAssignedMembers = (tasks) => {
    return [...tasks].sort((a, b) => {
      const aMembers = a.assignedTo.map(m => m.fullName).join(', ');
      const bMembers = b.assignedTo.map(m => m.fullName).join(', ');
      return aMembers.localeCompare(bMembers);
    });
  };

  // Add handleAddRemark function
  const handleAddRemark = async (taskId, text) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const tokenToUse = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const response = await fetch(`${API_URL}/api/tasks/${taskId}/remarks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': tokenToUse
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add remark');
      }

      const updatedTask = await response.json();
      setTasks(prev => prev.map(t => t._id === taskId ? updatedTask : t));
      toast.success('Remark added successfully');
    } catch (error) {
      console.error('Error adding remark:', error);
      toast.error(error.message || 'Failed to add remark');
    }
  };

  // Add handleUpdateRemarkStatus function
  const handleUpdateRemarkStatus = async (taskId, remarkId, status) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const tokenToUse = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const response = await fetch(`${API_URL}/api/tasks/${taskId}/remarks/${remarkId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': tokenToUse
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update remark status');
      }

      const updatedTask = await response.json();
      setTasks(prev => prev.map(t => t._id === taskId ? updatedTask : t));
      toast.success('Remark status updated');
    } catch (error) {
      console.error('Error updating remark status:', error);
      toast.error(error.message || 'Failed to update remark status');
    }
  };

  // Update the renderTaskCard function to include remarks section
  const renderTaskCard = (task) => {
    const assigned = isUserAssigned(task);
    const userId = currentUser?._id || localStorage.getItem('userId');
    const [newRemark, setNewRemark] = useState('');
    
    return (
      <div key={task._id} className={`task-card priority-${task.priority}`}>
        <div className="task-header">
          <div className="task-title-section">
            <h3>{task.title}</h3>
            <div className="task-badges">
              <span className={`priority-badge ${task.priority}`}>
                {task.priority}
              </span>
              <span className={`status-badge ${task.status}`}>
                {task.status === 'in-progress' ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    In Progress
                  </>
                ) : task.status === 'completed' ? (
                  <>
                    <i className="fas fa-check"></i>
                    Completed
                  </>
                ) : (
                  <>
                    <i className="fas fa-clock"></i>
                    Pending
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        <p className="task-description">{task.description}</p>
        
        {task.status === 'in-progress' && task.inProgressBy && (
          <div className="in-progress-info">
            <i className="fas fa-user"></i>
            <span>{task.inProgressBy.fullName} is working on this</span>
            <span className="started-at">
              Started {new Date(task.startedAt).toLocaleTimeString()}
            </span>
          </div>
        )}

        {task.status === 'completed' && task.completedBy && (
          <div className="completed-info">
            <i className="fas fa-check-circle"></i>
            <span>Completed by {task.completedBy.fullName}</span>
            <span className="completed-at">
              on {new Date(task.completedAt).toLocaleDateString()}
            </span>
          </div>
        )}

        <div className="task-meta">
          <div className="assigned-members">
            <div className="assigned-users-list">
              {task.assignedTo && task.assignedTo.map(member => (
                <div key={member._id || member.id} className="assigned-user">
                  <img src={defaultAvatar} alt={member.fullName} />
                  <div className="user-info">
                    <span className="user-name">{member.fullName}</span>
                    <span className="user-role">{member.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <span className={`due-date ${new Date(task.dueDate) < new Date() ? 'overdue' : ''}`}>
            <i className="far fa-calendar"></i>
            {formatTimeStatus(task.dueDate)}
          </span>
        </div>

        <div className="task-remarks">
          <h4>Remarks & Feedback</h4>
          <div className="remarks-list">
            {task.remarks && task.remarks.map((remark, index) => (
              <div key={index} className={`remark-item ${remark.status}`}>
                <div className="remark-header">
                  <span className="remark-author">{remark.addedBy.fullName}</span>
                  <span className="remark-date">
                    {new Date(remark.addedAt).toLocaleString()}
                  </span>
                </div>
                <p className="remark-text">{remark.text}</p>
                {isUserAssigned(task) && remark.status === 'pending' && (
                  <button
                    className="mark-addressed-button"
                    onClick={() => handleUpdateRemarkStatus(task._id, remark._id, 'addressed')}
                  >
                    <i className="fas fa-check"></i>
                    Mark as Addressed
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="add-remark-form">
            <textarea
              value={newRemark}
              onChange={(e) => setNewRemark(e.target.value)}
              placeholder="Add a remark or feedback..."
              className="remark-input"
            />
            <button
              className="add-remark-button"
              onClick={() => {
                if (newRemark.trim()) {
                  handleAddRemark(task._id, newRemark.trim());
                  setNewRemark('');
                }
              }}
            >
              <i className="fas fa-comment"></i>
              Add Remark
            </button>
          </div>
        </div>

        <div className="task-actions">
          <div className="task-actions-left">
            {assigned && task.status === 'pending' && (
              <button 
                className="start-button"
                onClick={() => handleStartWorking(task._id)}
              >
                <i className="fas fa-play"></i>
                Start Working
              </button>
            )}
            {assigned && isUserWorkingOnTask(task) && (
              <button 
                className="complete-button"
                onClick={() => handleCompleteTask(task._id)}
              >
                <i className="fas fa-check"></i>
                Complete
              </button>
            )}
          </div>

          <div className="task-actions-right">
            {task.status === 'completed' && (
              <>
                <button 
                  className={`vote-button ${task.votes?.redo?.includes(currentUser?._id || localStorage.getItem('userId')) ? 'active' : ''}`}
                  onClick={() => handleVote(task._id, 'redo')}
                >
                  <i className="fas fa-redo"></i>
                  Redo ({task.votes?.redo?.length || 0}/2)
                </button>
                <button 
                  className={`vote-button delete ${task.votes?.delete?.includes(currentUser?._id || localStorage.getItem('userId')) ? 'active' : ''}`}
                  onClick={() => handleVote(task._id, 'delete')}
                >
                  <i className="fas fa-trash"></i>
                  Delete ({task.votes?.delete?.length || 0}/2)
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Add the clear tasks function
  const handleClearTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Remove Bearer prefix if it exists
      const tokenToUse = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      console.log('Sending clear tasks request with token:', tokenToUse);
      
      const response = await fetch(`${API_URL}/api/tasks/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': tokenToUse,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Clear tasks response:', data);

      if (response.ok) {
        setTasks([]);
        setLeaderboard([]);
        addNotification('All tasks have been cleared', 'success');
      } else {
        throw new Error(data.message || 'Failed to clear tasks');
      }
    } catch (error) {
      console.error('Error clearing tasks:', error);
      addNotification(error.message || 'Failed to clear tasks', 'error');
    }
  };

  // Add a function to validate token format
  const isValidToken = (token) => {
    if (!token) return false;
    const parts = token.split('.');
    return parts.length === 3 && token.startsWith('Bearer ');
  };

  return (
    <div className="dashboard-layout">
      <LeftSidebar />
      
      <div className="main-content">
        <div className="notifications-container">
          {notifications.map(notif => (
            <Notification
              key={notif.id}
              message={notif.message}
              type={notif.type}
              onClose={() => removeNotification(notif.id)}
            />
          ))}
        </div>

        <div className="tasks-container">
          <div className="tasks-header">
            <h1>Team Tasks</h1>
            <div className="task-header-actions">
              <button className="add-task-button" onClick={() => setIsModalOpen(true)}>
                <i className="fas fa-plus"></i>
                Add Task
              </button>
              {(currentUser?.role === 'CEO' || getDecodedToken()?.role === 'CEO') && (
                <button 
                  className="clear-tasks-button" 
                  onClick={handleClearTasks}
                  style={{
                    marginLeft: '10px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <i className="fas fa-trash"></i>
                  Clear All Tasks
                </button>
              )}
            </div>
          </div>

          <div className="leaderboard-section">
            <h2>Task Leaderboard</h2>
            <div className="leaderboard-list">
              {leaderboard.length > 0 ? (
                leaderboard.map((member, index) => (
                  <div key={member.id} className="leaderboard-item">
                    <div className="rank">#{index + 1}</div>
                    <div className="member-avatar-section">
                      <img src={defaultAvatar} alt={member.fullName} />
                      <div className="tasks-count">
                        {member.tasksCompleted} tasks
                      </div>
                    </div>
                    <div className="member-info">
                      <h4>{member.fullName}</h4>
                      <p>{member.role}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">
                  <p>Loading leaderboard...</p>
                </div>
              )}
            </div>
          </div>

          <div className="tasks-list">
            {sortTasksByAssignedMembers(tasks).map(task => renderTaskCard(task))}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Task</h2>
              <button className="close-modal" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleAddTask}>
              <div className="form-group">
                <label>Title <span className="required">*</span></label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Enter task title"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description <span className="required">*</span></label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Enter task description"
                  required
                />
              </div>
              <div className="form-group">
                <label>Assign To <span className="required">*</span></label>
                <div className="members-select">
                  {users.length > 0 ? (
                    users.map(user => (
                      <label key={user._id} className="member-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => handleUserSelect(user._id)}
                        />
                        <div className="member-info">
                          <span className="member-name">{user.fullName}</span>
                          <span className="member-role">{user.role}</span>
                        </div>
                      </label>
                    ))
                  ) : (
                    <div className="no-members">
                      <p>No team members available</p>
                      <p>Please wait while we load the team members...</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Due Date <span className="required">*</span></label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-button">
                  Create Task
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

export default Tasks; 