// ============================================
// Yalla Car — JavaScript لوحة التحكم الرئيسية
// ============================================


// ============================================
// 0. 🛡️ فحص الصلاحيات (Auth Guard)
// ============================================
// ⚠️ هذا حماية مؤقتة على الـ Frontend
// الحماية الحقيقية تكون في الـ Backend (لاحقاً)
(function checkAuth() {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        // لو ما في تسجيل دخول → رجّعه لصفحة Login
        if (!user.loggedIn) {
            console.warn('🚫 وصول مرفوض: يجب تسجيل الدخول أولاً');
            sessionStorage.setItem('redirectAfterLogin', window.location.href);
            window.location.href = 'login.html';
            return;
        }

        console.log('✅ مرحباً', user.email, '| الدور:', user.role);
    } catch (err) {
        console.error('Auth check error:', err);
        window.location.href = 'login.html';
    }
})();


// ============================================
// 1. سنة الفوتر تلقائية
// ============================================
const yearElement = document.getElementById('year');
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


// ============================================
// 2. عرض التاريخ الحالي في الترحيب
// ============================================
const monthNamesAr = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const welcomeDayEl = document.getElementById('welcomeDay');
const welcomeMonthEl = document.getElementById('welcomeMonth');
const welcomeYearEl = document.getElementById('welcomeYear');

if (welcomeDayEl && welcomeMonthEl && welcomeYearEl) {
    const now = new Date();
    welcomeDayEl.textContent = now.getDate();
    welcomeMonthEl.textContent = monthNamesAr[now.getMonth()];
    welcomeYearEl.textContent = now.getFullYear();
}


// ============================================
// 3. تسجيل الخروج (موحّد لكل الصفحات)
// ============================================
function logoutUser() {
    localStorage.removeItem('user');
    console.log('👋 تم تسجيل الخروج');
    window.location.href = 'login.html';
}

document.querySelectorAll('[data-logout]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        logoutUser();
    });
});


// ============================================
// 4. تفاعل أعمدة الرسم البياني
// ============================================
const miniBars = document.querySelectorAll('.chart-bar-mini');

miniBars.forEach(function (bar) {
    bar.addEventListener('click', function () {
        const value = this.getAttribute('data-value');
        console.log('📊 عدد الحجوزات:', value);
    });
});