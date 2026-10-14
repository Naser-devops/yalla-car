// ============================================
// Yalla Car — JavaScript لوحة التحكم الرئيسية
// ============================================

(function () {
    'use strict';

    // ============================================
    // 0. 🛡️ فحص الصلاحيات
    // ============================================
    (function checkAuth() {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');

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
    // 1. سنة الفوتر
    // ============================================
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }


    // ============================================
    // 2. اسم الشركة ديناميكي
    // ============================================
    function loadCompanyName() {
        const welcomeCompanyEl = document.getElementById('welcomeCompany');
        if (!welcomeCompanyEl) return;

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            let companyName = user.companyName || user.name;

            if (!companyName && user.email) {
                companyName = user.email.split('@')[0];
            }

            if (!companyName) {
                companyName = 'شركتك';
            }

            welcomeCompanyEl.textContent = companyName;
            console.log('🏢 اسم الشركة:', companyName);
        } catch (err) {
            console.error('خطأ في تحميل اسم الشركة:', err);
            welcomeCompanyEl.textContent = 'شركتك';
        }
    }

    loadCompanyName();


    // ============================================
    // 3. عرض التاريخ الحالي
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
    // 4. تسجيل الخروج
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
    // 5. تفاعل أعمدة الرسم البياني
    // ============================================
    const miniBars = document.querySelectorAll('.chart-bar-mini');

    miniBars.forEach(function (bar) {
        bar.addEventListener('click', function () {
            const value = this.getAttribute('data-value');
            console.log('📊 عدد الحجوزات:', value);
        });
    });

})();