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
    initializeGoBackButton();
    loadPosts();
});

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
}

// ================================
// Load Posts
// ================================

async function loadPosts() {
    try {
        const response = await fetch('../data/posts.json');
        const data = await response.json();
        allPosts = data.posts || [];
    } catch (error) {
        console.error('Error loading posts:', error);
        allPosts = [];
    }
}

// ================================
// Search Functionality
// ================================

function initializeSearch() {
    const searchInput = document.getElementById('errorSearchInput');
    const searchBtn = document.getElementById('errorSearchBtn');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        searchInput.addEventListener('input', () => {
            if (searchInput.value.trim() === '') {
                clearSearchResults();
            }
        });
    }
}

function performSearch() {
    const searchInput = document.getElementById('errorSearchInput');
    const searchResults = document.getElementById('errorSearchResults');
    const query = searchInput.value.trim();
    
    if (!query) {
        clearSearchResults();
        return;
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
                <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No results found for "${query}"</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">Try different keywords or <a href="blog.html" style="color: var(--primary-color);">browse all articles</a></p>
            </div>
        `;
        return;
    }
    
    searchResults.innerHTML = results.slice(0, 5).map(post => `
        <a href="post.html?slug=${post.slug}" class="search-result-item">
            <h4 class="search-result-title">${post.title}</h4>
            <p class="search-result-excerpt">${truncateText(post.excerpt, 100)}</p>
        </a>
    `).join('');
    
    // Show count if there are more results
    if (results.length > 5) {
        searchResults.innerHTML += `
            <div style="text-align: center; padding: 1rem; color: var(--text-secondary); font-size: 0.875rem;">
                Showing 5 of ${results.length} results. <a href="blog.html" style="color: var(--primary-color);">View all articles</a>
            </div>
        `;
    }
}

function clearSearchResults() {
    const searchResults = document.getElementById('errorSearchResults');
    if (searchResults) {
        searchResults.innerHTML = '';
    }
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// ================================
// Go Back Button
// ================================

function initializeGoBackButton() {
    const goBackBtn = document.getElementById('goBackBtn');
    
    if (goBackBtn) {
        goBackBtn.addEventListener('click', () => {
            // Check if there's history to go back to
            if (window.history.length > 1) {
                window.history.back();
            } else {
                // If no history, go to homepage
                window.location.href = '../index.html';
            }
        });
    }
}

// ================================
// Easter Egg - Konami Code
// ================================

let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.join('') === konamiSequence.join('')) {
        activateEasterEgg();
    }
});

function activateEasterEgg() {
    const particles = document.querySelectorAll('.particle');
    particles.forEach(particle => {
        particle.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
        particle.style.animation = 'float 1s ease-in-out infinite';
    });
    
    console.log('🎉 You found the easter egg! Congratulations!');
}