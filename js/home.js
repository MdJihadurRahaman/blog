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
    initializeBackToTop();
    loadLatestPosts();
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
    
    // Apply saved theme
    html.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
    
    // Theme toggle event
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
    
    // Hamburger menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // Close menu when clicking nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (hamburger) hamburger.classList.remove('active');
            if (navMenu) navMenu.classList.remove('active');
        });
    });
    
    // Hide header on scroll down, show on scroll up
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            header.classList.remove('hide');
            return;
        }
        
        if (currentScroll > lastScroll && currentScroll > 100) {
            // Scrolling down
            header.classList.add('hide');
        } else {
            // Scrolling up
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
    
    // Close search with Escape key
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

function performSearch(query) {
    const searchResults = document.getElementById('searchResults');
    
    if (!query.trim()) {
        searchResults.innerHTML = '';
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
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p>No results found for "${query}"</p>
            </div>
        `;
        return;
    }
    
    searchResults.innerHTML = results.slice(0, 5).map(post => `
        <a href="html/post.html?slug=${post.slug}" class="search-result-item">
            <h3 class="search-result-title">${post.title}</h3>
            <p class="search-result-excerpt">${post.excerpt}</p>
        </a>
    `).join('');
}

// ================================
// Load Latest Posts (Slug-based)
// ================================

async function loadLatestPosts() {
    try {
        const response = await fetch('data/posts.json');
        const data = await response.json();
        allPosts = data.posts || [];
        
        const articlesGrid = document.getElementById('articlesGrid');
        const noPosts = document.getElementById('noPosts');
        const viewAllContainer = document.getElementById('viewAllContainer');
        
        if (allPosts.length === 0) {
            // Show "No posts yet" message
            if (noPosts) noPosts.style.display = 'block';
            if (viewAllContainer) viewAllContainer.style.display = 'none';
        } else {
            // Hide "No posts" and show articles
            if (noPosts) noPosts.style.display = 'none';
            if (viewAllContainer) viewAllContainer.style.display = 'block';
            
            // Display latest 3 posts
            const latestPosts = allPosts.slice(0, 3);
            articlesGrid.innerHTML = latestPosts.map(post => createArticleCard(post)).join('');
            
            // Add stagger animation
            animateArticles();
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        const articlesGrid = document.getElementById('articlesGrid');
        if (articlesGrid) {
            articlesGrid.innerHTML = `
                <div class="no-posts">
                    <div class="no-posts-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>Unable to Load Articles</h3>
                    <p>There was an error loading the articles. Please try again later.</p>
                </div>
            `;
        }
    }
}

function createArticleCard(post) {
    return `
        <article class="article-card animate-on-scroll">
            <img src="${post.thumbnail}" alt="${post.title}" class="article-image" 
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22220%22%3E%3Crect fill=%22%236366f1%22 width=%22400%22 height=%22220%22/%3E%3Ctext fill=%22white%22 font-family=%22Arial%22 font-size=%2220%22 x=%22200%22 y=%22120%22 text-anchor=%22middle%22%3E${post.category}%3C/text%3E%3C/svg%3E'">
            <div class="article-content">
                <div class="article-meta">
                    <span class="article-category">${post.category}</span>
                    <span class="article-date">
                        <i class="far fa-calendar"></i> ${post.date}
                    </span>
                    <span class="article-read-time">
                        <i class="far fa-clock"></i> ${post.readTime}
                    </span>
                </div>
                <h3 class="article-title">${post.title}</h3>
                <p class="article-excerpt">${post.excerpt}</p>
                <div class="article-footer">
                    <div class="article-tags">
                        ${post.tags.slice(0, 2).map(tag => `<span class="article-tag">#${tag}</span>`).join('')}
                    </div>
                    <span class="article-views">
                        <i class="far fa-eye"></i> ${post.views}
                    </span>
                </div>
            </div>
            <a href="html/post.html?slug=${post.slug}" class="article-link" aria-label="Read ${post.title}"></a>
        </article>
    `;
}

function animateArticles() {
    const articles = document.querySelectorAll('.article-card');
    articles.forEach((article, index) => {
        setTimeout(() => {
            article.style.opacity = '1';
            article.style.transform = 'translateY(0)';
        }, index * 100);
    });
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

// ================================
// Utility Functions
// ================================

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Truncate text
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// Create slug from title
function createSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// ================================
// Article Card Link Style
// ================================

// Add CSS for article link overlay
const style = document.createElement('style');
style.textContent = `
    .article-card {
        position: relative;
    }
    
    .article-link {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
    }
    
    .article-card a:not(.article-link) {
        position: relative;
        z-index: 2;
    }
`;
document.head.appendChild(style);