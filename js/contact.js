// ================================
// Global Variables
// ================================

let allPosts = [];
let currentTheme = localStorage.getItem('theme') || 'light';

// ================================
// Initialize
// ================================

document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeNavigation();
    initializeSearch();
    initializeScrollAnimations();
    initializeContactForm();
    initializeBackToTop();
    hideLoadingOverlay();
});

// ================================
// Loading Overlay
// ================================

function hideLoadingOverlay() {
    setTimeout(() => {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
    }, 500);
}

// ================================
// Theme Toggle (Dark Mode)
// ================================

function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    html.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
    
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    const icon = themeToggle.querySelector('i');
    if (currentTheme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// ================================
// Navigation
// ================================

function initializeNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const header = document.getElementById('header');
    let lastScroll = 0;
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (hamburger) hamburger.classList.remove('active');
            if (navMenu) navMenu.classList.remove('active');
        });
    });
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            header.classList.remove('hide');
            return;
        }
        
        if (currentScroll > lastScroll && currentScroll > 100) {
            header.classList.add('hide');
        } else {
            header.classList.remove('hide');
        }
        
        lastScroll = currentScroll;
    });
}

// ================================
// Search Functionality
// ================================

function initializeSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchClose = document.getElementById('searchClose');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', openSearch);
    }
    
    if (searchClose) {
        searchClose.addEventListener('click', closeSearch);
    }
    
    if (searchOverlay) {
        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) {
                closeSearch();
            }
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            performSearch(e.target.value);
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
            closeSearch();
        }
    });
}

function openSearch() {
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');
    
    searchOverlay.classList.add('active');
    setTimeout(() => {
        searchInput.focus();
    }, 300);
}

function closeSearch() {
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    searchOverlay.classList.remove('active');
    searchInput.value = '';
    searchResults.innerHTML = '';
}

