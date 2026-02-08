// ================================
// Global Variables
// ================================

let allPosts = [];
let currentPost = null;
let currentSlug = '';
let currentLanguage = localStorage.getItem('postLanguage') || 'en';
let currentTheme = localStorage.getItem('theme') || 'light';

// ================================
// Initialize
// ================================

document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeNavigation();
    initializeSearch();
    initializeLanguageToggle();
    initializeReadingProgress();
    initializeBackToTop();
    loadPost();
});

// ================================
// Get Slug from URL
// ================================

function getSlugFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('slug');
}

// ================================
// Load Post (Slug-based)
// ================================

async function loadPost() {
    currentSlug = getSlugFromURL();
    
    if (!currentSlug) {
        showError('No article specified. Please select an article from the blog.');
        return;
    }
    
    try {
        // Load posts.json
        const response = await fetch('../data/posts.json');
        const data = await response.json();
        allPosts = data.posts || [];
        
        // Find current post by slug
        currentPost = allPosts.find(post => post.slug === currentSlug);
        
        if (!currentPost) {
            showError('Article not found. The article you are looking for does not exist.');
            return;
        }
        
        // Load post metadata
        displayPostMetadata();
        
        // Load post content (language-specific)
        await loadPostContent();
        
        // Load related posts
        loadRelatedPosts();
        
        // Setup navigation (prev/next)
        setupNavigation();
        
        // Setup social sharing
        setupSocialSharing();
        
        // Hide loading overlay
        hideLoadingOverlay();
        
    } catch (error) {
        console.error('Error loading post:', error);
        showError('Unable to load the article. Please try again later.');
    }
}

function hideLoadingOverlay() {
    setTimeout(() => {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
    }, 500);
}

// ================================
// Display Post Metadata
// ================================

function displayPostMetadata() {
    // Update page title
    document.title = `${currentPost.title} - Md Jihadur Rahaman`;
    
    // Update meta tags
    updateMetaTags();
    
    // Display post info
    document.getElementById('postCategory').textContent = currentPost.category;
    document.getElementById('postDate').textContent = currentPost.date;
    document.getElementById('postReadTime').textContent = currentPost.readTime;
    document.getElementById('postViews').textContent = currentPost.views;
    document.getElementById('postTitle').textContent = currentPost.title;
    document.getElementById('postExcerpt').textContent = currentPost.excerpt;
    
    // Display breadcrumb category
    document.getElementById('breadcrumbCategory').textContent = currentPost.category;
    
    // Display tags
    const tagsContainer = document.getElementById('postTags');
    if (currentPost.tags && currentPost.tags.length > 0) {
        tagsContainer.innerHTML = currentPost.tags.map(tag => 
            `<span class="post-tag">#${tag}</span>`
        ).join('');
    }
    
    // Display featured image
    const postImage = document.getElementById('postImage');
    postImage.src = currentPost.thumbnail;
    postImage.alt = currentPost.title;
}

function updateMetaTags() {
    // Update Open Graph meta tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    
    if (ogTitle) ogTitle.content = currentPost.title;
    if (ogDescription) ogDescription.content = currentPost.excerpt;
    if (ogUrl) ogUrl.content = window.location.href;
    if (ogImage) ogImage.content = currentPost.thumbnail;
    
    // Update regular meta tags
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.content = currentPost.excerpt;
}

// ================================
// Load Post Content (Language-specific)
// ================================

async function loadPostContent() {
    const postContent = document.getElementById('postContent');
    const contentFile = `../blog-posts/${currentSlug}-${currentLanguage}.html`;
    
    try {
        const response = await fetch(contentFile);
        
        if (!response.ok) {
            throw new Error(`Content file not found: ${contentFile}`);
        }
        
        const content = await response.text();
        postContent.innerHTML = content;
        
    } catch (error) {
        console.error('Error loading content:', error);
        postContent.innerHTML = `
            <div style="text-align: center; padding: 3rem; background: var(--bg-secondary); border-radius: 1rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">Content Not Available</h3>
                <p style="color: var(--text-secondary);">
                    The content for this article in ${currentLanguage === 'en' ? 'English' : 'Bengali'} is not available yet.
                    ${currentLanguage === 'bn' ? 'Try switching to English.' : 'Try switching to Bengali.'}
                </p>
            </div>
        `;
    }
}

// ================================
// Language Toggle
// ================================

function initializeLanguageToggle() {
    const languageOptions = document.querySelectorAll('.language-option');
    
    // Set active language
    languageOptions.forEach(option => {
        if (option.dataset.lang === currentLanguage) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    // Add click handlers
    languageOptions.forEach(option => {
        option.addEventListener('click', () => {
            const newLang = option.dataset.lang;
            if (newLang !== currentLanguage) {
                switchLanguage(newLang);
            }
        });
    });
}

async function switchLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('postLanguage', lang);
    
    // Update active state
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
        if (option.dataset.lang === lang) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    // Reload content
    await loadPostContent();
}

// ================================
// Reading Progress Bar
// ================================

function initializeReadingProgress() {
    const progressBar = document.getElementById('readingProgress');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        
        progressBar.style.width = `${progress}%`;
    });
}

