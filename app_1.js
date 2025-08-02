// Document.it Career Analytics Platform - JavaScript

// Application data from JSON
const APP_DATA = {
  defaultSkills: ["JavaScript", "Python", "Project Management", "Communication", "Leadership", "Data Analysis", "Problem Solving", "Teamwork", "Strategic Planning", "Quality Assurance"],
  defaultCategories: ["Software Development", "Project Management", "Leadership", "Problem Solving", "Collaboration", "Research", "Operations", "Sales & Marketing", "Customer Service", "Quality Assurance"],
  adminConfig: {
    adminEmails: ["admin@yourcompany.com"],
    superAdmin: "admin@yourcompany.com"
  }
};

// Application state
let currentUser = null;
let selectedSkills = [];
let currentPage = 'landing-page';

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing app...');
  initializeApp();
});

function initializeApp() {
  console.log('Initializing app...');
  
  // Check if user is already logged in
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      showPage('dashboard');
      updateDashboard();
    } catch (e) {
      console.error('Error parsing saved user:', e);
      localStorage.removeItem('currentUser');
    }
  } else {
    showPage('landing-page');
  }

  // Initialize event listeners
  initializeEventListeners();
  
  // Initialize form elements
  initializeForm();
  
  // Set default date to current week
  setDefaultDate();
  
  console.log('App initialized successfully');
}

function initializeEventListeners() {
  console.log('Setting up event listeners...');
  
  // Landing page - using direct element selection with safety checks
  const signInBtn = document.getElementById('sign-in-btn');
  const getStartedBtn = document.getElementById('get-started-btn');
  
  if (signInBtn) {
    signInBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Sign in button clicked');
      showSignInModal();
    });
  }
  
  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Get started button clicked');
      showSignInModal();
    });
  }

  // Authentication modal
  const closeModalBtn = document.getElementById('close-modal');
  const toggleAuthBtn = document.getElementById('toggle-auth');
  const authForm = document.getElementById('auth-form');
  
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', hideModal);
  }
  
  if (toggleAuthBtn) {
    toggleAuthBtn.addEventListener('click', toggleAuthMode);
  }
  
  if (authForm) {
    authForm.addEventListener('submit', handleAuth);
  }
  
  // Dashboard
  const newEntryBtn = document.getElementById('new-entry-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const adminBtn = document.getElementById('admin-btn');
  
  if (newEntryBtn) {
    newEntryBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('New entry button clicked');
      showEntryForm();
    });
  }
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  if (adminBtn) {
    adminBtn.addEventListener('click', showAdminDashboard);
  }

  // Entry form
  const backToDashboard = document.getElementById('back-to-dashboard');
  const cancelEntry = document.getElementById('cancel-entry');
  const careerEntryForm = document.getElementById('career-entry-form');
  
  if (backToDashboard) {
    backToDashboard.addEventListener('click', () => showPage('dashboard'));
  }
  
  if (cancelEntry) {
    cancelEntry.addEventListener('click', () => showPage('dashboard'));
  }
  
  if (careerEntryForm) {
    careerEntryForm.addEventListener('submit', handleFormSubmit);
  }

  // Admin dashboard
  const backToMainDashboard = document.getElementById('back-to-main-dashboard');
  const saveConfig = document.getElementById('save-config');
  const exportData = document.getElementById('export-data');
  
  if (backToMainDashboard) {
    backToMainDashboard.addEventListener('click', () => showPage('dashboard'));
  }
  
  if (saveConfig) {
    saveConfig.addEventListener('click', saveAdminConfig);
  }
  
  if (exportData) {
    exportData.addEventListener('click', exportAllData);
  }

  // Modal backdrop click
  const modalBackdrop = document.querySelector('.modal-backdrop');
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', hideModal);
  }

  // Skills input
  const skillsInput = document.getElementById('skillsInput');
  if (skillsInput) {
    skillsInput.addEventListener('input', handleSkillsInput);
    skillsInput.addEventListener('keydown', handleSkillsKeydown);
  }

  // Mental health slider
  const mentalHealthSlider = document.getElementById('mentalHealth');
  if (mentalHealthSlider) {
    mentalHealthSlider.addEventListener('input', updateMentalHealthDisplay);
  }
  
  console.log('Event listeners set up successfully');
}