async function performSearch(query) {
    const searchResults = document.getElementById('searchResults');
    
    if (!query.trim()) {
        searchResults.innerHTML = '';
        return;
    }
    
    // Load posts for search if not already loaded
    if (allPosts.length === 0) {
        try {
            const response = await fetch('../data/posts.json');
            const data = await response.json();
            allPosts = data.posts || [];
        } catch (error) {
            console.error('Error loading posts:', error);
        }
    }
    
    const results = allPosts.filter(post => 
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
        post.category.toLowerCase().includes(query.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    
    if (results.length === 0) {
        searchResults.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p>No results found for "${query}"</p>
            </div>
        `;
        return;
    }
    
    searchResults.innerHTML = results.slice(0, 5).map(post => `
        <a href="post.html?slug=${post.slug}" class="search-result-item">
            <h3 class="search-result-title">${post.title}</h3>
            <p class="search-result-excerpt">${post.excerpt}</p>
        </a>
    `).join('');
}

// ================================
// Scroll Animations
// ================================

function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(element => observer.observe(element));
}

// ================================
// Contact Form
// ================================

function initializeContactForm() {
    const form = document.getElementById('contactForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const charCount = document.getElementById('charCount');
    const submitBtn = document.getElementById('submitBtn');
    const sendAnotherBtn = document.getElementById('sendAnotherBtn');
    const tryAgainBtn = document.getElementById('tryAgainBtn');
    
    // Character counter
    if (messageInput && charCount) {
        messageInput.addEventListener('input', () => {
            const count = messageInput.value.length;
            charCount.textContent = count;
            
            if (count > 1000) {
                messageInput.value = messageInput.value.substring(0, 1000);
                charCount.textContent = '1000';
            }
        });
    }
    
    // Real-time validation
    if (nameInput) {
        nameInput.addEventListener('blur', () => validateName());
        nameInput.addEventListener('input', () => clearError('nameError'));
    }
    
    if (emailInput) {
        emailInput.addEventListener('blur', () => validateEmail());
        emailInput.addEventListener('input', () => clearError('emailError'));
    }
    
    if (messageInput) {
        messageInput.addEventListener('blur', () => validateMessage());
        messageInput.addEventListener('input', () => clearError('messageError'));
    }
    
    // Form submission
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Send another message button
    if (sendAnotherBtn) {
        sendAnotherBtn.addEventListener('click', resetForm);
    }
    
    // Try again button
    if (tryAgainBtn) {
        tryAgainBtn.addEventListener('click', resetForm);
    }
}

// ================================
// Form Validation
// ================================

function validateName() {
    const nameInput = document.getElementById('name');
    const nameError = document.getElementById('nameError');
    const name = nameInput.value.trim();
    
    if (!name) {
        showError('nameError', 'Name is required');
        nameInput.classList.add('error');
        nameInput.classList.remove('success');
        return false;
    }
    
    if (name.length < 2) {
        showError('nameError', 'Name must be at least 2 characters');
        nameInput.classList.add('error');
        nameInput.classList.remove('success');
        return false;
    }
    
    nameInput.classList.remove('error');
    nameInput.classList.add('success');
    clearError('nameError');
    return true;
}

function validateEmail() {
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('emailError');
    const email = emailInput.value.trim();
    
    if (!email) {
        showError('emailError', 'Email is required');
        emailInput.classList.add('error');
        emailInput.classList.remove('success');
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('emailError', 'Please enter a valid email address');
        emailInput.classList.add('error');
        emailInput.classList.remove('success');
        return false;
    }
    
    emailInput.classList.remove('error');
    emailInput.classList.add('success');
    clearError('emailError');
    return true;
}

function validateMessage() {
    const messageInput = document.getElementById('message');
    const messageError = document.getElementById('messageError');
    const message = messageInput.value.trim();
    
    if (!message) {
        showError('messageError', 'Message is required');
        messageInput.classList.add('error');
        messageInput.classList.remove('success');
        return false;
    }
    
    if (message.length < 10) {
        showError('messageError', 'Message must be at least 10 characters');
        messageInput.classList.add('error');
        messageInput.classList.remove('success');
        return false;
    }
    
    messageInput.classList.remove('error');
    messageInput.classList.add('success');
    clearError('messageError');
    return true;
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = '';
    }
}

// ================================
// Form Submission
// ================================

async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validate all fields
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isMessageValid = validateMessage();
    
    if (!isNameValid || !isEmailValid || !isMessageValid) {
        return;
    }
    
    const form = e.target;
    const submitBtn = document.getElementById('submitBtn');
    const formData = new FormData(form);
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    
    try {
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            showSuccessMessage();
        } else {
            const data = await response.json();
            showErrorMessage(data.error || 'There was an error sending your message. Please try again.');
        }
    } catch (error) {
        console.error('Form submission error:', error);
        showErrorMessage('Network error. Please check your connection and try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
}

function showSuccessMessage() {
    const form = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');
    
    form.style.display = 'none';
    successMessage.classList.add('show');
    successMessage.style.display = 'block';
    
    // Scroll to message
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showErrorMessage(errorText) {
    const form = document.getElementById('contactForm');
    const errorMessage = document.getElementById('errorMessage');
    const errorTextElement = document.getElementById('errorText');
    
    if (errorTextElement) {
        errorTextElement.textContent = errorText;
    }
    
    form.style.display = 'none';
    errorMessage.classList.add('show');
    errorMessage.style.display = 'block';
    
    // Scroll to message
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetForm() {
    const form = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    
    // Hide messages
    successMessage.classList.remove('show');
    successMessage.style.display = 'none';
    errorMessage.classList.remove('show');
    errorMessage.style.display = 'none';
    
    // Show and reset form
    form.style.display = 'block';
    form.reset();
    
    // Clear validation states
    const inputs = form.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.classList.remove('error', 'success');
    });
    
    // Reset character count
    const charCount = document.getElementById('charCount');
    if (charCount) {
        charCount.textContent = '0';
    }
    
    // Scroll to form
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ================================
// Back to Top Button
// ================================

function initializeBackToTop() {
    const backToTop = document.getElementById('backToTop');
    
    if (!backToTop) return;
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    });
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}