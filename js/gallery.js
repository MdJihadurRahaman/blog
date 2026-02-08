// ================================
// Global Variables
// ================================

// EMPTY GALLERY DATA - User will add their own photos and videos
const galleryData = {
    photos: [], // Empty - user will add photos
    videos: []  // Empty - user will add videos
};

/* 
   Example structure for when user adds content:
   
   photos: [
       {
           id: 1,
           title: "Photo Title",
           description: "Photo description",
           image: "../images/gallery/photo1.jpg",
           category: "photos"
       }
   ],
   videos: [
       {
           id: 1,
           title: "Video Title",
           description: "Video description",
           videoId: "YouTube_Video_ID",
           thumbnail: "https://img.youtube.com/vi/YouTube_Video_ID/maxresdefault.jpg",
           category: "videos"
       }
   ]
*/

let allPosts = [];
let currentFilter = 'all';
let currentLightboxIndex = 0;
let photoItems = [];
let currentTheme = localStorage.getItem('theme') || 'light';

// ================================
// Initialize
// ================================

document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeNavigation();
    initializeSearch();
    initializeFilters();
    initializeLightbox();
    initializeBackToTop();
    loadGallery();
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
// Filter Functionality
// ================================

function initializeFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            filterGallery();
        });
    });
}

function filterGallery() {
    const items = document.querySelectorAll('.gallery-item');
    let visibleCount = 0;
    
    items.forEach(item => {
        const category = item.dataset.category;
        
        if (currentFilter === 'all' || category === currentFilter) {
            item.classList.remove('hidden');
            visibleCount++;
        } else {
            item.classList.add('hidden');
        }
    });
    
    updateGalleryCount(visibleCount);
}

function updateGalleryCount(count) {
    const galleryCount = document.getElementById('galleryCount');
    if (galleryCount) {
        galleryCount.textContent = count === 1 ? '1 item' : `${count} items`;
    }
}

// ================================
// Load Gallery
// ================================

function loadGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    const emptyGallery = document.getElementById('emptyGallery');
    
    const allItems = [...galleryData.photos, ...galleryData.videos];
    
    if (allItems.length === 0) {
        // Show empty state
        galleryGrid.innerHTML = '';
        emptyGallery.classList.add('show');
        updateGalleryCount(0);
        return;
    }
    
    // Hide empty state
    emptyGallery.classList.remove('show');
    
    // Render gallery items
    galleryGrid.innerHTML = allItems.map(item => createGalleryItem(item)).join('');
    
    // Store photo items for lightbox
    photoItems = galleryData.photos;
    
    // Animate items
    setTimeout(() => {
        const items = document.querySelectorAll('.gallery-item');
        items.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('visible');
            }, index * 50);
        });
    }, 100);
    
    // Add click handlers for photos
    addPhotoClickHandlers();
    
    // Update count
    updateGalleryCount(allItems.length);
}

function createGalleryItem(item) {
    if (item.category === 'photos') {
        return `
            <div class="gallery-item photo-item" data-category="photos" data-photo-id="${item.id}">
                <img src="${item.image}" alt="${item.title}" class="gallery-image">
                <div class="gallery-overlay">
                    <h3 class="gallery-title">${item.title}</h3>
                    <p class="gallery-description">${item.description}</p>
                </div>
                <div class="gallery-icon">
                    <i class="fas fa-search-plus"></i>
                </div>
            </div>
        `;
    } else if (item.category === 'videos') {
        return `
            <div class="gallery-item video-item" data-category="videos">
                <iframe class="video-embed" 
                    src="https://www.youtube.com/embed/${item.videoId}" 
                    title="${item.title}"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
                <div class="gallery-overlay">
                    <h3 class="gallery-title">${item.title}</h3>
                    <p class="gallery-description">${item.description}</p>
                </div>
                <div class="gallery-icon">
                    <i class="fas fa-play"></i>
                </div>
            </div>
        `;
    }
}

// ================================
// Lightbox for Photos
// ================================

function initializeLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    
    // Close lightbox
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    
    // Navigation
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
    }
    
    if (lightboxNext) {
        lightboxNext.addEventListener('click', () => navigateLightbox(1));
    }
    
    // Close on background click
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            navigateLightbox(-1);
        } else if (e.key === 'ArrowRight') {
            navigateLightbox(1);
        }
    });
    
    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                navigateLightbox(1); // Swipe left - next
            } else {
                navigateLightbox(-1); // Swipe right - prev
            }
        }
    }
}

function addPhotoClickHandlers() {
    const photoItems = document.querySelectorAll('.photo-item');
    
    photoItems.forEach(item => {
        item.addEventListener('click', () => {
            const photoId = parseInt(item.dataset.photoId);
            openLightbox(photoId);
        });
    });
}

function openLightbox(photoId) {
    const index = photoItems.findIndex(photo => photo.id === photoId);
    if (index === -1) return;
    
    currentLightboxIndex = index;
    displayLightboxImage();
    
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function navigateLightbox(direction) {
    currentLightboxIndex += direction;
    
    // Wrap around
    if (currentLightboxIndex < 0) {
        currentLightboxIndex = photoItems.length - 1;
    } else if (currentLightboxIndex >= photoItems.length) {
        currentLightboxIndex = 0;
    }
    
    displayLightboxImage();
}

function displayLightboxImage() {
    if (photoItems.length === 0) return;
    
    const photo = photoItems[currentLightboxIndex];
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxCounter = document.getElementById('lightboxCounter');
    
    lightboxImage.src = photo.image;
    lightboxImage.alt = photo.title;
    lightboxCaption.textContent = photo.title;
    lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${photoItems.length}`;
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