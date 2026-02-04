// Client-side application logic
const API_URL = 'http://localhost:3000/api';
let currentUser = null;
let eventParticipants = [];
let eventParticipantUsernames = {};
let meetingParticipantUsernames = {};

// Handle notification click to navigate to related entity
window.handleNotificationClick = async function(notificationType, relatedEntityId) {
  if (notificationType === 'meeting_flagged') {
    // Navigate to meetings tab
    const meetingsTabBtn = document.querySelector('[data-tab="meetings"]');
    if (meetingsTabBtn) {
      meetingsTabBtn.click();
    }
    
    // Open the meeting details
    setTimeout(() => {
      viewMeetingDetails(relatedEntityId);
    }, 100);
  }
  // Add more notification type handlers as needed
};

// Toast Notification System
const showToast = (message, type = 'info', title = '') => {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const titles = {
    success: title || 'Success',
    error: title || 'Error',
    warning: title || 'Warning',
    info: title || 'Info'
  };

  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <div class="toast-content">
      <div class="toast-title">${titles[type]}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close">&times;</button>
  `;

  container.appendChild(toast);

  // Close button
  toast.querySelector('.toast-close').addEventListener('click', () => {
    removeToast(toast);
  });

  // Auto-remove after 5 seconds
  setTimeout(() => {
    removeToast(toast);
  }, 5000);
};

const removeToast = (toast) => {
  toast.classList.add('removing');
  setTimeout(() => {
    toast.remove();
  }, 300);
};

// Check if user is logged in
const checkAuth = () => {
  const savedUser = localStorage.getItem('currentUser');
  const authView = document.getElementById('authView');
  const mainView = document.getElementById('mainView');
  
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    if (authView) authView.style.display = 'none';
    if (mainView) mainView.style.display = 'flex';
    updateUIForLoggedInUser();
  } else {
    if (authView) authView.style.display = 'flex';
    if (mainView) mainView.style.display = 'none';
  }
};

// Update UI when user is logged in
const updateUIForLoggedInUser = async () => {
  const usernameEl = document.getElementById('currentUsername');
  const userAvatar = document.getElementById('userAvatar');
  
  if (usernameEl && currentUser) {
    usernameEl.textContent = currentUser.username;
  }
  
  if (userAvatar && currentUser) {
    userAvatar.textContent = currentUser.username.charAt(0).toUpperCase();
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
  
  // Check if user has an organization
  await checkUserOrganization();
};

// Logout function
const logout = () => {
  currentUser = null;
  localStorage.removeItem('currentUser');
  location.reload();
};

// Check if user has an organization
async function checkUserOrganization() {
  if (!currentUser) return;

  try {
    const response = await fetch(`${API_URL}/organizations/user/${currentUser.id}`);
    const data = await response.json();

    if (data.success && data.data && data.data.length > 0) {
      // User has an organization, load normal data
      loadUserData();
    } else {
      // User has no organization, show required modal
      showOrgRequiredModal();
    }
  } catch (error) {
    console.error('Failed to check organization:', error);
    showOrgRequiredModal();
  }
}

// Show organization required modal
function showOrgRequiredModal() {
  const modal = document.getElementById('orgRequiredModal');
  if (modal) {
    modal.classList.add('active');
    // Disable all navigation
    disableNavigation();
  }
}

// Disable navigation until user has organization
function disableNavigation() {
  const navButtons = document.querySelectorAll('.nav-tabs button');
  const createButtons = document.querySelectorAll('#createEventBtn, #createMeetingBtn, #createTaskBtn');
  
  navButtons.forEach(btn => {
    if (btn.dataset.tab !== 'organization') {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
    }
  });
  
  createButtons.forEach(btn => {
    btn.disabled = true;
    btn.style.opacity = '0.5';
    btn.style.cursor = 'not-allowed';
  });
}

// Enable navigation after user joins organization
function enableNavigation() {
  const navButtons = document.querySelectorAll('.nav-tabs button');
  const createButtons = document.querySelectorAll('#createEventBtn, #createMeetingBtn, #createTaskBtn');
  
  navButtons.forEach(btn => {
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
  });
  
  createButtons.forEach(btn => {
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
  });
}

// Show create org from required modal
window.showCreateOrgFromRequired = function() {
  const requiredModal = document.getElementById('orgRequiredModal');
  if (requiredModal) {
    requiredModal.classList.remove('active');
  }
  openOrganizationModal();
};

// Show join org form
window.showJoinOrgForm = function() {
  const form = document.getElementById('joinOrgForm');
  if (form) {
    form.style.display = 'block';
  }
};

// Search organizations
window.searchOrganizations = async function() {
  const searchInput = document.getElementById('joinOrgSearch');
  const searchValue = searchInput.value.trim();

  const resultsContainer = document.getElementById('orgSearchResults');
  const resultsList = document.getElementById('orgResultsList');

  if (!searchValue) {
    resultsContainer.style.display = 'none';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/organizations`);
    const data = await response.json();

    if (data.success && data.data) {
      const results = data.data.filter(org => 
        org.id.toLowerCase().includes(searchValue.toLowerCase()) ||
        org.name.toLowerCase().includes(searchValue.toLowerCase())
      );

      if (results.length === 0) {
        resultsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No organizations found</p>';
        resultsContainer.style.display = 'block';
        return;
      }

      resultsList.innerHTML = results.map(org => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 1.5rem; background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
          <div style="display: flex; align-items: center; gap: 1rem;">
            ${org.logo ? `<img src="${org.logo}" alt="${org.name}" style="width: 50px; height: 50px; border-radius: var(--radius-md);">` : '<div style="width: 50px; height: 50px; border-radius: var(--radius-md); background: var(--primary-gradient); display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">🏢</div>'}
            <div>
              <h4 style="margin: 0 0 0.25rem 0;">${org.name}</h4>
              <p style="margin: 0; font-size: 0.875rem; color: var(--text-secondary);">${org.description || 'No description'}</p>
              <p style="margin: 0.25rem 0 0 0; font-size: 0.75rem; color: var(--text-tertiary);">ID: ${org.id}</p>
            </div>
          </div>
          <button class="btn" onclick="requestJoinOrganization('${org.id}', '${org.name}')">Join</button>
        </div>
      `).join('');

      resultsContainer.style.display = 'block';
    }
  } catch (error) {
    console.error('Search organizations error:', error);
    resultsList.innerHTML = '<p style="text-align: center; color: var(--error); padding: 2rem;">Failed to search organizations</p>';
    resultsContainer.style.display = 'block';
  }
};

// Request to join organization
window.requestJoinOrganization = async function(orgId, orgName) {
  if (!currentUser) return;

  try {
    const response = await fetch(`${API_URL}/organizations/${orgId}/join-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id }),
    });

    const data = await response.json();

    if (data.success) {
      showToast(`Join request sent to ${orgName}! Please wait for admin approval.`, 'success', 'Request Sent');
      
      // Clear search
      document.getElementById('joinOrgSearch').value = '';
      document.getElementById('orgSearchResults').style.display = 'none';
    } else {
      showToast(data.message || 'Failed to send join request', 'error', 'Failed');
    }
  } catch (error) {
    console.error('Join request error:', error);
    showToast('Unable to send join request', 'error', 'Error');
  }
};

// Load user's events and meetings
const loadUserData = async () => {
  if (!currentUser) return;

  try {
    // Load events
    const eventsResponse = await fetch(`${API_URL}/events/user/${currentUser.id}`);
    const eventsData = await eventsResponse.json();
    
    if (eventsData.success) {
      displayEvents(eventsData.data);
    }

    // Load notifications
    const notificationsResponse = await fetch(`${API_URL}/notifications/user/${currentUser.id}`);
    const notificationsData = await notificationsResponse.json();
    
    if (notificationsData.success) {
      displayNotifications(notificationsData.data);
    }

    // Load meetings
    await loadMeetingsForUser();

    // Load organization
    await loadOrganizationData();
  } catch (error) {
    console.error('Failed to load user data:', error);
  }
};

