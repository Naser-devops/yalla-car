// ============================================
// Yalla Car — JavaScript صفحة "من نحن"
// ============================================


// ============================================
// 1. سنة الفوتر تلقائية
// ============================================
const yearElement = document.getElementById('year');
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


// ============================================
// 2. تأثير العدّ التصاعدي للأرقام
// ============================================
const statNumbers = document.querySelectorAll('.stat-number');

function animateNumber(el) {
    const text = el.textContent.trim();
    const match = text.match(/^([+\-]?)([\d,\.]+)(.*)$/);

    if (!match) return;

    const prefix = match[1] || '';
    const numberStr = match[2].replace(/,/g, '');
    const suffix = match[3] || '';
    const target = parseFloat(numberStr);

    if (isNaN(target)) return;

    const isDecimal = numberStr.includes('.');
    const duration = 1500;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // easing
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;

        let display;
        if (isDecimal) {
            display = current.toFixed(1);
        } else {
            display = Math.floor(current).toLocaleString('en-US');
        }

        el.textContent = prefix + display + suffix;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = prefix + (isDecimal ? target.toFixed(1) : target.toLocaleString('en-US')) + suffix;
        }
    }

    requestAnimationFrame(update);
}

// تشغيل العدّ عند دخول القسم للشاشة
if (statNumbers.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    statNumbers.forEach(function (el) {
        observer.observe(el);
    });
}