function initializeForm() {
  // Populate responsibility categories
  const categorySelect = document.getElementById('responsibilityCategory');
  if (categorySelect) {
    // Clear existing options except the first one
    categorySelect.innerHTML = '<option value="">Select a category</option>';
    
    APP_DATA.defaultCategories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });
  }

  // Initialize star ratings
  initializeStarRatings();
}

function initializeStarRatings() {
  const starRatings = document.querySelectorAll('.star-rating');
  starRatings.forEach(rating => {
    const stars = rating.querySelectorAll('.star');
    stars.forEach((star, index) => {
      star.addEventListener('click', function(e) {
        e.preventDefault();
        const ratingValue = index + 1;
        rating.setAttribute('data-rating', ratingValue);
        updateStarDisplay(rating, ratingValue);
        
        // Update label
        const label = rating.parentElement.querySelector('.rating-label');
        if (label) {
          label.textContent = `Rating: ${ratingValue}/5`;
        }
      });

      star.addEventListener('mouseenter', () => {
        const hoverValue = index + 1;
        updateStarDisplay(rating, hoverValue);
      });
    });

    rating.addEventListener('mouseleave', () => {
      const currentRating = parseInt(rating.getAttribute('data-rating')) || 0;
      updateStarDisplay(rating, currentRating);
    });
  });
}

function updateStarDisplay(ratingElement, value) {
  const stars = ratingElement.querySelectorAll('.star');
  stars.forEach((star, index) => {
    if (index < value) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
}

function setDefaultDate() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysToMonday);
  
  const dateInput = document.getElementById('weekDate');
  if (dateInput) {
    dateInput.value = monday.toISOString().split('T')[0];
  }
}

function showPage(pageId) {
  console.log('Showing page:', pageId);
  
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // Show target page
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
    currentPage = pageId;
  } else {
    console.error('Page not found:', pageId);
  }

  // Update admin button visibility
  updateAdminButtonVisibility();
  
  // Update user name display
  if (currentUser) {
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
      userNameElement.textContent = `Welcome back, ${currentUser.email}!`;
    }
  }
}

function updateAdminButtonVisibility() {
  const adminBtn = document.getElementById('admin-btn');
  if (adminBtn) {
    if (currentUser && APP_DATA.adminConfig.adminEmails.includes(currentUser.email)) {
      adminBtn.classList.remove('hidden');
    } else {
      adminBtn.classList.add('hidden');
    }
  }
}

function showSignInModal() {
  console.log('Showing sign in modal...');
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.classList.remove('hidden');
    console.log('Modal should be visible now');
    
    // Focus on email input after a short delay
    setTimeout(() => {
      const emailInput = document.getElementById('email');
      if (emailInput) {
        emailInput.focus();
      }
    }, 100);
  } else {
    console.error('Auth modal not found');
  }
}

function hideModal() {
  console.log('Hiding modal...');
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function toggleAuthMode() {
  const title = document.getElementById('auth-title');
  const submitBtn = document.getElementById('auth-submit');
  const toggleBtn = document.getElementById('toggle-auth');
  const form = document.getElementById('auth-form');
  const toggleText = document.querySelector('.auth-toggle p');

  if (title && submitBtn && toggleBtn && form && toggleText) {
    if (title.textContent === 'Sign In') {
      title.textContent = 'Sign Up';
      submitBtn.textContent = 'Sign Up';
      form.dataset.mode = 'signup';
      toggleText.innerHTML = 'Already have an account? <button id="toggle-auth" class="link-btn">Sign In</button>';
    } else {
      title.textContent = 'Sign In';
      submitBtn.textContent = 'Sign In';
      form.dataset.mode = 'signin';
      toggleText.innerHTML = 'Don\'t have an account? <button id="toggle-auth" class="link-btn">Sign Up</button>';
    }

    // Re-attach event listener for toggle button
    const newToggleBtn = document.getElementById('toggle-auth');
    if (newToggleBtn) {
      newToggleBtn.addEventListener('click', toggleAuthMode);
    }
  }
}

function handleAuth(e) {
  e.preventDefault();
  console.log('Handling authentication...');
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const form = document.getElementById('auth-form');
  const mode = form?.dataset.mode || 'signin';

  if (!email || !password) {
    showNotification('Error', 'Please fill in all fields', 'error');
    return;
  }

  if (mode === 'signup') {
    // Create new user
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
      showNotification('Error', 'User already exists', 'error');
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      email: email,
      password: password, // In a real app, this would be hashed
      createdAt: new Date().toISOString(),
      isAdmin: APP_DATA.adminConfig.adminEmails.includes(email)
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    currentUser = newUser;
    
    showNotification('Success', 'Account created successfully!', 'success');
  } else {
    // Sign in existing user
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      showNotification('Error', 'Invalid email or password', 'error');
      return;
    }

    currentUser = user;
    showNotification('Success', 'Signed in successfully!', 'success');
  }

  // Save current user and redirect to dashboard
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
  hideModal();
  showPage('dashboard');
  updateDashboard();

  // Reset form
  const authForm = document.getElementById('auth-form');
  if (authForm) {
    authForm.reset();
  }
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  showPage('landing-page');
  showNotification('Info', 'Logged out successfully', 'info');
}