// Load meetings for the current user
// Load meetings for the current user
const loadMeetingsForUser = async () => {
  if (!currentUser) return;

  try {
    // Check if user is admin to show all meetings
    let isAdmin = false;
    try {
      const orgResponse = await fetch(`${API_URL}/organizations/user/${currentUser.id}`);
      const orgData = await orgResponse.json();
      if (orgData.success && orgData.data && orgData.data.length > 0) {
        const org = orgData.data[0];
        isAdmin = org.adminIds.includes(currentUser.id);
      }
    } catch (error) {
      console.error('Failed to check admin status:', error);
    }

    // Get meetings where user is a participant (or all meetings if admin)
    const url = isAdmin 
      ? `${API_URL}/meetings/user/${currentUser.id}?includeAll=true`
      : `${API_URL}/meetings/user/${currentUser.id}`;
    const meetingsResponse = await fetch(url);
    const meetingsData = await meetingsResponse.json();
    
    const meetingList = document.getElementById('meetingsList');
    const emptyState = document.getElementById('meetingsEmpty');
    
    if (!meetingList) return;
    
    if (!meetingsData.success || !meetingsData.data || meetingsData.data.length === 0) {
      meetingList.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    
    meetingList.innerHTML = '';
    
    meetingsData.data.forEach(meeting => {
      const meetingCard = document.createElement('div');
      meetingCard.className = 'meeting-card';
      meetingCard.innerHTML = `
        ${meeting.flaggedForDeletion ? '<div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); color: white; padding: 0.5rem 1rem; border-radius: var(--radius-md) var(--radius-md) 0 0; font-size: 0.875rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;"><span>⚠️</span> Flagged for Deletion</div>' : ''}
        <h4>📋 ${meeting.title} ${!meeting.eventId ? '<span style="font-size: 0.75rem; padding: 0.25rem 0.5rem; background: var(--primary-gradient); color: white; border-radius: var(--radius-sm); margin-left: 0.5rem;">Independent</span>' : ''}</h4>
        <div class="meeting-info">
          <span>🗓️ ${new Date(meeting.scheduledTime).toLocaleString()}</span>
          <span>⏱️ ${meeting.duration} min</span>
          <span>👥 ${meeting.participants.length} participants</span>
          <span>📝 ${meeting.agendaItems.length} agenda items</span>
          ${meeting.meetingLink ? '<span>🔗 Has video link</span>' : ''}
        </div>
        <div class="meeting-actions">
          <button class="btn btn-sm" onclick="viewMeetingDetails('${meeting.id}')">View Details</button>
          <button class="btn btn-sm btn-success" onclick="checkInToMeeting('${meeting.id}', '${currentUser.id}')">Check In</button>
        </div>
      `;
      meetingList.appendChild(meetingCard);
    });
  } catch (error) {
    console.error('Failed to load meetings:', error);
  }
};

// Display events in the UI
const displayEvents = (events) => {
  const eventList = document.getElementById('eventsList');
  const emptyState = document.getElementById('eventsEmpty');
  
  if (!eventList) return;

  if (events.length === 0) {
    eventList.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  
  eventList.innerHTML = events.map(event => {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const duration = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
    const isSameDay = startDate.toDateString() === endDate.toDateString();
    
    return `
    <div class="event-card">
      <div class="event-card-header">
        <h3>${event.title}</h3>
        <div class="event-date">
          ${isSameDay 
            ? `📅 ${startDate.toLocaleDateString()}`
            : `📅 ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
          }
        </div>
      </div>
      <div class="event-card-body">
        <p class="event-description">${event.description || 'No description'}</p>
        <div class="event-meta">
          <div class="meta-item">
            <span>📍 <strong>Location:</strong> ${event.location}</span>
          </div>
          <div class="meta-item">
            <span>⏱️ <strong>Duration:</strong> ${duration === 0 ? 'Same day' : `${duration} ${duration === 1 ? 'day' : 'days'}`}</span>
          </div>
          <div class="meta-item">
            <span>👥 <strong>Participants:</strong> ${event.participants.length}</span>
          </div>
          <div class="meta-item">
            <span>📊 <strong>Status:</strong> ${event.status}</span>
          </div>
        </div>
      </div>
      <div class="event-card-footer">
        <button class="btn btn-sm btn-secondary" onclick="editEvent('${event.id}')">Edit</button>
        <button class="btn btn-sm" onclick="viewEvent('${event.id}')">View Details</button>
      </div>
    </div>
    `;
  }).join('');
};

// Display notifications
const displayNotifications = (notifications) => {
  const notificationList = document.getElementById('notificationsList');
  const emptyState = document.getElementById('notificationsEmpty');
  
  if (!notificationList) return;

  if (notifications.length === 0) {
    notificationList.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  notificationList.innerHTML = notifications.map(notification => {
    // Different icons based on notification type
    const typeIcons = {
      'meeting_flagged': '🚩',
      'meeting_scheduled': '📅',
      'meeting_reminder': '⏰',
      'event_invitation': '📨',
      'event_update': '🔄',
      'task_assigned': '✓',
      'task_due_soon': '⚠️',
      'participant_request': '👤',
      'general': '🔔'
    };
    
    const icon = typeIcons[notification.type] || '🔔';
    const isFlagged = notification.type === 'meeting_flagged';
    
    return `
      <div class="notification-card ${!notification.isRead ? 'unread' : ''} ${isFlagged ? 'flagged-notification' : ''}" ${notification.relatedEntityId ? `onclick="handleNotificationClick('${notification.type}', '${notification.relatedEntityId}')"` : ''} style="${notification.relatedEntityId ? 'cursor: pointer;' : ''}">
        <div class="notification-icon">${icon}</div>
        <div class="notification-content">
          <h4>${notification.title}</h4>
          <p>${notification.message}</p>
          <div class="notification-time">${new Date(notification.createdAt).toLocaleString()}</div>
        </div>
      </div>
    `;
  }).join('');
};

document.addEventListener('DOMContentLoaded', () => {
  console.log('Planify client application loaded');
  
  // Setup autocomplete for event participant search
  const eventParticipantSearchInput = document.getElementById('eventParticipantSearch');
  if (eventParticipantSearchInput) {
    eventParticipantSearchInput.addEventListener('input', () => {
      clearTimeout(eventParticipantSearchTimeout);
      eventParticipantSearchTimeout = setTimeout(() => {
        searchEventParticipants();
      }, 300); // 300ms debounce
    });
  }

  // Setup autocomplete for organization search
  const joinOrgSearchInput = document.getElementById('joinOrgSearch');
  if (joinOrgSearchInput) {
    joinOrgSearchInput.addEventListener('input', () => {
      clearTimeout(organizationSearchTimeout);
      organizationSearchTimeout = setTimeout(() => {
        searchOrganizations();
      }, 300); // 300ms debounce
    });
  }
  
  // Tab navigation
  const tabButtons = document.querySelectorAll('.nav-tabs button');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tab = button.getAttribute('data-tab');
      
      // Update active button
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Update active section
      const sections = document.querySelectorAll('.content-section');
      sections.forEach(section => section.classList.remove('active'));
      const activeSection = document.getElementById(`${tab}Section`);
      if (activeSection) {
        activeSection.classList.add('active');
      }
    });
  });

  checkAuth();

  // Login form submission
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    console.log('Login form found, attaching event listener');
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Login form submitted');
      
      const formData = new FormData(loginForm);
      const username = formData.get('username');
      const password = formData.get('password');

      console.log('Attempting login for:', username);

      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        console.log('Login response:', data);

        if (data.success) {
          currentUser = data.data;
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          showToast('Welcome back, ' + currentUser.username + '!', 'success', 'Login Successful');
          checkAuth(); // Switch to main view
        } else {
          showToast(data.message || 'Invalid credentials', 'error', 'Login Failed');
        }
      } catch (error) {
        console.error('Login error:', error);
        showToast('Unable to connect to server', 'error', 'Login Failed');
      }
      
      return false;
    });
  } else {
    console.error('Login form not found!');
  }

  // Create event button
  const createEventBtn = document.getElementById('createEventBtn');
  if (createEventBtn) {
    createEventBtn.addEventListener('click', () => {
      if (!currentUser) {
        showToast('Please login first to create events', 'warning', 'Authentication Required');
        return;
      }
      openEventModal();
    });
  }

  // Create meeting button
  const meetingModal = document.getElementById('meetingModal');
  const createMeetingBtn = document.getElementById('createMeetingBtn');
  const cancelMeetingBtn = document.getElementById('cancelMeetingBtn');
  const meetingForm = document.getElementById('meetingForm');
  const participantsList = document.getElementById('participantsList');
  const agendaItemsList = document.getElementById('agendaItemsList');
  const meetingEventSelect = document.getElementById('meetingEventSelect');
  
  let meetingParticipants = [];
  let agendaItems = [];
  let agendaCounter = 0;
  
  if (createMeetingBtn) {
    createMeetingBtn.addEventListener('click', () => {
      if (!currentUser) {
        showToast('Please login first to plan meetings', 'warning', 'Authentication Required');
        return;
      }
      openMeetingModal();
    });
  }

  if (cancelMeetingBtn) {
    cancelMeetingBtn.addEventListener('click', () => {
      meetingModal.style.display = 'none';
      meetingForm.reset();
      meetingParticipants = [];
      meetingParticipantUsernames = {};
      agendaItems = [];
      participantsList.innerHTML = '';
      agendaItemsList.innerHTML = '';
    });
  }

  // Meeting participant search
  const meetingParticipantSearch = document.getElementById('meetingParticipantSearch');
  if (meetingParticipantSearch) {
    meetingParticipantSearch.addEventListener('input', () => {
      searchMeetingParticipants();
    });
  }

  function renderParticipants() {
    if (!participantsList) return;
    
    if (meetingParticipants.length === 0) {
      participantsList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">No participants added yet</p>';
      return;
    }

    participantsList.innerHTML = meetingParticipants.map(userId => {
      const username = meetingParticipantUsernames[userId] || 'Unknown';
      return `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: white; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="width: 32px; height: 32px; border-radius: var(--radius-full); background: var(--primary-gradient); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.875rem;">
            ${username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style="font-weight: 600; font-size: 0.875rem;">${username}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); font-family: monospace;">${userId}</div>
          </div>
        </div>
        <button type="button" class="btn btn-sm btn-danger" onclick="removeMeetingParticipant('${userId}')">Remove</button>
      </div>
      `;
    }).join('');
  }

  window.removeMeetingParticipant = function(userId) {
    meetingParticipants = meetingParticipants.filter(id => id !== userId);
    delete meetingParticipantUsernames[userId];
    renderParticipants();
    searchMeetingParticipants(); // Refresh search results
  };

  // Add agenda item
  const addAgendaBtn = document.getElementById('addAgendaBtn');
  
  if (addAgendaBtn) {
    addAgendaBtn.addEventListener('click', () => {
      const itemId = `agenda_${agendaCounter++}`;
      agendaItems.push({
        id: itemId,
        title: '',
        duration: 15,
        orderIndex: agendaItems.length
      });
      renderAgendaItems();
    });
  }

  function renderAgendaItems() {
    agendaItemsList.innerHTML = '';
    agendaItems.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'agenda-item';
      itemDiv.innerHTML = `
        <input type="text" placeholder="Agenda item title" value="${item.title}" 
               onchange="updateAgendaItem('${item.id}', 'title', this.value)">
        <input type="number" min="5" step="5" value="${item.duration}" 
               placeholder="Duration (min)" 
               onchange="updateAgendaItem('${item.id}', 'duration', this.value)">
        <button class="remove-agenda-btn" onclick="removeAgendaItem('${item.id}')">Remove</button>
      `;
      agendaItemsList.appendChild(itemDiv);
    });
  }

  window.updateAgendaItem = function(id, field, value) {
    const item = agendaItems.find(a => a.id === id);
    if (item) {
      item[field] = field === 'duration' ? parseInt(value) : value;
    }
  };

  window.removeAgendaItem = function(id) {
    agendaItems = agendaItems.filter(item => item.id !== id);
    // Update order indices
    agendaItems.forEach((item, index) => {
      item.orderIndex = index;
    });
    renderAgendaItems();
  };

  // Submit meeting form
  if (meetingForm) {
    meetingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(meetingForm);
      const templates = [];
      
      if (formData.get('createNotes')) templates.push('notes');
      if (formData.get('createMinutes')) templates.push('minutes');
      if (formData.get('createProtocol')) templates.push('protocol');

      const meetingData = {
        eventId: formData.get('eventId'),
        title: formData.get('title'),
        description: formData.get('description'),
        scheduledTime: new Date(formData.get('scheduledTime')),
        duration: parseInt(formData.get('duration')),
        participants: [currentUser.id, ...meetingParticipants],
        agendaItems: agendaItems.filter(item => item.title.trim() !== ''),
      };

      console.log('Creating meeting with data:', meetingData);

      try {
        // Create meeting
        const response = await fetch(`${API_URL}/meetings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(meetingData),
        });

        const data = await response.json();
        
        console.log('Meeting creation response:', data);

        if (data.success) {
          // Create document templates if selected
          for (const templateType of templates) {
            const docContent = generateDocumentTemplate(templateType, meetingData);
            await fetch(`${API_URL}/meetings/${data.data.id}/documents`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: `${templateType.charAt(0).toUpperCase() + templateType.slice(1)} - ${meetingData.title}`,
                content: docContent,
                type: templateType,
                createdBy: currentUser.id,
              }),
            });
          }

          alert('Meeting created successfully!');
          meetingModal.style.display = 'none';
          meetingForm.reset();
          meetingParticipants = [];
          meetingParticipantUsernames = {};
          agendaItems = [];
          participantsList.innerHTML = '';
          agendaItemsList.innerHTML = '';
          loadUserData();
        } else {
          alert(data.message || 'Failed to create meeting');
        }
      } catch (error) {
        console.error('Create meeting error:', error);
        alert('Failed to create meeting. Please try again.');
      }
    });
  }

  function generateDocumentTemplate(type, meetingData) {
    const date = new Date(meetingData.scheduledTime).toLocaleDateString();
    const time = new Date(meetingData.scheduledTime).toLocaleTimeString();
    
    switch (type) {
      case 'notes':
        return `Meeting Notes
Title: ${meetingData.title}
Date: ${date} at ${time}
Duration: ${meetingData.duration} minutes

Description:
${meetingData.description || 'No description provided'}

Agenda:
${meetingData.agendaItems.map((item, i) => `${i + 1}. ${item.title} (${item.duration || 0} min)`).join('\n') || 'No agenda items'}

Notes:
[Add your notes here during the meeting]
`;

      case 'minutes':
        return `Meeting Minutes
Title: ${meetingData.title}
Date: ${date} at ${time}
Attendees: ${meetingData.participants.length} participant(s)

Agenda Items:
${meetingData.agendaItems.map((item, i) => `${i + 1}. ${item.title}`).join('\n') || 'No agenda items'}

Discussion Points:
[To be filled during the meeting]

Action Items:
[List action items and assignments]

Next Steps:
[Define next steps]
`;

      case 'protocol':
        return `Meeting Protocol
Title: ${meetingData.title}
Date: ${date} at ${time}
Duration: ${meetingData.duration} minutes

Participants: ${meetingData.participants.length}
Status: Scheduled

Agenda:
${meetingData.agendaItems.map((item, i) => `${i + 1}. ${item.title} - ${item.duration || 0} min`).join('\n') || 'No agenda items'}

Decisions Made:
[To be documented]

Follow-up Required:
[List follow-up actions]
`;

      default:
        return `Document for ${meetingData.title}\n\n[Content here]`;
    }
  }

  // View meeting details
  window.viewMeetingDetails = async function(meetingId) {
    try {
      const response = await fetch(`${API_URL}/meetings/${meetingId}`);
      const data = await response.json();

      if (data.success) {
        const meeting = data.data;
        const detailModal = document.getElementById('meetingDetailModal');
        const detailContent = document.getElementById('meetingDetailContent');

        const checkedInCount = meeting.participants.filter(p => p.checkedIn).length;

        detailContent.innerHTML = `
          <div style="background: var(--primary-gradient); padding: 2rem; border-radius: var(--radius-lg); margin-bottom: 1.5rem; color: white;">
            <h2 style="margin: 0 0 0.5rem 0; font-size: 2rem;">${meeting.title}</h2>
            <p style="margin: 0; opacity: 0.9;">${meeting.description || 'No description provided'}</p>
            ${meeting.meetingLink ? `
              <div style="margin-top: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                <a href="${meeting.meetingLink}" target="_blank" rel="noopener noreferrer" 
                   style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); color: white; text-decoration: none; border-radius: var(--radius-full); font-weight: 600; transition: all 0.2s ease; border: 2px solid rgba(255,255,255,0.3);"
                   onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='translateY(-2px)'"
                   onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='translateY(0)'">
                  <span style="font-size: 1.2rem;">🔗</span>
                  <span>Join Meeting</span>
                  <span style="font-size: 0.875rem;">↗</span>
                </a>
              </div>
            ` : ''}
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1.5rem; border-radius: var(--radius-lg); color: white;">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">📅</div>
              <div style="font-size: 0.875rem; opacity: 0.9;">Scheduled</div>
              <div style="font-size: 1.25rem; font-weight: 600;">${new Date(meeting.scheduledTime).toLocaleDateString()}</div>
              <div style="font-size: 0.875rem; opacity: 0.9;">${new Date(meeting.scheduledTime).toLocaleTimeString()}</div>
            </div>
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 1.5rem; border-radius: var(--radius-lg); color: white;">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏱️</div>
              <div style="font-size: 0.875rem; opacity: 0.9;">Duration</div>
              <div style="font-size: 1.25rem; font-weight: 600;">${meeting.duration}</div>
              <div style="font-size: 0.875rem; opacity: 0.9;">minutes</div>
            </div>
            <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 1.5rem; border-radius: var(--radius-lg); color: white;">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">👥</div>
              <div style="font-size: 0.875rem; opacity: 0.9;">Attendance</div>
              <div style="font-size: 1.25rem; font-weight: 600;">${checkedInCount}/${meeting.participants.length}</div>
              <div style="font-size: 0.875rem; opacity: 0.9;">checked in</div>
            </div>
            <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 1.5rem; border-radius: var(--radius-lg); color: white;">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">📊</div>
              <div style="font-size: 0.875rem; opacity: 0.9;">Status</div>
              <div style="font-size: 1.25rem; font-weight: 600; text-transform: uppercase;">${meeting.status}</div>
            </div>
          </div>

          <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); margin-bottom: 1rem;">
            <h3 style="margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem; justify-content: space-between;">
              <span style="display: flex; align-items: center; gap: 0.5rem;">
                <span>👥</span> Participants
              </span>
              <div id="add-participant-btn-${meeting.id}"></div>
            </h3>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${meeting.participants.map(p => {
                const username = p.username || p.userId;
                const initial = username.charAt(0).toUpperCase();
                const isCurrentUser = p.userId === currentUser.id;
                return `
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: ${p.checkedIn ? 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)' : '#f8f9fa'}; border-radius: var(--radius-md); border: 2px solid ${p.checkedIn ? '#96e6a1' : '#e0e0e0'};">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                      <div style="width: 40px; height: 40px; border-radius: var(--radius-full); background: var(--primary-gradient); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600;">
                        ${initial}
                      </div>
                      <div>
                        <div style="font-weight: 600;">${username}${isCurrentUser ? ' (You)' : ''}</div>
                        ${p.checkedIn && p.checkedInAt ? `<div style="font-size: 0.875rem; color: #666;">✓ Checked in at ${new Date(p.checkedInAt).toLocaleTimeString()}</div>` : '<div style="font-size: 0.875rem; color: #999;">Not checked in yet</div>'}
                      </div>
                    </div>
                    ${p.checkedIn ? `
                      <span style="display: inline-flex; align-items: center; padding: 0.5rem 1rem; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; border-radius: var(--radius-full); font-size: 0.875rem; font-weight: 600;">✓ Checked In</span>
                    ` : isCurrentUser ? `
                      <button class="btn btn-sm" onclick="checkInToMeeting('${meeting.id}', '${p.userId}')" style="background: var(--success-gradient);">Check In Now</button>
                    ` : `
                      <span style="font-size: 0.875rem; color: #999;">⏱ Pending</span>
                    `}
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); margin-bottom: 1rem;">
            <h3 style="margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
              <span>📋</span> Agenda
            </h3>
            ${meeting.agendaItems.length > 0 ? `
              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                ${meeting.agendaItems.map((item, index) => `
                  <div style="padding: 1rem; background: ${item.isCompleted ? 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)' : '#f8f9fa'}; border-radius: var(--radius-md); border-left: 4px solid ${item.isCompleted ? '#38ef7d' : 'var(--primary-color)'};">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                      <div>
                        <span style="color: #999; font-size: 0.875rem; margin-right: 0.5rem;">#${index + 1}</span>
                        <span style="font-weight: 600; font-size: 1.1rem;">${item.title}</span>
                      </div>
                      ${item.duration ? `<span style="padding: 0.25rem 0.75rem; background: white; border-radius: var(--radius-full); font-size: 0.875rem; color: #666;">⏱ ${item.duration} min</span>` : ''}
                    </div>
                    ${item.description ? `<div style="color: #666; margin-top: 0.5rem;">${item.description}</div>` : ''}
                    ${item.isCompleted ? '<div style="color: #38ef7d; margin-top: 0.5rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;"><span>✓</span> Completed</div>' : ''}
                  </div>
                `).join('')}
              </div>
            ` : '<p style="color: #999; text-align: center; padding: 2rem;">No agenda items defined</p>'}
          </div>

          <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); margin-bottom: 1rem;">
            <h3 style="margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
              <span>📄</span> Documents
            </h3>
            ${meeting.documents.length > 0 ? `
              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                ${meeting.documents.map(doc => `
                  <div style="padding: 1rem; background: #f8f9fa; border-radius: var(--radius-md); border: 1px solid #e0e0e0;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
                      <span style="font-weight: 600; font-size: 1.1rem;">${doc.title}</span>
                      <span style="padding: 0.25rem 0.75rem; background: var(--primary-gradient); color: white; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">${doc.type}</span>
                    </div>
                    <div style="color: #666; line-height: 1.6; margin-bottom: 0.75rem;">${doc.content}</div>
                    <div style="font-size: 0.875rem; color: #999;">Created by ${doc.createdByUsername || doc.createdBy} • ${new Date(doc.createdAt).toLocaleString()}</div>
                  </div>
                `).join('')}
              </div>
            ` : '<p style="color: #999; text-align: center; padding: 2rem;">No documents yet</p>'}
          </div>

          ${meeting.flaggedForDeletion ? `
            <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); padding: 1.5rem; border-radius: var(--radius-lg); margin-bottom: 1rem; color: white; display: flex; align-items: center; gap: 1rem;">
              <div style="font-size: 2rem;">⚠️</div>
              <div style="flex: 1;">
                <div style="font-weight: 600; font-size: 1.1rem; margin-bottom: 0.25rem;">Flagged for Deletion</div>
                <div style="opacity: 0.9; font-size: 0.875rem;">This meeting has been flagged for deletion${meeting.flaggedByUsername ? ` by ${meeting.flaggedByUsername}` : (meeting.flaggedBy ? ` by ${meeting.flaggedBy}` : '')}${meeting.flaggedAt ? ` on ${new Date(meeting.flaggedAt).toLocaleDateString()}` : ''}. Only admins can delete this meeting.</div>
              </div>
            </div>
          ` : ''}

          <div id="meeting-actions-${meeting.id}" style="display: flex; gap: 1rem; justify-content: flex-end; padding-top: 1rem; border-top: 1px solid #e0e0e0;"></div>
        `;

        // Load actions based on user permissions
        loadMeetingActions(meeting.id, meeting.flaggedForDeletion);
        
        // Load add participant button if user has permission
        loadAddParticipantButton(meeting.id, meeting.createdBy);

        detailModal.classList.add('active');
      }
    } catch (error) {
      console.error('Failed to load meeting details:', error);
      showToast('Unable to load meeting details', 'error', 'Load Failed');
    }
  };

  // Load meeting actions based on permissions
  async function loadMeetingActions(meetingId, isFlagged) {
    if (!currentUser) return;

    const actionsContainer = document.getElementById(`meeting-actions-${meetingId}`);
    if (!actionsContainer) return;

    try {
      // Get user's organization to check if admin
      const orgResponse = await fetch(`${API_URL}/organizations/user/${currentUser.id}`);
      const orgData = await orgResponse.json();

      if (!orgData.success || !orgData.data || orgData.data.length === 0) {
        actionsContainer.innerHTML = '<p style="color: #999; font-size: 0.875rem;">No actions available</p>';
        return;
      }

      const org = orgData.data[0];
      const isAdmin = org.adminIds.includes(currentUser.id);

      let buttonsHtml = '';

      if (isAdmin) {
        // Admins can delete and unflag
        buttonsHtml += `<button class="btn btn-danger" onclick="deleteMeeting('${meetingId}')">🗑 Delete Meeting</button>`;
        if (isFlagged) {
          buttonsHtml += `<button class="btn btn-secondary" onclick="unflagMeeting('${meetingId}')">Remove Flag</button>`;
        }
      } else {
        // Regular users can only flag
        if (!isFlagged) {
          buttonsHtml += `<button class="btn btn-secondary" onclick="flagMeeting('${meetingId}')">🚩 Flag for Deletion</button>`;
        } else {
          buttonsHtml += '<span style="color: #999; font-size: 0.875rem;">This meeting is flagged. Only admins can delete it.</span>';
        }
      }

      actionsContainer.innerHTML = buttonsHtml;
    } catch (error) {
      console.error('Failed to load meeting actions:', error);
      actionsContainer.innerHTML = '';
    }
  }

  // Load add participant button based on permissions
  async function loadAddParticipantButton(meetingId, createdBy) {
    if (!currentUser) return;

    const buttonContainer = document.getElementById(`add-participant-btn-${meetingId}`);
    if (!buttonContainer) return;

    try {
      // Check if current user is the creator
      const isCreator = createdBy === currentUser.id;

      // Check if current user is an admin
      let isAdmin = false;
      const orgResponse = await fetch(`${API_URL}/organizations/user/${currentUser.id}`);
      const orgData = await orgResponse.json();
      if (orgData.success && orgData.data && orgData.data.length > 0) {
        const org = orgData.data[0];
        isAdmin = org.adminIds.includes(currentUser.id);
      }

      // Show button only if creator or admin
      if (isCreator || isAdmin) {
        buttonContainer.innerHTML = `
          <button class="btn btn-sm" onclick="showAddParticipantModal('${meetingId}')" style="font-size: 0.875rem;">
            ➕ Add Participant
          </button>
        `;
      }
    } catch (error) {
      console.error('Failed to load add participant button:', error);
    }
  }

  // Show modal to add participant
  window.showAddParticipantModal = async function(meetingId) {
    // Load organization members
    try {
      const orgResponse = await fetch(`${API_URL}/organizations/user/${currentUser.id}`);
      const orgData = await orgResponse.json();
      
      if (!orgData.success || !orgData.data || orgData.data.length === 0) {
        showToast('You must be in an organization to add participants', 'warning', 'No Organization');
        return;
      }

      const org = orgData.data[0];
      
      // Get current meeting to check existing participants
      const meetingResponse = await fetch(`${API_URL}/meetings/${meetingId}`);
      const meetingData = await meetingResponse.json();
      
      if (!meetingData.success) {
        showToast('Failed to load meeting', 'error', 'Error');
        return;
      }

      const existingParticipantIds = meetingData.data.participants.map(p => p.userId);

      // Fetch usernames for members
      const memberPromises = org.memberIds.map(async (userId) => {
        try {
          const userResponse = await fetch(`${API_URL}/auth/user/${userId}`);
          const userData = await userResponse.json();
          return {
            id: userId,
            username: userData.data?.username || 'Unknown User',
            isAlreadyParticipant: existingParticipantIds.includes(userId)
          };
        } catch {
          return { id: userId, username: 'Unknown User', isAlreadyParticipant: existingParticipantIds.includes(userId) };
        }
      });

      const members = await Promise.all(memberPromises);
      const availableMembers = members.filter(m => !m.isAlreadyParticipant);

      if (availableMembers.length === 0) {
        showToast('All organization members are already participants', 'info', 'No Available Members');
        return;
      }

      // Create a simple selection UI
      const membersHtml = availableMembers.map(member => `
        <div style="padding: 0.75rem; background: white; border-radius: var(--radius-md); border: 1px solid var(--border-color); cursor: pointer; transition: all 0.2s;"
             onclick="addParticipantToMeeting('${meetingId}', '${member.id}')"
             onmouseover="this.style.background='var(--gray-50)'; this.style.borderColor='var(--primary-color)'"
             onmouseout="this.style.background='white'; this.style.borderColor='var(--border-color)'">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 32px; height: 32px; border-radius: var(--radius-full); background: var(--primary-gradient); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.875rem;">
              ${member.username.charAt(0).toUpperCase()}
            </div>
            <div style="font-weight: 600;">${member.username}</div>
          </div>
        </div>
      `).join('');

      // Show in a toast-like notification with longer duration
      const container = document.getElementById('toastContainer');
      if (!container) return;

      const modal = document.createElement('div');
      modal.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); max-width: 500px; max-height: 600px; overflow-y: auto; z-index: 10000; width: 90%;';
      modal.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3 style="margin: 0;">Add Participant</h3>
          <button onclick="this.parentElement.parentElement.remove(); document.getElementById('modal-backdrop').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-secondary);">&times;</button>
        </div>
        <p style="margin-bottom: 1rem; color: var(--text-secondary);">Select a member to add to this meeting:</p>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          ${membersHtml}
        </div>
      `;

      // Add backdrop
      const backdrop = document.createElement('div');
      backdrop.id = 'modal-backdrop';
      backdrop.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999;';
      backdrop.onclick = () => {
        modal.remove();
        backdrop.remove();
      };

      document.body.appendChild(backdrop);
      document.body.appendChild(modal);
    } catch (error) {
      console.error('Failed to show add participant modal:', error);
      showToast('Unable to load participants', 'error', 'Error');
    }
  };

  // Add participant to meeting
  window.addParticipantToMeeting = async function(meetingId, userId) {
    if (!currentUser) return;

    try {
      const response = await fetch(`${API_URL}/meetings/${meetingId}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, requesterId: currentUser.id }),
      });

      const data = await response.json();

      if (data.success) {
        showToast('Participant added successfully!', 'success', 'Success');
        // Close modal
        document.getElementById('modal-backdrop')?.remove();
        document.querySelectorAll('div').forEach(el => {
          if (el.style.cssText.includes('position: fixed') && el.style.cssText.includes('transform: translate(-50%, -50%)')) {
            el.remove();
          }
        });
        // Refresh meeting details
        await viewMeetingDetails(meetingId);
      } else {
        showToast(data.message || 'Failed to add participant', 'error', 'Error');
      }
    } catch (error) {
      console.error('Add participant error:', error);
      showToast('Unable to add participant', 'error', 'Error');
    }
  };

  // Flag meeting for deletion
  window.flagMeeting = async function(meetingId) {
    if (!currentUser) return;

    if (!confirm('Are you sure you want to flag this meeting for deletion? An admin will need to approve the deletion.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/meetings/${meetingId}/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      });

      const data = await response.json();

      if (data.success) {
        showToast('Meeting flagged for deletion', 'success', 'Flagged');
        await viewMeetingDetails(meetingId); // Refresh
        await loadUserData(); // Refresh list
      } else {
        showToast(data.message || 'Failed to flag meeting', 'error', 'Error');
      }
    } catch (error) {
      console.error('Flag meeting error:', error);
      showToast('Unable to flag meeting', 'error', 'Error');
    }
  };

  // Unflag meeting
  window.unflagMeeting = async function(meetingId) {
    try {
      const response = await fetch(`${API_URL}/meetings/${meetingId}/unflag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        showToast('Flag removed from meeting', 'success', 'Unflagged');
        await viewMeetingDetails(meetingId); // Refresh
        await loadUserData(); // Refresh list
      } else {
        showToast(data.message || 'Failed to unflag meeting', 'error', 'Error');
      }
    } catch (error) {
      console.error('Unflag meeting error:', error);
      showToast('Unable to unflag meeting', 'error', 'Error');
    }
  };

  // Delete meeting (admin only)
  window.deleteMeeting = async function(meetingId) {
    if (!currentUser) return;

    if (!confirm('Are you sure you want to permanently delete this meeting? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/meetings/${meetingId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requesterId: currentUser.id }),
      });

      const data = await response.json();

      if (data.success) {
        showToast('Meeting deleted successfully', 'success', 'Deleted');
        closeMeetingDetailModal();
        await loadUserData(); // Refresh list
      } else {
        showToast(data.message || 'Failed to delete meeting', 'error', 'Error');
      }
    } catch (error) {
      console.error('Delete meeting error:', error);
      showToast('Unable to delete meeting', 'error', 'Error');
    }
  };

  // Check in to meeting
  window.checkInToMeeting = async function(meetingId, userId) {
    if (!currentUser || userId !== currentUser.id) {
      showToast('You can only check in for yourself', 'warning', 'Invalid Action');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/meetings/${meetingId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        showToast('Checked in successfully!', 'success', 'Check-in Complete');
        // Refresh the meeting details view
        await viewMeetingDetails(meetingId);
        // Also refresh the meetings list
        await loadUserData();
      } else {
        showToast(data.message || 'Failed to check in', 'error', 'Check-in Failed');
      }
    } catch (error) {
      console.error('Check in error:', error);
      showToast('Unable to check in', 'error', 'Check-in Failed');
    }
  };

  // Create task button
  const createTaskBtn = document.getElementById('createTaskBtn');
  if (createTaskBtn) {
    createTaskBtn.addEventListener('click', () => {
      if (!currentUser) {
        showToast('Please login first to create tasks', 'warning', 'Authentication Required');
        return;
      }
      showToast('Task creation feature coming soon!', 'info', 'Coming Soon');
    });
  }

  // Add empty state button listeners
  const createEventBtnEmpty = document.getElementById('createEventBtnEmpty');
  const createMeetingBtnEmpty = document.getElementById('createMeetingBtnEmpty');
  const createTaskBtnEmpty = document.getElementById('createTaskBtnEmpty');
  const createOrganizationBtn = document.getElementById('createOrganizationBtn');
  const createOrganizationBtnEmpty = document.getElementById('createOrganizationBtnEmpty');

  if (createEventBtnEmpty) {
    createEventBtnEmpty.addEventListener('click', () => openEventModal());
  }
  if (createMeetingBtnEmpty) {
    createMeetingBtnEmpty.addEventListener('click', () => openMeetingModal());
  }
  if (createTaskBtnEmpty) {
    createTaskBtnEmpty.addEventListener('click', () => {
      showToast('Task creation feature coming soon!', 'info', 'Coming Soon');
    });
  }
  if (createOrganizationBtn) {
    createOrganizationBtn.addEventListener('click', () => openOrganizationModal());
  }
  if (createOrganizationBtnEmpty) {
    createOrganizationBtnEmpty.addEventListener('click', () => openOrganizationModal());
  }
});

