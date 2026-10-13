// ============================================
// Yalla Car — JavaScript صفحة 404
// ============================================


// ============================================
// 1. سنة الفوتر تلقائية
// ============================================
const yearElement = document.getElementById('year');
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


// ============================================
// 2. تحريك السيارة تلقائياً (اختياري)
// ============================================
// نُحرك السيارة قليلاً عند مرور الماوس على الرسمة
// (إضافة للمتعة البصرية)

const carSvg = document.querySelector('.car-zero svg');

if (carSvg) {
    carSvg.addEventListener('mouseenter', function () {
        this.style.transition = 'transform 0.4s ease';
        this.style.transform = 'translateX(8px) scale(1.05)';
    });

    carSvg.addEventListener('mouseleave', function () {
        this.style.transform = 'translateX(0) scale(1)';
    });
}


// ============================================
// 3. تسجيل الصفحة في الـ Console
// ============================================
console.log('🚗 404: المستخدم وصل لصفحة غير موجودة');
console.log('📍 المسار المطلوب:', window.location.pathname);