function showEntryForm() {
  console.log('Showing entry form...');
  showPage('entry-form');
  
  // Reset form
  const form = document.getElementById('career-entry-form');
  if (form) {
    form.reset();
  }
  
  selectedSkills = [];
  updateSelectedSkillsDisplay();
  
  // Reset star ratings
  document.querySelectorAll('.star-rating').forEach(rating => {
    rating.setAttribute('data-rating', '0');
    updateStarDisplay(rating, 0);
    
    // Reset label
    const label = rating.parentElement.querySelector('.rating-label');
    if (label) {
      label.textContent = 'Click to rate';
    }
  });
  
  // Set default date
  setDefaultDate();
  
  // Reset mental health slider
  const mentalHealthSlider = document.getElementById('mentalHealth');
  if (mentalHealthSlider) {
    mentalHealthSlider.value = 5;
    updateMentalHealthDisplay();
  }
}

function updateDashboard() {
  if (!currentUser) return;

  const entries = getEntries();
  const userEntries = entries.filter(entry => entry.userId === currentUser.id);

  // Update stats
  const totalEntriesEl = document.getElementById('total-entries');
  if (totalEntriesEl) {
    totalEntriesEl.textContent = userEntries.length;
  }
  
  // Calculate unique skills
  const uniqueSkills = new Set();
  userEntries.forEach(entry => {
    if (entry.skillsUsed) {
      entry.skillsUsed.forEach(skill => uniqueSkills.add(skill));
    }
  });
  
  const totalSkillsEl = document.getElementById('total-skills');
  if (totalSkillsEl) {
    totalSkillsEl.textContent = uniqueSkills.size;
  }

  // Calculate average mental health
  const mentalHealthRatings = userEntries
    .map(entry => parseFloat(entry.mentalHealth))
    .filter(rating => !isNaN(rating));
  
  const avgMentalHealthEl = document.getElementById('avg-mental-health');
  if (avgMentalHealthEl) {
    if (mentalHealthRatings.length > 0) {
      const avgMentalHealth = mentalHealthRatings.reduce((sum, rating) => sum + rating, 0) / mentalHealthRatings.length;
      avgMentalHealthEl.textContent = avgMentalHealth.toFixed(1);
    } else {
      avgMentalHealthEl.textContent = '-';
    }
  }

  // Calculate this week's entries
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  const thisWeekEntries = userEntries.filter(entry => {
    const entryDate = new Date(entry.weekDate);
    return entryDate >= startOfWeek;
  });
  
  const thisWeekEl = document.getElementById('this-week-entries');
  if (thisWeekEl) {
    thisWeekEl.textContent = thisWeekEntries.length;
  }

  // Update recent entries
  updateRecentEntries(userEntries);
}