// ================================
// Related Posts
// ================================

function loadRelatedPosts() {
    const relatedPostsGrid = document.getElementById('relatedPostsGrid');
    
    // Find posts in same category (excluding current post)
    const relatedPosts = allPosts
        .filter(post => post.category === currentPost.category && post.slug !== currentSlug)
        .slice(0, 3);
    
    if (relatedPosts.length === 0) {
        // If no posts in same category, show latest posts
        const latestPosts = allPosts
            .filter(post => post.slug !== currentSlug)
            .slice(0, 3);
        
        if (latestPosts.length === 0) {
            relatedPostsGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No related articles available yet.</p>';
            return;
        }
        
        relatedPostsGrid.innerHTML = latestPosts.map(post => createRelatedPostCard(post)).join('');
    } else {
        relatedPostsGrid.innerHTML = relatedPosts.map(post => createRelatedPostCard(post)).join('');
    }
}

function createRelatedPostCard(post) {
    return `
        <a href="post.html?slug=${post.slug}" class="related-post-card">
            <img src="${post.thumbnail}" alt="${post.title}" class="related-post-image"
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22180%22%3E%3Crect fill=%22%236366f1%22 width=%22400%22 height=%22180%22/%3E%3Ctext fill=%22white%22 font-family=%22Arial%22 font-size=%2218%22 x=%22200%22 y=%22100%22 text-anchor=%22middle%22%3E${post.category}%3C/text%3E%3C/svg%3E'">
            <div class="related-post-content">
                <span class="related-post-category">${post.category}</span>
                <h3 class="related-post-title">${post.title}</h3>
                <p class="related-post-excerpt">${post.excerpt.substring(0, 100)}...</p>
            </div>
        </a>
    `;
}

// ================================
// Navigation (Previous/Next Posts)
// ================================

function setupNavigation() {
    const currentIndex = allPosts.findIndex(post => post.slug === currentSlug);
    
    // Previous post
    if (currentIndex > 0) {
        const prevPost = allPosts[currentIndex - 1];
        const prevLink = document.getElementById('prevPost');
        prevLink.href = `post.html?slug=${prevPost.slug}`;
        prevLink.querySelector('.nav-title').textContent = prevPost.title;
        prevLink.style.display = 'flex';
    }
    
    // Next post
    if (currentIndex < allPosts.length - 1) {
        const nextPost = allPosts[currentIndex + 1];
        const nextLink = document.getElementById('nextPost');
        nextLink.href = `post.html?slug=${nextPost.slug}`;
        nextLink.querySelector('.nav-title').textContent = nextPost.title;
        nextLink.style.display = 'flex';
    }
}

// ================================
// Social Sharing
// ================================

function setupSocialSharing() {
    const pageUrl = encodeURIComponent(window.location.href);
    const pageTitle = encodeURIComponent(currentPost.title);
    
    // Facebook
    document.getElementById('shareFacebook').href = 
        `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
    
    // Twitter
    document.getElementById('shareTwitter').href = 
        `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;
    
    // LinkedIn
    document.getElementById('shareLinkedIn').href = 
        `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`;
    
    // WhatsApp
    document.getElementById('shareWhatsApp').href = 
        `https://wa.me/?text=${pageTitle}%20${pageUrl}`;
    
    // Copy Link
    document.getElementById('shareCopy').addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            const btn = document.getElementById('shareCopy');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            btn.style.background = 'var(--accent-color)';
            btn.style.color = 'white';
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.style.color = '';
            }, 2000);
        });
    });
}

// ================================
// Error Display
// ================================

function showError(message) {
    const postContent = document.getElementById('postContent');
    const postTitle = document.getElementById('postTitle');
    const postExcerpt = document.getElementById('postExcerpt');
    
    postTitle.textContent = 'Article Not Found';
    postExcerpt.textContent = message;
    
    postContent.innerHTML = `
        <div style="text-align: center; padding: 4rem 2rem; background: var(--bg-secondary); border-radius: 1rem;">
            <i class="fas fa-exclamation-circle" style="font-size: 4rem; color: var(--text-muted); margin-bottom: 1.5rem;"></i>
            <h2 style="color: var(--text-primary); margin-bottom: 1rem;">Oops!</h2>
            <p style="color: var(--text-secondary); margin-bottom: 2rem; font-size: 1.125rem;">${message}</p>
            <a href="blog.html" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.875rem 1.75rem; background: var(--primary-color); color: white; text-decoration: none; border-radius: 0.75rem; font-weight: 600;">
                <i class="fas fa-arrow-left"></i> Back to Blog
            </a>
        </div>
    `;
    
    hideLoadingOverlay();
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