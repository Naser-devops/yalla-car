// ============================================
// Yalla Car — Main JavaScript
// ============================================

// ============================================
// 1. Fade-in عند Scroll
// ============================================
const fadeElements = document.querySelectorAll(
    '.car-card, .category-card, .step-card, .partner-card'
);

if (fadeElements.length > 0) {
    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(function (el) {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}


// ============================================
// 2. سنة الفوتر تلقائية
// ============================================
const yearElement = document.getElementById('year');
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}