function updateRecentEntries(entries) {
  const recentEntriesList = document.getElementById('recent-entries-list');
  if (!recentEntriesList) return;
  
  if (entries.length === 0) {
    recentEntriesList.innerHTML = '<p class="no-entries">No entries yet. Create your first entry to get started!</p>';
    return;
  }

  // Sort by date (most recent first) and take first 5
  const recentEntries = entries
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  recentEntriesList.innerHTML = recentEntries.map(entry => `
    <div class="entry-item">
      <div class="entry-meta">
        <span class="entry-date">${formatDate(entry.weekDate)}</span>
        <span class="entry-category">${entry.responsibilityCategory}</span>
      </div>
      <div class="entry-description">${truncateText(entry.responsibilityDescription, 100)}</div>
    </div>
  `).join('');
}

function handleFormSubmit(e) {
  e.preventDefault();
  console.log('Handling form submit...');
  
  if (!currentUser) {
    showNotification('Error', 'You must be signed in to create entries', 'error');
    return;
  }

  // Validate required fields
  const requiredFields = [
    { id: 'weekDate', name: 'Week Starting Date' },
    { id: 'responsibilityCategory', name: 'Responsibility Category' },
    { id: 'responsibilityDescription', name: 'Responsibility Description' },
    { id: 'notes', name: 'Notes or Reflections' },
    { id: 'proficiencyLevel', name: 'Proficiency Level' }
  ];
  
  const missingFields = [];

  requiredFields.forEach(field => {
    const element = document.getElementById(field.id);
    if (!element || !element.value.trim()) {
      missingFields.push(field.name);
    }
  });

  // Validate star ratings
  const difficultyRating = parseInt(document.getElementById('difficultyRating')?.getAttribute('data-rating') || '0');
  const usageIntensity = parseInt(document.getElementById('usageIntensity')?.getAttribute('data-rating') || '0');

  if (!difficultyRating || difficultyRating === 0) {
    missingFields.push('Difficulty Rating');
  }

  if (!usageIntensity || usageIntensity === 0) {
    missingFields.push('Usage Intensity');
  }

  // Validate skills
  if (selectedSkills.length === 0) {
    missingFields.push('Skills Used');
  }

  if (missingFields.length > 0) {
    showNotification('Error', `Please fill in the following required fields: ${missingFields.join(', ')}`, 'error');
    return;
  }

  // Create entry object
  const entry = {
    id: Date.now().toString(),
    userId: currentUser.id,
    weekDate: document.getElementById('weekDate').value,
    projectName: document.getElementById('projectName').value,
    responsibilityCategory: document.getElementById('responsibilityCategory').value,
    responsibilityDescription: document.getElementById('responsibilityDescription').value,
    difficultyRating: difficultyRating,
    impactAssessment: document.getElementById('impactAssessment').value,
    leadership: document.getElementById('leadership').value,
    skillsUsed: [...selectedSkills],
    proficiencyLevel: document.getElementById('proficiencyLevel').value,
    usageIntensity: usageIntensity,
    skillGoals: document.getElementById('skillGoals').value,
    networking: document.getElementById('networking').value,
    mentalHealth: document.getElementById('mentalHealth').value,
    notes: document.getElementById('notes').value,
    createdAt: new Date().toISOString()
  };

  // Save entry
  const entries = getEntries();
  entries.push(entry);
  localStorage.setItem('careerEntries', JSON.stringify(entries));

  showNotification('Success', 'Career entry saved successfully!', 'success');
  showPage('dashboard');
  updateDashboard();
}

function handleSkillsInput(e) {
  const input = e.target.value.toLowerCase().trim();
  const suggestionsContainer = document.getElementById('skillsSuggestions');

  if (!suggestionsContainer) return;

  if (input.length === 0) {
    suggestionsContainer.classList.add('hidden');
    return;
  }

  // Filter available skills
  const availableSkills = APP_DATA.defaultSkills.filter(skill => 
    skill.toLowerCase().includes(input) && !selectedSkills.includes(skill)
  );

  // Add option to create custom skill if input doesn't match exactly
  const exactMatch = APP_DATA.defaultSkills.find(skill => skill.toLowerCase() === input);
  if (!exactMatch && input.length > 2 && !selectedSkills.includes(e.target.value)) {
    availableSkills.unshift(`Add "${e.target.value}"`);
  }

  if (availableSkills.length === 0) {
    suggestionsContainer.classList.add('hidden');
    return;
  }

  suggestionsContainer.innerHTML = availableSkills.map(skill => `
    <div class="skill-suggestion" data-skill="${skill.startsWith('Add "') ? e.target.value : skill}">
      ${skill}
    </div>
  `).join('');

  suggestionsContainer.classList.remove('hidden');

  // Add click listeners to suggestions
  suggestionsContainer.querySelectorAll('.skill-suggestion').forEach(suggestion => {
    suggestion.addEventListener('click', () => {
      const skill = suggestion.getAttribute('data-skill');
      addSkill(skill);
      document.getElementById('skillsInput').value = '';
      suggestionsContainer.classList.add('hidden');
    });
  });
}

