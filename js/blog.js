// ================================
// Global Variables
// ================================

let allPosts = [];
let filteredPosts = [];
let currentCategory = 'All';
let currentSort = 'newest';
let currentPage = 1;
const postsPerPage = 9;
let currentTheme = localStorage.getItem('theme') || 'light';

// ================================
// Initialize
// ================================

document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeNavigation();
    initializeSearch();
    initializeFilters();
    initializeBackToTop();
    loadPosts();
    checkURLParameters();
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
        <a href="post.html?slug=${post.slug}" class="search-result-item">
            <h3 class="search-result-title">${post.title}</h3>
            <p class="search-result-excerpt">${post.excerpt}</p>
        </a>
    `).join('');
}

// ================================
// Filter and Sort Initialization
// ================================

function initializeFilters() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const sortSelect = document.getElementById('sortSelect');
    const resetFilters = document.getElementById('resetFilters');
    
    // Category filter
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            currentPage = 1;
            filterAndDisplayPosts();
        });
    });
    
    // Sort select
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            currentPage = 1;
            filterAndDisplayPosts();
        });
    }
    
    // Reset filters
    if (resetFilters) {
        resetFilters.addEventListener('click', () => {
            currentCategory = 'All';
            currentSort = 'newest';
            currentPage = 1;
            
            categoryButtons.forEach(b => b.classList.remove('active'));
            categoryButtons[0].classList.add('active');
            sortSelect.value = 'newest';
            
            filterAndDisplayPosts();
        });
    }
    
    // Load More button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMorePosts);
    }
}

// ================================
// Check URL Parameters
// ================================

function checkURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    if (category) {
        currentCategory = category;
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });
    }
}

// ================================
// Load Posts (Slug-based)
// ================================

async function loadPosts() {
    try {
        const response = await fetch('../data/posts.json');
        const data = await response.json();
        allPosts = data.posts || [];
        
        filterAndDisplayPosts();
    } catch (error) {
        console.error('Error loading posts:', error);
        showError();
    }
}

function showError() {
    const blogGrid = document.getElementById('blogGrid');
    const noResults = document.getElementById('noResults');
    
    if (blogGrid) {
        blogGrid.innerHTML = '';
    }
    
    if (noResults) {
        noResults.innerHTML = `
            <div class="no-results-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Unable to Load Articles</h3>
            <p>There was an error loading the articles. Please try again later.</p>
        `;
        noResults.style.display = 'block';
    }
}

// ================================
// Filter and Display Posts
// ================================

function filterAndDisplayPosts() {
    // Filter by category
    if (currentCategory === 'All') {
        filteredPosts = [...allPosts];
    } else {
        filteredPosts = allPosts.filter(post => post.category === currentCategory);
    }
    
    // Sort posts
    sortPosts();
    
    // Reset page
    currentPage = 1;
    
    // Display posts
    displayPosts();
    
    // Update results counter
    updateResultsCounter();
}

// ================================
// Sort Posts
// ================================

function sortPosts() {
    switch (currentSort) {
        case 'newest':
            filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'oldest':
            filteredPosts.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'popular':
            filteredPosts.sort((a, b) => b.views - a.views);
            break;
        case 'title':
            filteredPosts.sort((a, b) => a.title.localeCompare(b.title));
            break;
    }
}

// ================================
// Display Posts
// ================================

function displayPosts() {
    const blogGrid = document.getElementById('blogGrid');
    const noResults = document.getElementById('noResults');
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    
    if (filteredPosts.length === 0) {
        blogGrid.innerHTML = '';
        noResults.style.display = 'block';
        loadMoreContainer.style.display = 'none';
        return;
    }
    
    noResults.style.display = 'none';
    
    // Calculate posts to display
    const startIndex = 0;
    const endIndex = currentPage * postsPerPage;
    const postsToDisplay = filteredPosts.slice(startIndex, endIndex);
    
    // Display posts
    blogGrid.innerHTML = postsToDisplay.map(post => createArticleCard(post)).join('');
    
    // Animate cards
    setTimeout(() => {
        const cards = document.querySelectorAll('.article-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('visible');
            }, index * 50);
        });
    }, 100);
    
    // Update Load More button
    updateLoadMoreButton();
}

function createArticleCard(post) {
    return `
        <article class="article-card">
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
            <a href="post.html?slug=${post.slug}" class="article-link" aria-label="Read ${post.title}"></a>
        </article>
    `;
}

// ================================
// Load More Posts
// ================================

function loadMorePosts() {
    currentPage++;
    displayPosts();
    
    // Scroll to new posts
    setTimeout(() => {
        const newCards = document.querySelectorAll('.article-card');
        const scrollTarget = newCards[Math.max(0, (currentPage - 1) * postsPerPage)];
        if (scrollTarget) {
            scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 200);
}

function updateLoadMoreButton() {
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const loadMoreInfo = document.getElementById('loadMoreInfo');
    
    const totalPosts = filteredPosts.length;
    const displayedPosts = currentPage * postsPerPage;
    
    if (displayedPosts >= totalPosts) {
        loadMoreContainer.style.display = 'none';
    } else {
        loadMoreContainer.style.display = 'block';
        const remaining = totalPosts - displayedPosts;
        loadMoreInfo.textContent = `Showing ${displayedPosts} of ${totalPosts} articles`;
        loadMoreBtn.innerHTML = `<i class="fas fa-plus"></i> Load ${Math.min(remaining, postsPerPage)} More`;
    }
}

// ================================
// Update Results Counter
// ================================

function updateResultsCounter() {
    const resultsCount = document.getElementById('resultsCount');
    
    if (resultsCount) {
        const total = filteredPosts.length;
        if (total === 0) {
            resultsCount.textContent = 'No articles found';
        } else if (total === 1) {
            resultsCount.textContent = 'Showing 1 article';
        } else {
            resultsCount.textContent = `Showing ${Math.min(currentPage * postsPerPage, total)} of ${total} articles`;
        }
    }
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

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}