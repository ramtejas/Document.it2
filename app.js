// Document.it - AI-Powered Career Analytics
// Fixed version with working sign-in functionality

console.log('Document.it - AI-Powered Career Analytics loaded');

// Firebase Configuration (User needs to add their config)
const firebaseConfig = {
    // User will add their Firebase config here
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com", 
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};

// Initialize Firebase (will work when user adds real config)
let db = null;
let auth = null;

try {
    if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "your-api-key") {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        auth = firebase.auth();
        console.log('Firebase initialized successfully');
    } else {
        console.log('Firebase not configured - using localStorage fallback');
    }
} catch (error) {
    console.log('Firebase initialization failed - using localStorage fallback');
}

// Perplexity AI Configuration
const PERPLEXITY_CONFIG = {
    apiKey: localStorage.getItem('perplexity_api_key') || 'your-perplexity-api-key',
    baseURL: 'https://api.perplexity.ai',
    model: 'llama-3.1-sonar-small-128k-online'
};

// Application State
let currentUser = null;
let careerEntries = [];
let customCategories = [];
let customSkills = [];
let selectedSkills = [];
let isEditMode = false;
let editingEntryId = null;
let aiInsights = [];
let generatedReports = [];

// Default Data
const defaultSkills = [
    "JavaScript", "Python", "Java", "C++", "React", "Angular", "Vue.js", "Node.js",
    "Project Management", "Agile/Scrum", "Data Analysis", "SQL", "Excel", "Tableau",
    "Communication", "Presentation", "Public Speaking", "Writing", "Documentation",
    "Problem Solving", "Critical Thinking", "Decision Making", "Analytical Thinking",
    "Leadership", "Team Management", "Mentoring", "Delegation", "Conflict Resolution",
    "Design", "UI/UX", "Graphic Design", "Web Design", "Prototyping",
    "Marketing", "Digital Marketing", "Content Marketing", "Social Media", "SEO",
    "Sales", "Business Development", "Client Relations", "Negotiation",
    "Customer Service", "Support", "Help Desk", "Client Communication",
    "Strategic Planning", "Business Strategy", "Planning", "Forecasting",
    "Budget Management", "Financial Analysis", "Cost Control", "Accounting",
    "Quality Control", "Testing", "Quality Assurance", "Process Improvement",
    "Research", "Market Research", "Data Research", "Analysis", "Reporting"
];

const defaultCategories = [
    "Product Development", "Software Development", "Web Development", "Mobile Development",
    "Project Management", "Program Management", "Operations Management", "Team Leadership",
    "Problem Solving", "Technical Problem Solving", "Business Problem Solving",
    "Collaboration", "Cross-functional Collaboration", "Team Collaboration", "Stakeholder Management",
    "Research", "Market Research", "Technical Research", "User Research", "Data Analysis",
    "Leadership", "Team Leadership", "Thought Leadership", "Strategic Leadership",
    "Operations", "Business Operations", "Technical Operations", "Process Management",
    "Sales & Marketing", "Business Development", "Digital Marketing", "Content Creation",
    "Customer Service", "Client Relations", "Customer Success", "Support Operations",
    "Quality Assurance", "Quality Control", "Testing", "Process Improvement"
];

// Utility Functions
function showNotification(message, type = 'success') {
    console.log(`NOTIFICATION [${type.toUpperCase()}]: ${message}`);

    try {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');

        if (notification && notificationText) {
            notificationText.textContent = message;
            notification.className = `notification ${type}`;
            notification.classList.remove('hidden');

            setTimeout(() => {
                notification.classList.add('hidden');
            }, 5000);
        } else {
            alert(`${type.toUpperCase()}: ${message}`);
        }
    } catch (error) {
        console.error('Error showing notification:', error);
        alert(`${type.toUpperCase()}: ${message}`);
    }
}

function showLoading(message = 'Loading...') {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        const loadingText = spinner.querySelector('p');
        if (loadingText) loadingText.textContent = message;
        spinner.classList.remove('hidden');
    }
}