// Global modal control functions
window.openEventModal = function() {
  const modal = document.getElementById('eventModal');
  if (modal) {
    modal.classList.add('active');
    document.getElementById('eventForm').reset();
    eventParticipants = [];
    eventParticipantUsernames = {};
    document.getElementById('eventParticipantsList').innerHTML = '';
    document.getElementById('eventParticipantSearchResults').style.display = 'none';
    
    // Set default end date to 1 hour after start when start changes
    const startInput = document.querySelector('[name="startDate"]');
    const endInput = document.querySelector('[name="endDate"]');
    if (startInput && endInput) {
      startInput.addEventListener('change', function() {
        if (!endInput.value && startInput.value) {
          const startDate = new Date(startInput.value);
          startDate.setHours(startDate.getHours() + 1);
          endInput.value = startDate.toISOString().slice(0, 16);
        }
      });
    }
  }
};

window.closeEventModal = function() {
  const modal = document.getElementById('eventModal');
  if (modal) {
    modal.classList.remove('active');
  }
};

window.submitEventForm = async function() {
  const form = document.getElementById('eventForm');
  const formData = new FormData(form);
  
  const startDate = formData.get('startDate');
  const endDate = formData.get('endDate');

  if (!startDate || !endDate) {
    showToast('Please select both start and end dates', 'warning', 'Missing Information');
    return;
  }

  if (new Date(endDate) < new Date(startDate)) {
    showToast('End date must be after start date', 'warning', 'Invalid Date Range');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organizerId: currentUser.id,
        title: formData.get('title'),
        description: formData.get('description'),
        location: formData.get('location'),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Add participants if any
      if (eventParticipants.length > 0) {
        const eventId = data.data.id;
        for (const participantId of eventParticipants) {
          await fetch(`${API_URL}/events/${eventId}/participants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: participantId }),
          });
        }
      }

      showToast('Event created successfully!', 'success', 'Event Created');
      closeEventModal();
      loadUserData();
    } else {
      showToast(data.message || 'Failed to create event', 'error', 'Creation Failed');
    }
  } catch (error) {
    console.error('Create event error:', error);
    showToast('Unable to create event', 'error', 'Creation Failed');
  }
};

window.openMeetingModal = function() {
  const modal = document.getElementById('meetingModal');
  if (modal) {
    modal.classList.add('active');
    document.getElementById('meetingForm').reset();
    meetingParticipants = [];
    meetingParticipantUsernames = {};
    agendaItems = [];
    document.getElementById('participantsList').innerHTML = '';
    document.getElementById('agendaItemsList').innerHTML = '';
    document.getElementById('meetingParticipantSearchResults').style.display = 'none';
    loadEventsToSelect();
  }
};

window.closeMeetingModal = function() {
  const modal = document.getElementById('meetingModal');
  if (modal) {
    modal.classList.remove('active');
  }
};

window.submitMeetingForm = async function() {
  const form = document.getElementById('meetingForm');
  const formData = new FormData(form);

  // Get selected event (optional now)
  const eventId = formData.get('eventId') || undefined;

  // Get document templates
  const createNotes = formData.get('createNotes') === 'notes';
  const createMinutes = formData.get('createMinutes') === 'minutes';
  const createProtocol = formData.get('createProtocol') === 'protocol';

  const meetingData = {
    title: formData.get('title'),
    description: formData.get('description') || '',
    eventId: eventId, // Optional: can be undefined for independent meetings
    scheduledTime: new Date(formData.get('scheduledTime')),
    duration: parseInt(formData.get('duration')),
    meetingLink: formData.get('meetingLink') || undefined,
    createdBy: currentUser.id,
    organizerId: currentUser.id,
    participants: meetingParticipants,
    agendaItems: agendaItems,
    documents: []
  };

  // Add document templates
  if (createNotes) {
    meetingData.documents.push({
      type: 'notes',
      content: `Meeting Notes for: ${meetingData.title}\n\nDate: ${new Date().toLocaleDateString()}\n\n`
    });
  }
  if (createMinutes) {
    meetingData.documents.push({
      type: 'minutes',
      content: `Meeting Minutes\n\nTitle: ${meetingData.title}\nDate: ${new Date().toLocaleDateString()}\n\n`
    });
  }
  if (createProtocol) {
    meetingData.documents.push({
      type: 'protocol',
      content: `Meeting Protocol\n\nTitle: ${meetingData.title}\nDate: ${new Date().toLocaleDateString()}\n\n`
    });
  }

  try {
    const response = await fetch(`${API_URL}/meetings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meetingData),
    });

    const data = await response.json();

    if (data.success) {
      showToast('Meeting created successfully!', 'success', 'Meeting Created');
      closeMeetingModal();
      loadUserData();
    } else {
      showToast(data.message || 'Failed to create meeting', 'error', 'Creation Failed');
    }
  } catch (error) {
    console.error('Create meeting error:', error);
    showToast('Unable to create meeting', 'error', 'Creation Failed');
  }
};