function handleSkillsKeydown(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    const input = e.target.value.trim();
    if (input.length > 0) {
      addSkill(input);
      e.target.value = '';
      const suggestionsContainer = document.getElementById('skillsSuggestions');
      if (suggestionsContainer) {
        suggestionsContainer.classList.add('hidden');
      }
    }
  }
}

function addSkill(skill) {
  if (!selectedSkills.includes(skill)) {
    selectedSkills.push(skill);
    updateSelectedSkillsDisplay();
  }
}

function removeSkill(skill) {
  selectedSkills = selectedSkills.filter(s => s !== skill);
  updateSelectedSkillsDisplay();
}

function updateSelectedSkillsDisplay() {
  const container = document.getElementById('selectedSkills');
  if (!container) return;
  
  container.innerHTML = selectedSkills.map(skill => `
    <div class="skill-tag">
      ${skill}
      <button type="button" class="skill-remove" onclick="removeSkill('${skill}')">&times;</button>
    </div>
  `).join('');
}

function updateMentalHealthDisplay() {
  const slider = document.getElementById('mentalHealth');
  const valueDisplay = document.getElementById('mental-health-value');
  if (slider && valueDisplay) {
    valueDisplay.textContent = slider.value;
  }
}

function showAdminDashboard() {
  if (!currentUser || !APP_DATA.adminConfig.adminEmails.includes(currentUser.email)) {
    showNotification('Error', 'Access denied. Admin privileges required.', 'error');
    return;
  }

  showPage('admin-dashboard');
  loadAdminData();
}

function loadAdminData() {
  // Load users
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const userList = document.getElementById('user-list');
  
  if (userList) {
    userList.innerHTML = users.map(user => `
      <div class="user-item">
        <div class="user-info">
          <div class="user-email">${user.email}</div>
          <div class="user-role">${APP_DATA.adminConfig.adminEmails.includes(user.email) ? 'Administrator' : 'Regular User'}</div>
        </div>
        <div class="user-stats">
          <span>${getEntries().filter(e => e.userId === user.id).length} entries</span>
        </div>
      </div>
    `).join('');
  }

  // Load API config
  const apiKey = localStorage.getItem('perplexityApiKey') || '';
  const apiKeyInput = document.getElementById('perplexityApiKey');
  if (apiKeyInput) {
    apiKeyInput.value = apiKey;
  }
}

function saveAdminConfig() {
  const apiKeyInput = document.getElementById('perplexityApiKey');
  if (apiKeyInput) {
    const apiKey = apiKeyInput.value;
    localStorage.setItem('perplexityApiKey', apiKey);
    showNotification('Success', 'Configuration saved successfully!', 'success');
  }
}

function exportAllData() {
  const data = {
    users: JSON.parse(localStorage.getItem('users') || '[]'),
    entries: getEntries(),
    exportDate: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `document-it-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showNotification('Success', 'Data exported successfully!', 'success');
}

// Utility functions
function getEntries() {
  return JSON.parse(localStorage.getItem('careerEntries') || '[]');
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function showNotification(title, message, type = 'info') {
  const container = document.getElementById('notifications');
  if (!container) return;
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-title">${title}</div>
      <div class="notification-message">${message}</div>
    </div>
    <button class="notification-close">&times;</button>
  `;

  container.appendChild(notification);

  // Add close functionality
  const closeBtn = notification.querySelector('.notification-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      notification.remove();
    });
  }

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
}

// Make removeSkill globally available for onclick handlers
window.removeSkill = removeSkill;