function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.classList.add('hidden');
    }
}

function hideNotification() {
    try {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error hiding notification:', error);
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(date) {
    try {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return date;
    }
}

function getCurrentWeekStart() {
    try {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        return monday.toISOString().split('T')[0];
    } catch (error) {
        console.error('Error getting week start:', error);
        return new Date().toISOString().split('T')[0];
    }
}

// Storage Functions
async function saveToStorage(key, data) {
    try {
        if (db && currentUser) {
            await db.collection('users').doc(currentUser.id).collection('data').doc(key).set({
                data: data,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log(`Successfully saved to Firebase: ${key}`);
            return true;
        }

        localStorage.setItem(key, JSON.stringify(data));
        console.log(`Successfully saved to localStorage: ${key}`);
        return true;
    } catch (error) {
        console.error('Error saving data:', error);

        try {
            localStorage.setItem(key, JSON.stringify(data));
            console.log(`Saved to localStorage as backup: ${key}`);
            return true;
        } catch (backupError) {
            console.error('Backup storage also failed:', backupError);
            showNotification('Error saving data. Please check storage settings.', 'error');
            return false;
        }
    }
}

async function loadFromStorage(key, defaultValue = null) {
    try {
        if (db && currentUser) {
            const doc = await db.collection('users').doc(currentUser.id).collection('data').doc(key).get();
            if (doc.exists) {
                const result = doc.data().data;
                console.log(`Loaded from Firebase: ${key}`);
                return result;
            }
        }

        const data = localStorage.getItem(key);
        const result = data ? JSON.parse(data) : defaultValue;
        console.log(`Loaded from localStorage: ${key}`);
        return result;
    } catch (error) {
        console.error('Error loading data:', error);
        return defaultValue;
    }
}

// FIXED Authentication Functions
function showSignup() {
    console.log('Showing signup modal');
    try {
        const modal = document.getElementById('authModal');
        const title = document.getElementById('authTitle');
        const buttonText = document.getElementById('authButtonText');
        const switchText = document.getElementById('authSwitchText');
        const signupFields = document.getElementById('signupFields');

        if (title) title.textContent = 'Create Account';
        if (buttonText) buttonText.textContent = 'Create Account';
        if (switchText) switchText.innerHTML = 'Already have an account? <a href="#" onclick="toggleAuthMode()">Sign In</a>';
        if (signupFields) signupFields.style.display = 'block';
        if (modal) modal.classList.remove('hidden');

        console.log('Signup modal shown successfully');
    } catch (error) {
        console.error('Error showing signup modal:', error);
        showNotification('Error opening signup form', 'error');
    }
}

function showLogin() {
    console.log('Showing login modal');
    try {
        const modal = document.getElementById('authModal');
        const title = document.getElementById('authTitle');
        const buttonText = document.getElementById('authButtonText');
        const switchText = document.getElementById('authSwitchText');
        const signupFields = document.getElementById('signupFields');

        if (title) title.textContent = 'Sign In';
        if (buttonText) buttonText.textContent = 'Sign In';
        if (switchText) switchText.innerHTML = 'Don\'t have an account? <a href="#" onclick="toggleAuthMode()">Create Account</a>';
        if (signupFields) signupFields.style.display = 'none';
        if (modal) modal.classList.remove('hidden');

        console.log('Login modal shown successfully');
    } catch (error) {
        console.error('Error showing login modal:', error);
        showNotification('Error opening login form', 'error');
    }
}

function hideAuth() {
    console.log('Hiding auth modal');
    try {
        const modal = document.getElementById('authModal');
        const form = document.getElementById('authForm');

        if (modal) modal.classList.add('hidden');
        if (form) form.reset();

        console.log('Auth modal hidden successfully');
    } catch (error) {
        console.error('Error hiding auth modal:', error);
    }
}

function toggleAuthMode() {
    try {
        const title = document.getElementById('authTitle');
        if (title && title.textContent === 'Create Account') {
            showLogin();
        } else {
            showSignup();
        }
    } catch (error) {
        console.error('Error toggling auth mode:', error);
    }
}

// FIXED Authentication Handler
async function handleAuth(event) {
    event.preventDefault();
    console.log('=== Starting authentication process ===');

    try {
        const email = document.getElementById('authEmail')?.value?.trim();
        const password = document.getElementById('authPassword')?.value;
        const name = document.getElementById('authName')?.value?.trim();
        const title = document.getElementById('authTitle');
        const isSignup = title && title.textContent === 'Create Account';

        console.log('Auth details:', { 
            email: email ? 'provided' : 'missing', 
            password: password ? 'provided' : 'missing',
            name: name ? 'provided' : 'missing',
            isSignup 
        });

        if (!email || !password) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        showLoading('Authenticating...');

        if (isSignup) {
            const confirmPassword = document.getElementById('authConfirmPassword')?.value;
            if (password !== confirmPassword) {
                showNotification('Passwords do not match', 'error');
                hideLoading();
                return;
            }

            // Create new user
            currentUser = {
                id: generateId(),
                email: email,
                name: name || email.split('@')[0],
                createdAt: new Date().toISOString()
            };

            console.log('Creating new user:', currentUser);

            if (await saveToStorage('currentUser', currentUser)) {
                showNotification('Account created successfully!', 'success');
                console.log('User saved successfully');
            } else {
                showNotification('Error creating account', 'error');
                hideLoading();
                return;
            }
        } else {
            // Sign in existing user
            const existingUser = await loadFromStorage('currentUser');
            if (!existingUser || existingUser.email !== email) {
                showNotification('Invalid credentials or no account found', 'error');
                hideLoading();
                return;
            }

            currentUser = existingUser;
            showNotification('Welcome back!', 'success');
            console.log('User logged in successfully:', currentUser);
        }

        hideAuth();
        hideLoading();

        console.log('=== Starting navigation to dashboard ===');
        setTimeout(async () => {
            try {
                await loadUserData();
                showDashboard();
                console.log('=== Navigation completed successfully ===');
            } catch (navError) {
                console.error('Navigation error:', navError);
                showNotification('Error loading dashboard. Please refresh the page.', 'error');
            }
        }, 500);

    } catch (error) {
        console.error('Authentication error:', error);
        hideLoading();
        showNotification('Authentication failed: ' + error.message, 'error');
    }
}

async function logout() {
    console.log('Logging out user');
    try {
        if (auth && auth.currentUser) {
            await auth.signOut();
        }

        currentUser = null;
        careerEntries = [];
        customCategories = [];
        customSkills = [];
        selectedSkills = [];
        aiInsights = [];
        generatedReports = [];

        showPage('landingPage');
        showNotification('Logged out successfully', 'success');
    } catch (error) {
        console.error('Error during logout:', error);
        showNotification('Error during logout', 'error');
    }
}

// Navigation Functions
function showPage(pageId) {
    console.log(`=== Navigating to page: ${pageId} ===`);

    try {
        const allPages = document.querySelectorAll('.page');
        console.log(`Found ${allPages.length} page elements`);

        allPages.forEach((page, index) => {
            page.classList.add('hidden');
            page.classList.remove('active');
        });

        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.remove('hidden');
            targetPage.classList.add('active');
            console.log(`Successfully showed page: ${pageId}`);
            return true;
        } else {
            console.error(`Page not found: ${pageId}`);
            showNotification('Navigation error - page not found', 'error');

            const landingPage = document.getElementById('landingPage');
            if (landingPage) {
                landingPage.classList.remove('hidden');
                landingPage.classList.add('active');
                console.log('Fallback: showed landing page');
            }
            return false;
        }
    } catch (error) {
        console.error('Error in showPage:', error);
        showNotification('Navigation error: ' + error.message, 'error');
        return false;
    }
}

function showDashboard() {
    console.log('=== Showing dashboard ===');

    try {
        if (!currentUser) {
            console.error('No current user when showing dashboard');
            showNotification('Please log in first', 'error');
            showPage('landingPage');
            return false;
        }

        console.log('Current user:', currentUser.name);

        const success = showPage('dashboardPage');
        if (success) {
            loadDashboardData();
            console.log('Dashboard loaded successfully');
        }

        return success;
    } catch (error) {
        console.error('Error showing dashboard:', error);
        showNotification('Error loading dashboard: ' + error.message, 'error');
        showPage('landingPage');
        return false;
    }
}

// Data Loading Functions
async function loadUserData() {
    if (!currentUser) {
        console.error('No current user when loading data');
        throw new Error('No current user');
    }

    console.log('Loading data for user:', currentUser.id);

    try {
        careerEntries = await loadFromStorage(`entries_${currentUser.id}`, []);
        customCategories = await loadFromStorage(`categories_${currentUser.id}`, []);
        customSkills = await loadFromStorage(`skills_${currentUser.id}`, []);
        aiInsights = await loadFromStorage(`insights_${currentUser.id}`, []);
        generatedReports = await loadFromStorage(`reports_${currentUser.id}`, []);

        const userName = document.getElementById('userName');
        if (userName) {
            userName.textContent = currentUser.name;
        }

        console.log('User data loaded successfully:', {
            entries: careerEntries.length,
            categories: customCategories.length,
            skills: customSkills.length,
            insights: aiInsights.length,
            reports: generatedReports.length
        });
    } catch (error) {
        console.error('Error loading user data:', error);
        throw error;
    }
}

async function loadDashboardData() {
    console.log('Loading dashboard data...');

    try {
        const totalEntries = careerEntries.length;
        const skillsTracked = calculateUniqueSkills();
        const growthScore = calculateGrowthScore();
        const insightsCount = aiInsights.length;

        const stats = {
            'totalEntries': totalEntries,
            'skillsTracked': skillsTracked,
            'growthScore': growthScore,
            'aiInsights': insightsCount
        };

        Object.entries(stats).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });

        loadRecentEntries();
        loadAIInsights();

        console.log('Dashboard data loaded successfully:', stats);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Error loading dashboard data', 'error');
    }
}

function calculateUniqueSkills() {
    const uniqueSkills = new Set();
    careerEntries.forEach(entry => {
        if (entry.skillsUsed) {
            entry.skillsUsed.forEach(skill => uniqueSkills.add(skill));
        }
    });
    return uniqueSkills.size;
}

function calculateGrowthScore() {
    if (careerEntries.length === 0) return 0;

    const avgDifficulty = careerEntries.reduce((sum, entry) => sum + (entry.difficultyRating || 0), 0) / careerEntries.length;
    const avgIntensity = careerEntries.reduce((sum, entry) => sum + (entry.usageIntensity || 0), 0) / careerEntries.length;
    const skillDiversity = calculateUniqueSkills();
    const consistencyBonus = careerEntries.length >= 4 ? 10 : 0;

    const score = Math.round((avgDifficulty * 10) + (avgIntensity * 8) + (skillDiversity * 2) + consistencyBonus);
    return Math.min(score, 100);
}

function loadAIInsights() {
    try {
        const aiInsightsList = document.getElementById('aiInsightsList');
        if (!aiInsightsList) return;

        if (aiInsights.length === 0) {
            aiInsightsList.innerHTML = '<p class="empty-state">Generate your first AI insights to see personalized career recommendations!</p>';
            return;
        }

        const recentInsights = aiInsights.slice(0, 3);
        aiInsightsList.innerHTML = recentInsights.map(insight => `
            <div class="ai-insight-card">
                <h4>${insight.title}</h4>
                <p>${insight.content.substring(0, 200)}...</p>
                <small>${formatDate(insight.timestamp)}</small>
            </div>
        `).join('');

        console.log('AI insights loaded');
    } catch (error) {
        console.error('Error loading AI insights:', error);
    }
}

function loadRecentEntries() {
    try {
        const recentEntriesList = document.getElementById('recentEntriesList');
        if (!recentEntriesList) {
            console.warn('Recent entries list element not found');
            return;
        }

        const recent = careerEntries.slice(-3).reverse();

        if (recent.length === 0) {
            recentEntriesList.innerHTML = '<p class="empty-state">No entries yet. Create your first career entry!</p>';
            return;
        }

        recentEntriesList.innerHTML = recent.map(entry => `
            <div class="entry-card">
                <div class="entry-header">
                    <h4>${formatDate(entry.weekDate)}</h4>
                    <div class="entry-actions">
                        <button class="btn btn--sm btn--outline" onclick="showForm('${entry.id}')">Edit</button>
                    </div>
                </div>
                <p><strong>Category:</strong> ${entry.responsibilityCategory}</p>
                <p><strong>Skills:</strong> ${entry.skillsUsed ? entry.skillsUsed.join(', ') : 'None'}</p>
                <p><strong>Difficulty:</strong> ${entry.difficultyRating}/5</p>
            </div>
        `).join('');

        console.log('Recent entries loaded');
    } catch (error) {
        console.error('Error loading recent entries:', error);
    }
}

// Placeholder functions for other features (to prevent errors)
function showForm() { console.log('Form function placeholder'); }
function showEntries() { console.log('Entries function placeholder'); }
function showAnalytics() { console.log('Analytics function placeholder'); }
function showReports() { console.log('Reports function placeholder'); }
function showSettings() { console.log('Settings function placeholder'); }
function generateAIInsights() { 
    showNotification('AI insights feature coming soon!', 'warning');
}
function generateReport() {
    showNotification('Report generation feature coming soon!', 'warning');
}

// FIXED Initialize App
async function initializeApp() {
    console.log('=== Initializing Document.it MVP ===');

    try {
        // Check if user is already logged in
        currentUser = await loadFromStorage('currentUser');
        console.log('Current user from storage:', currentUser ? currentUser.name : 'none');

        if (currentUser) {
            console.log('User found, loading data and showing dashboard');
            await loadUserData();
            showDashboard();
        } else {
            console.log('No user found, showing landing page');
            showPage('landingPage');
        }

        // FIXED: Initialize form handlers with proper error handling
        const authForm = document.getElementById('authForm');

        if (authForm) {
            // Remove any existing event listeners
            const newAuthForm = authForm.cloneNode(true);
            authForm.parentNode.replaceChild(newAuthForm, authForm);

            // Add the event listener to the new form
            newAuthForm.addEventListener('submit', handleAuth);
            console.log('Auth form handler attached successfully');
        } else {
            console.warn('Auth form not found during initialization');
        }

        console.log('=== App initialization completed successfully ===');

    } catch (error) {
        console.error('=== Critical error during app initialization ===', error);
        showNotification('App initialization failed: ' + error.message, 'error');

        try {
            showPage('landingPage');
        } catch (fallbackError) {
            console.error('Even fallback failed:', fallbackError);
            alert('Critical error: Unable to start application. Please refresh the page.');
        }
    }
}

// FIXED: Start the app when page loads with proper timing
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DOM Content Loaded - Starting Document.it ===');

    // Add a small delay to ensure all elements are properly loaded
    setTimeout(() => {
        try {
            initializeApp();
        } catch (error) {
            console.error('=== Failed to start app ===', error);
            alert('Failed to start Document.it. Please refresh the page and try again.');
        }
    }, 100);
});

// Global error handlers
window.addEventListener('error', function(e) {
    console.error('=== Global JavaScript Error ===', e.error);
    showNotification('An unexpected error occurred. Check console for details.', 'error');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('=== Unhandled Promise Rejection ===', e.reason);
    showNotification('An async error occurred. Check console for details.', 'error');
});

console.log('=== Document.it AI-Powered Career Analytics loaded completely ===');