window.closeMeetingDetailModal = function() {
  const modal = document.getElementById('meetingDetailModal');
  if (modal) {
    modal.classList.remove('active');
  }
};

// View event details
window.viewEvent = async function(eventId) {
  try {
    const response = await fetch(`${API_URL}/events/${eventId}`);
    const data = await response.json();

    if (data.success && data.data) {
      const event = data.data;
      const modal = document.getElementById('eventDetailModal');
      const content = document.getElementById('eventDetailContent');

      if (!modal || !content) return;

      // Format dates
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      const duration = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));

      content.innerHTML = `
        <div class="event-detail-header" style="background: var(--primary-gradient); padding: 2rem; border-radius: var(--radius-lg); margin-bottom: 1.5rem; color: white;">
          <h2 style="margin: 0 0 0.5rem 0; font-size: 2rem;">${event.title}</h2>
          <p style="margin: 0; opacity: 0.9;">${event.description || 'No description provided'}</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
          <div class="meta-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1.5rem; border-radius: var(--radius-lg); color: white;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">📅</div>
            <div style="font-size: 0.875rem; opacity: 0.9;">Start Date</div>
            <div style="font-size: 1.25rem; font-weight: 600;">${startDate.toLocaleDateString()}</div>
            <div style="font-size: 0.875rem; opacity: 0.9;">${startDate.toLocaleTimeString()}</div>
          </div>

          <div class="meta-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 1.5rem; border-radius: var(--radius-lg); color: white;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🏁</div>
            <div style="font-size: 0.875rem; opacity: 0.9;">End Date</div>
            <div style="font-size: 1.25rem; font-weight: 600;">${endDate.toLocaleDateString()}</div>
            <div style="font-size: 0.875rem; opacity: 0.9;">${endDate.toLocaleTimeString()}</div>
          </div>

          <div class="meta-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 1.5rem; border-radius: var(--radius-lg); color: white;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏱️</div>
            <div style="font-size: 0.875rem; opacity: 0.9;">Duration</div>
            <div style="font-size: 1.25rem; font-weight: 600;">${duration} ${duration === 1 ? 'Day' : 'Days'}</div>
          </div>

          <div class="meta-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 1.5rem; border-radius: var(--radius-lg); color: white;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">📊</div>
            <div style="font-size: 0.875rem; opacity: 0.9;">Status</div>
            <div style="font-size: 1.25rem; font-weight: 600;">${event.status}</div>
          </div>
        </div>

        <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); margin-bottom: 1rem;">
          <h3 style="margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
            <span>📍</span> Location
          </h3>
          <p style="margin: 0; color: var(--text-secondary);">${event.location || 'No location specified'}</p>
        </div>

        <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
          <h3 style="margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
            <span>👥</span> Participants
          </h3>
          <div style="color: var(--text-secondary);">
            ${event.participants.length} participant(s)
          </div>
        </div>

        <div style="margin-top: 1.5rem; display: flex; gap: 1rem; justify-content: flex-end;">
          <button class="btn btn-secondary" onclick="closeEventDetailModal()">Close</button>
          <button class="btn" onclick="closeEventDetailModal(); editEvent('${event.id}')">Edit Event</button>
        </div>
      `;

      // Add scroll indicator
      const scrollIndicator = document.createElement('div');
      scrollIndicator.className = 'modal-scroll-indicator';
      scrollIndicator.id = 'eventScrollIndicator';
      scrollIndicator.innerHTML = '<div class="scroll-arrow">↓</div>';
      content.appendChild(scrollIndicator);

      // Handle scroll indicator visibility
      const modalBody = content.parentElement;
      const updateScrollIndicator = () => {
        const isScrollable = modalBody.scrollHeight > modalBody.clientHeight;
        const isAtBottom = modalBody.scrollHeight - modalBody.scrollTop <= modalBody.clientHeight + 10;
        
        if (!isScrollable || isAtBottom) {
          scrollIndicator.classList.add('hidden');
        } else {
          scrollIndicator.classList.remove('hidden');
        }
      };

      modalBody.addEventListener('scroll', updateScrollIndicator);
      setTimeout(updateScrollIndicator, 100); // Initial check

      modal.classList.add('active');
    } else {
      showToast('Event not found', 'error', 'Error');
    }
  } catch (error) {
    console.error('View event error:', error);
    showToast('Unable to load event details', 'error', 'Error');
  }
};

// Close event detail modal
window.closeEventDetailModal = function() {
  const modal = document.getElementById('eventDetailModal');
  if (modal) {
    modal.classList.remove('active');
  }
};

// Edit event
window.editEvent = async function(eventId) {
  try {
    const response = await fetch(`${API_URL}/events/${eventId}`);
    const data = await response.json();

    if (data.success && data.data) {
      const event = data.data;
      const modal = document.getElementById('eventModal');
      const form = document.getElementById('eventForm');
      
      if (!modal || !form) return;

      // Update modal title
      const modalHeader = modal.querySelector('.modal-header h2');
      if (modalHeader) {
        modalHeader.textContent = 'Edit Event';
      }

      // Update submit button
      const modalFooter = modal.querySelector('.modal-footer');
      if (modalFooter) {
        modalFooter.innerHTML = `
          <button class="btn btn-secondary" onclick="closeEventModal(); resetEventModal()">Cancel</button>
          <button class="btn" onclick="updateEventForm('${eventId}')">Update Event</button>
        `;
      }

      // Populate form with event data
      form.elements['title'].value = event.title;
      form.elements['description'].value = event.description || '';
      form.elements['location'].value = event.location || '';
      
      // Format dates for datetime-local input
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      form.elements['startDate'].value = startDate.toISOString().slice(0, 16);
      form.elements['endDate'].value = endDate.toISOString().slice(0, 16);

      // Load participants with usernames
      eventParticipants = [...event.participants];
      eventParticipantUsernames = {};
      
      // Fetch usernames for existing participants
      for (const participantId of eventParticipants) {
        try {
          const userResponse = await fetch(`${API_URL}/auth/user/${participantId}`);
          const userData = await userResponse.json();
          eventParticipantUsernames[participantId] = userData.data?.username || 'Unknown User';
        } catch {
          eventParticipantUsernames[participantId] = 'Unknown User';
        }
      }
      
      renderEventParticipants();

      modal.classList.add('active');
    } else {
      showToast('Event not found', 'error', 'Error');
    }
  } catch (error) {
    console.error('Edit event error:', error);
    showToast('Unable to load event for editing', 'error', 'Error');
  }
};

// Update event form submission
window.updateEventForm = async function(eventId) {
  const form = document.getElementById('eventForm');
  const formData = new FormData(form);
  
  const startDate = formData.get('startDate');
  const endDate = formData.get('endDate');

  if (!startDate || !endDate) {
    showToast('Please select both start and end dates', 'warning', 'Missing Information');
    return;
  }

  if (new Date(endDate) < new Date(startDate)) {
    showToast('End date must be after start date', 'warning', 'Invalid Date Range');
    return;
  }

  try {
    // Update event details
    const response = await fetch(`${API_URL}/events/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.get('title'),
        description: formData.get('description'),
        location: formData.get('location'),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Get current event to compare participants
      const eventResponse = await fetch(`${API_URL}/events/${eventId}`);
      const eventData = await eventResponse.json();
      
      if (eventData.success && eventData.data) {
        const currentParticipants = eventData.data.participants;
        
        // Add new participants
        const participantsToAdd = eventParticipants.filter(p => !currentParticipants.includes(p));
        for (const participantId of participantsToAdd) {
          await fetch(`${API_URL}/events/${eventId}/participants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: participantId }),
          });
        }
        
        // Remove participants that were deleted
        const participantsToRemove = currentParticipants.filter(p => !eventParticipants.includes(p));
        for (const participantId of participantsToRemove) {
          await fetch(`${API_URL}/events/${eventId}/participants/${participantId}`, {
            method: 'DELETE',
          });
        }
      }

      showToast('Event updated successfully!', 'success', 'Event Updated');
      closeEventModal();
      resetEventModal();
      loadUserData();
    } else {
      showToast(data.message || 'Failed to update event', 'error', 'Update Failed');
    }
  } catch (error) {
    console.error('Update event error:', error);
    showToast('Unable to update event', 'error', 'Update Failed');
  }
};

// Reset event modal to create mode
window.resetEventModal = function() {
  const modal = document.getElementById('eventModal');
  if (!modal) return;

  // Reset modal title
  const modalHeader = modal.querySelector('.modal-header h2');
  if (modalHeader) {
    modalHeader.textContent = 'Create Event';
  }

  // Reset submit button
  const modalFooter = modal.querySelector('.modal-footer');
  if (modalFooter) {
    modalFooter.innerHTML = `
      <button class="btn btn-secondary" onclick="closeEventModal()">Cancel</button>
      <button class="btn" onclick="submitEventForm()">Create Event</button>
    `;
  }

  // Clear form
  const form = document.getElementById('eventForm');
  if (form) {
    form.reset();
  }
};

// Helper function to load events into select
async function loadEventsToSelect() {
  if (!currentUser) return;

  try {
    const response = await fetch(`${API_URL}/events/user/${currentUser.id}`);
    const data = await response.json();

    const select = document.getElementById('meetingEventSelect');
    if (select && data.success && data.data) {
      select.innerHTML = '<option value="">-- Select an Event --</option>';
      data.data.forEach(event => {
        const option = document.createElement('option');
        option.value = event.id;
        option.textContent = `${event.title} (${new Date(event.startDate).toLocaleDateString()})`;
        select.appendChild(option);
      });
      
      if (data.data.length === 0) {
        select.innerHTML = '<option value="">No events available - Create an event first</option>';
      }
    }
  } catch (error) {
    console.error('Failed to load events:', error);
    showToast('Failed to load events', 'error', 'Error');
  }
}

// ============================================
// ORGANIZATION MANAGEMENT
// ============================================

// Open organization modal
window.openOrganizationModal = function() {
  const modal = document.getElementById('organizationModal');
  if (modal) {
    modal.classList.add('active');
    document.getElementById('organizationForm').reset();
  }
};

// Close organization modal
window.closeOrganizationModal = function() {
  const modal = document.getElementById('organizationModal');
  if (modal) {
    modal.classList.remove('active');
  }
};

// Submit organization form
window.submitOrganizationForm = async function() {
  const form = document.getElementById('organizationForm');
  const formData = new FormData(form);

  const organizationData = {
    creatorId: currentUser.id,
    name: formData.get('name'),
    description: formData.get('description') || '',
    website: formData.get('website') || '',
    logo: formData.get('logo') || '',
    settings: {
      allowMemberCreateEvents: formData.get('allowMemberCreateEvents') === 'on',
      allowMemberInviteUsers: formData.get('allowMemberInviteUsers') === 'on',
      requireEventApproval: formData.get('requireEventApproval') === 'on',
      timezone: formData.get('timezone') || 'UTC',
    }
  };

  try {
    const response = await fetch(`${API_URL}/organizations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(organizationData),
    });

    const data = await response.json();

    if (data.success) {
      showToast('Organization created successfully!', 'success', 'Organization Created');
      closeOrganizationModal();
      loadOrganizationData();
    } else {
      showToast(data.message || 'Failed to create organization', 'error', 'Creation Failed');
    }
  } catch (error) {
    console.error('Create organization error:', error);
    showToast('Unable to create organization', 'error', 'Creation Failed');
  }
};

// Load organization data
async function loadOrganizationData() {
  if (!currentUser) return;

  try {
    const response = await fetch(`${API_URL}/organizations/user/${currentUser.id}`);
    const data = await response.json();

    const content = document.getElementById('organizationContent');
    const empty = document.getElementById('organizationEmpty');
    const createBtn = document.getElementById('createOrganizationBtn');

    if (data.success && data.data && data.data.length > 0) {
      const org = data.data[0]; // Get first organization
      empty.style.display = 'none';
      content.style.display = 'block';
      createBtn.style.display = 'none';

      content.innerHTML = `
        <div class="card" style="margin-bottom: 2rem;">
          <div style="background: var(--primary-gradient); padding: 2rem; border-radius: var(--radius-lg) var(--radius-lg) 0 0; color: white;">
            <div style="display: flex; align-items: center; gap: 1.5rem;">
              ${org.logo ? `<img src="${org.logo}" alt="${org.name}" style="width: 80px; height: 80px; border-radius: var(--radius-lg); background: white; padding: 0.5rem;">` : `<div style="width: 80px; height: 80px; border-radius: var(--radius-lg); background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 2.5rem;">🏢</div>`}
              <div>
                <h2 style="margin: 0 0 0.5rem 0; font-size: 2rem;">${org.name}</h2>
                <p style="margin: 0; opacity: 0.9;">${org.description || 'No description'}</p>
                ${org.website ? `<a href="${org.website}" target="_blank" style="color: white; opacity: 0.9; text-decoration: none; font-size: 0.875rem;">🔗 ${org.website}</a>` : ''}
              </div>
            </div>
          </div>

          <div style="padding: 2rem;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
              <div style="background: var(--gray-50); padding: 1.5rem; border-radius: var(--radius-lg);">
                <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">👥</div>
                <div style="font-size: 0.875rem; color: var(--text-secondary);">Members</div>
                <div style="font-size: 1.5rem; font-weight: 600;">${org.memberIds.length}</div>
              </div>
              <div style="background: var(--gray-50); padding: 1.5rem; border-radius: var(--radius-lg);">
                <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">⭐</div>
                <div style="font-size: 0.875rem; color: var(--text-secondary);">Admins</div>
                <div style="font-size: 1.5rem; font-weight: 600;">${org.adminIds.length}</div>
              </div>
              <div style="background: var(--gray-50); padding: 1.5rem; border-radius: var(--radius-lg);">
                <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🌍</div>
                <div style="font-size: 0.875rem; color: var(--text-secondary);">Timezone</div>
                <div style="font-size: 1.125rem; font-weight: 600;">${org.settings.timezone}</div>
              </div>
            </div>

            <h3 style="margin: 0 0 1rem 0;">Settings</h3>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; background: ${org.settings.allowMemberCreateEvents ? 'rgba(67, 233, 123, 0.1)' : 'var(--gray-50)'}; border-radius: var(--radius-md);">
                <span>${org.settings.allowMemberCreateEvents ? '✅' : '❌'}</span>
                <span>Members can create events</span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; background: ${org.settings.allowMemberInviteUsers ? 'rgba(67, 233, 123, 0.1)' : 'var(--gray-50)'}; border-radius: var(--radius-md);">
                <span>${org.settings.allowMemberInviteUsers ? '✅' : '❌'}</span>
                <span>Members can invite users</span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; background: ${org.settings.requireEventApproval ? 'rgba(67, 233, 123, 0.1)' : 'var(--gray-50)'}; border-radius: var(--radius-md);">
                <span>${org.settings.requireEventApproval ? '✅' : '❌'}</span>
                <span>Event approval required</span>
              </div>
            </div>

            <div style="margin-top: 2rem; display: flex; gap: 1rem;">
              <button class="btn btn-secondary" onclick="editOrganization('${org.id}')">Edit Organization</button>
              <button class="btn" onclick="manageMembers('${org.id}')">Manage Members</button>
            </div>
          </div>
        </div>
      `;
    } else {
      empty.style.display = 'block';
      content.style.display = 'none';
      createBtn.style.display = 'inline-block';
    }
  } catch (error) {
    console.error('Failed to load organization:', error);
  }
}

// Edit organization
window.editOrganization = async function(orgId) {
  try {
    const response = await fetch(`${API_URL}/organizations/${orgId}`);
    const data = await response.json();

    if (data.success && data.data) {
      const org = data.data;
      const modal = document.getElementById('organizationModal');
      const form = document.getElementById('organizationForm');
      
      if (!modal || !form) return;

      // Update modal title
      const modalHeader = modal.querySelector('.modal-header h2');
      if (modalHeader) {
        modalHeader.textContent = 'Edit Organization';
      }

      // Populate form
      form.elements['name'].value = org.name;
      form.elements['description'].value = org.description || '';
      form.elements['website'].value = org.website || '';
      form.elements['logo'].value = org.logo || '';
      form.elements['allowMemberCreateEvents'].checked = org.settings.allowMemberCreateEvents;
      form.elements['allowMemberInviteUsers'].checked = org.settings.allowMemberInviteUsers;
      form.elements['requireEventApproval'].checked = org.settings.requireEventApproval;
      form.elements['timezone'].value = org.settings.timezone;

      // Update submit button
      const modalFooter = modal.querySelector('.modal-footer');
      if (modalFooter) {
        modalFooter.innerHTML = `
          <button class="btn btn-secondary" onclick="closeOrganizationModal(); resetOrganizationModal()">Cancel</button>
          <button class="btn" onclick="updateOrganizationForm('${orgId}')">Update Organization</button>
        `;
      }

      modal.classList.add('active');
    } else {
      showToast('Organization not found', 'error', 'Error');
    }
  } catch (error) {
    console.error('Edit organization error:', error);
    showToast('Unable to load organization for editing', 'error', 'Error');
  }
};

// Update organization form submission
window.updateOrganizationForm = async function(orgId) {
  const form = document.getElementById('organizationForm');
  const formData = new FormData(form);

  const updateData = {
    name: formData.get('name'),
    description: formData.get('description') || '',
    website: formData.get('website') || '',
    logo: formData.get('logo') || '',
    settings: {
      allowMemberCreateEvents: formData.get('allowMemberCreateEvents') === 'on',
      allowMemberInviteUsers: formData.get('allowMemberInviteUsers') === 'on',
      requireEventApproval: formData.get('requireEventApproval') === 'on',
      timezone: formData.get('timezone') || 'UTC',
    }
  };

  try {
    const response = await fetch(`${API_URL}/organizations/${orgId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });

    const data = await response.json();

    if (data.success) {
      showToast('Organization updated successfully!', 'success', 'Organization Updated');
      closeOrganizationModal();
      resetOrganizationModal();
      loadOrganizationData();
    } else {
      showToast(data.message || 'Failed to update organization', 'error', 'Update Failed');
    }
  } catch (error) {
    console.error('Update organization error:', error);
    showToast('Unable to update organization', 'error', 'Update Failed');
  }
};

// Reset organization modal to create mode
window.resetOrganizationModal = function() {
  const modal = document.getElementById('organizationModal');
  if (!modal) return;

  // Reset modal title
  const modalHeader = modal.querySelector('.modal-header h2');
  if (modalHeader) {
    modalHeader.textContent = 'Create Organization';
  }

  // Reset submit button
  const modalFooter = modal.querySelector('.modal-footer');
  if (modalFooter) {
    modalFooter.innerHTML = `
      <button class="btn btn-secondary" onclick="closeOrganizationModal()">Cancel</button>
      <button class="btn" onclick="submitOrganizationForm()">Create Organization</button>
    `;
  }

  // Clear form
  const form = document.getElementById('organizationForm');
  if (form) {
    form.reset();
  }
};

// Manage members
let currentOrgId = null;

window.manageMembers = async function(orgId) {
  currentOrgId = orgId;
  const modal = document.getElementById('manageMembersModal');
  if (modal) {
    modal.classList.add('active');
    await loadOrganizationMembers(orgId);
  }
};

window.closeMembersModal = function() {
  const modal = document.getElementById('manageMembersModal');
  if (modal) {
    modal.classList.remove('active');
    currentOrgId = null;
  }
};

// Load organization members
async function loadOrganizationMembers(orgId) {
  try {
    const response = await fetch(`${API_URL}/organizations/${orgId}`);
    const data = await response.json();

    if (data.success && data.data) {
      const org = data.data;
      
      // Load pending join requests
      await loadJoinRequests(orgId);
      
      const membersList = document.getElementById('membersList');
      
      if (!membersList) return;

      if (org.memberIds.length === 0) {
        membersList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No members yet</p>';
        return;
      }

      // Fetch user details for each member
      const memberPromises = org.memberIds.map(async (userId) => {
        try {
          const userResponse = await fetch(`${API_URL}/auth/user/${userId}`);
          const userData = await userResponse.json();
          return {
            id: userId,
            username: userData.data?.username || 'Unknown User',
            isAdmin: org.adminIds.includes(userId)
          };
        } catch {
          return { id: userId, username: 'Unknown User', isAdmin: org.adminIds.includes(userId) };
        }
      });

      const members = await Promise.all(memberPromises);

      // Check if current user is an admin
      const isCurrentUserAdmin = currentUser && org.adminIds.includes(currentUser.id);

      membersList.innerHTML = members.map(member => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: white; border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="width: 40px; height: 40px; border-radius: var(--radius-full); background: var(--primary-gradient); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600;">
              ${member.username.charAt(0).toUpperCase()}
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.25rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-weight: 600;">${member.username}</span>
                ${member.isAdmin ? '<span style="display: inline-flex; align-items: center; padding: 0.25rem 0.75rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">👑 Admin</span>' : ''}
              </div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); font-family: monospace;">${member.id}</div>
            </div>
          </div>
          ${isCurrentUserAdmin ? `
            <div style="display: flex; gap: 0.5rem;">
              ${!member.isAdmin ? `<button class="btn btn-sm btn-secondary" onclick="promoteToAdmin('${member.id}')">Make Admin</button>` : `<button class="btn btn-sm btn-secondary" onclick="demoteAdmin('${member.id}')">Remove Admin</button>`}
              <button class="btn btn-sm btn-danger" onclick="removeMemberFromOrg('${member.id}', '${member.username}')">Remove</button>
            </div>
          ` : ''}
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Failed to load members:', error);
    showToast('Failed to load members', 'error', 'Error');
  }
}

// Add member to organization
window.addMemberToOrg = async function() {
  if (!currentOrgId) return;

  const input = document.getElementById('newMemberUserId');
  const userId = input.value.trim();

  if (!userId) {
    showToast('Please enter a user ID', 'warning', 'Missing Information');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/organizations/${currentOrgId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    const data = await response.json();

    if (data.success) {
      showToast('Member added successfully!', 'success', 'Member Added');
      input.value = '';
      await loadOrganizationMembers(currentOrgId);
      await loadOrganizationData();
    } else {
      showToast(data.message || 'Failed to add member', 'error', 'Failed');
    }
  } catch (error) {
    console.error('Add member error:', error);
    showToast('Unable to add member', 'error', 'Error');
  }
};

// Remove member from organization
window.removeMemberFromOrg = async function(userId, username) {
  if (!currentOrgId) return;

  if (!confirm(`Are you sure you want to remove ${username} from the organization?`)) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/organizations/${currentOrgId}/members/${userId}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (data.success) {
      showToast('Member removed successfully!', 'success', 'Member Removed');
      await loadOrganizationMembers(currentOrgId);
      await loadOrganizationData();
    } else {
      showToast(data.message || 'Failed to remove member', 'error', 'Failed');
    }
  } catch (error) {
    console.error('Remove member error:', error);
    showToast('Unable to remove member', 'error', 'Error');
  }
};

// Promote user to admin
window.promoteToAdmin = async function(userId) {
  if (!currentOrgId || !currentUser) return;

  try {
    const response = await fetch(`${API_URL}/organizations/${currentOrgId}/admins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, requesterId: currentUser.id }),
    });

    const data = await response.json();

    if (data.success) {
      showToast('User promoted to admin!', 'success', 'Admin Added');
      await loadOrganizationMembers(currentOrgId);
      await loadOrganizationData();
    } else {
      showToast(data.message || 'Failed to promote user', 'error', 'Failed');
    }
  } catch (error) {
    console.error('Promote admin error:', error);
    showToast('Unable to promote user', 'error', 'Error');
  }
};

// Demote admin
window.demoteAdmin = async function(userId) {
  if (!currentOrgId || !currentUser) return;

  try {
    const response = await fetch(`${API_URL}/organizations/${currentOrgId}/admins/${userId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requesterId: currentUser.id }),
    });

    const data = await response.json();

    if (data.success) {
      showToast('Admin privileges removed!', 'success', 'Admin Removed');
      await loadOrganizationMembers(currentOrgId);
      await loadOrganizationData();
    } else {
      showToast(data.message || 'Failed to demote admin', 'error', 'Failed');
    }
  } catch (error) {
    console.error('Demote admin error:', error);
    showToast('Unable to demote admin', 'error', 'Error');
  }
};

// Load join requests for organization
async function loadJoinRequests(orgId) {
  try {
    const response = await fetch(`${API_URL}/organizations/${orgId}/join-requests`);
    const data = await response.json();

    const requestsList = document.getElementById('joinRequestsList');
    if (!requestsList) return;

    if (!data.success || !data.data || data.data.length === 0) {
      requestsList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No pending requests</p>';
      return;
    }

    // Fetch user details for each request
    const requestPromises = data.data.map(async (request) => {
      try {
        const userResponse = await fetch(`${API_URL}/auth/user/${request.userId}`);
        const userData = await userResponse.json();
        return {
          ...request,
          username: userData.data?.username || 'Unknown User',
        };
      } catch {
        return { ...request, username: 'Unknown User' };
      }
    });

    const requests = await Promise.all(requestPromises);

    requestsList.innerHTML = requests.map(request => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: var(--radius-md); border-left: 4px solid #f59e0b;">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div style="width: 40px; height: 40px; border-radius: var(--radius-full); background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600;">
            ${request.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style="font-weight: 600;">${request.username}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); font-family: monospace;">${request.userId}</div>
            <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 0.25rem;">Requested ${new Date(request.requestedAt).toLocaleDateString()}</div>
          </div>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-sm" onclick="approveJoinRequest('${request.id}')" style="background: var(--success-gradient);">✓ Approve</button>
          <button class="btn btn-sm btn-danger" onclick="rejectJoinRequest('${request.id}')">✗ Reject</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Failed to load join requests:', error);
  }
}

// Approve join request
window.approveJoinRequest = async function(requestId) {
  if (!currentUser) return;

  try {
    const response = await fetch(`${API_URL}/join-requests/${requestId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewerId: currentUser.id }),
    });

    const data = await response.json();

    if (data.success) {
      showToast('Join request approved!', 'success', 'Approved');
      if (currentOrgId) {
        await loadOrganizationMembers(currentOrgId);
      }
    } else {
      showToast(data.message || 'Failed to approve request', 'error', 'Failed');
    }
  } catch (error) {
    console.error('Approve request error:', error);
    showToast('Unable to approve request', 'error', 'Error');
  }
};

// Reject join request
window.rejectJoinRequest = async function(requestId) {
  if (!currentUser) return;

  try {
    const response = await fetch(`${API_URL}/join-requests/${requestId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewerId: currentUser.id }),
    });

    const data = await response.json();

    if (data.success) {
      showToast('Join request rejected', 'info', 'Rejected');
      if (currentOrgId) {
        await loadOrganizationMembers(currentOrgId);
      }
    } else {
      showToast(data.message || 'Failed to reject request', 'error', 'Failed');
    }
  } catch (error) {
    console.error('Reject request error:', error);
    showToast('Unable to reject request', 'error', 'Error');
  }
};

// Search for organization members to add as participants
// Debounce function for autocomplete
let eventParticipantSearchTimeout;
let organizationSearchTimeout;

window.searchEventParticipants = async function() {
  const searchInput = document.getElementById('eventParticipantSearch');
  const searchValue = searchInput.value.trim();

  const resultsContainer = document.getElementById('eventParticipantSearchResults');
  const resultsList = document.getElementById('eventParticipantResultsList');

  if (!searchValue) {
    resultsContainer.style.display = 'none';
    return;
  }

  if (!currentUser) return;

  try {
    // Get user's organizations
    const orgResponse = await fetch(`${API_URL}/organizations/user/${currentUser.id}`);
    const orgData = await orgResponse.json();

    if (!orgData.success || !orgData.data || orgData.data.length === 0) {
      resultsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 1rem;">You must be in an organization</p>';
      resultsContainer.style.display = 'block';
      return;
    }

    const org = orgData.data[0];

    // Fetch user details for all organization members
    const memberPromises = org.memberIds.map(async (userId) => {
      try {
        const userResponse = await fetch(`${API_URL}/auth/user/${userId}`);
        const userData = await userResponse.json();
        return {
          id: userId,
          username: userData.data?.username || 'Unknown User',
        };
      } catch {
        return { id: userId, username: 'Unknown User' };
      }
    });

    const members = await Promise.all(memberPromises);

    // Filter members based on search
    const results = members.filter(member => 
      member.id.toLowerCase().includes(searchValue.toLowerCase()) ||
      member.username.toLowerCase().includes(searchValue.toLowerCase())
    );

    if (results.length === 0) {
      resultsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 1rem;">No members found</p>';
      resultsContainer.style.display = 'block';
      return;
    }

    resultsList.innerHTML = results.map(member => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: white; border-radius: var(--radius-md); margin-bottom: 0.5rem; ${eventParticipants.includes(member.id) ? 'opacity: 0.5;' : ''}">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="width: 32px; height: 32px; border-radius: var(--radius-full); background: var(--primary-gradient); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.875rem;">
            ${member.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style="font-weight: 600; font-size: 0.875rem;">${member.username}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); font-family: monospace;">${member.id}</div>
          </div>
        </div>
        ${!eventParticipants.includes(member.id) 
          ? `<button type="button" class="btn btn-sm" onclick="addEventParticipantById('${member.id}', '${member.username}')">Add</button>`
          : '<span style="font-size: 0.875rem; color: var(--text-secondary);">Already added</span>'
        }
      </div>
    `).join('');

    resultsContainer.style.display = 'block';
  } catch (error) {
    console.error('Search participants error:', error);
    resultsList.innerHTML = '<p style="text-align: center; color: var(--error); padding: 1rem;">Failed to search participants</p>';
    resultsContainer.style.display = 'block';
  }
};

// Add participant by ID and username
window.addEventParticipantById = function(userId, username) {
  if (eventParticipants.includes(userId)) {
    showToast('User already added', 'warning', 'Duplicate');
    return;
  }

  eventParticipants.push(userId);
  eventParticipantUsernames[userId] = username;

  renderEventParticipants();
  
  // Clear search after adding
  const searchInput = document.getElementById('eventParticipantSearch');
  if (searchInput) searchInput.value = '';
  const resultsContainer = document.getElementById('eventParticipantSearchResults');
  if (resultsContainer) resultsContainer.style.display = 'none';
  
  showToast(`${username} added to event`, 'success', 'Participant Added');
};

// Remove participant from event
window.removeEventParticipant = function(userId) {
  eventParticipants = eventParticipants.filter(id => id !== userId);
  renderEventParticipants();
};

// Render event participants list
function renderEventParticipants() {
  const list = document.getElementById('eventParticipantsList');
  if (!list) return;

  if (eventParticipants.length === 0) {
    list.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">No participants added yet</p>';
    return;
  }

  list.innerHTML = eventParticipants.map(userId => {
    const username = eventParticipantUsernames[userId] || 'Unknown';
    return `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: white; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <div style="width: 32px; height: 32px; border-radius: var(--radius-full); background: var(--primary-gradient); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.875rem;">
          ${username.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style="font-weight: 600; font-size: 0.875rem;">${username}</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); font-family: monospace;">${userId}</div>
        </div>
      </div>
      <button class="btn btn-sm btn-danger" onclick="removeEventParticipant('${userId}')">Remove</button>
    </div>
    `;
  }).join('');
}

// Search for organization members to add as meeting participants
window.searchMeetingParticipants = async function() {
  const searchInput = document.getElementById('meetingParticipantSearch');
  const searchValue = searchInput.value.trim();

  const resultsContainer = document.getElementById('meetingParticipantSearchResults');
  
  // Hide results if no search value
  if (!searchValue) {
    resultsContainer.style.display = 'none';
    return;
  }

  if (!currentUser) return;

  try {
    // Get user's organizations
    const orgResponse = await fetch(`${API_URL}/organizations/user/${currentUser.id}`);
    const orgData = await orgResponse.json();

    if (!orgData.success || !orgData.data || orgData.data.length === 0) {
      resultsContainer.innerHTML = '<p style=\"text-align: center; color: var(--text-secondary); padding: 1rem;\">You must be in an organization</p>';
      resultsContainer.style.display = 'block';
      return;
    }

    const org = orgData.data[0];

    // Fetch user details for all organization members
    const memberPromises = org.memberIds.map(async (userId) => {
      try {
        const userResponse = await fetch(`${API_URL}/auth/user/${userId}`);
        const userData = await userResponse.json();
        return {
          id: userId,
          username: userData.data?.username || 'Unknown User',
        };
      } catch {
        return { id: userId, username: 'Unknown User' };
      }
    });

    const members = await Promise.all(memberPromises);

    // Filter members based on search
    const results = members.filter(member => 
      member.id.toLowerCase().includes(searchValue.toLowerCase()) ||
      member.username.toLowerCase().includes(searchValue.toLowerCase())
    );

    if (results.length === 0) {
      resultsContainer.innerHTML = '<p style=\"text-align: center; color: var(--text-secondary); padding: 1rem;\">No members found</p>';
      resultsContainer.style.display = 'block';
      return;
    }

    resultsContainer.innerHTML = results.map(member => `
      <div style=\"display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: white; border-radius: var(--radius-md); margin-bottom: 0.5rem; ${meetingParticipants.includes(member.id) ? 'opacity: 0.5;' : ''}\">
        <div style=\"display: flex; align-items: center; gap: 0.75rem;\">
          <div style=\"width: 32px; height: 32px; border-radius: var(--radius-full); background: var(--primary-gradient); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.875rem;\">
            ${member.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style=\"font-weight: 600; font-size: 0.875rem;\">${member.username}</div>
            <div style=\"font-size: 0.75rem; color: var(--text-secondary); font-family: monospace;\">${member.id}</div>
          </div>
        </div>
        ${!meetingParticipants.includes(member.id) 
          ? `<button type=\"button\" class=\"btn btn-sm\" onclick=\"addMeetingParticipantById('${member.id}', '${member.username}')\">Add</button>`
          : '<span style=\"font-size: 0.875rem; color: var(--text-secondary);\">Already added</span>'
        }
      </div>
    `).join('');

    resultsContainer.style.display = 'block';
  } catch (error) {
    console.error('Search participants error:', error);
    resultsContainer.innerHTML = '<p style=\"text-align: center; color: var(--error); padding: 1rem;\">Failed to search participants</p>';
    resultsContainer.style.display = 'block';
  }
};

// Add meeting participant by ID and username
window.addMeetingParticipantById = function(userId, username) {
  if (meetingParticipants.includes(userId)) {
    showToast('User already added', 'warning', 'Duplicate');
    return;
  }

  meetingParticipants.push(userId);
  meetingParticipantUsernames[userId] = username;

  renderParticipants();
  searchMeetingParticipants(); // Refresh search results
  showToast(`${username} added to meeting`, 'success', 'Participant Added');
};


