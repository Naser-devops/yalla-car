// ============================================
// Yalla Car — JavaScript صفحة الأرباح
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
                sessionStorage.setItem('redirectAfterLogin', window.location.href);
                window.location.href = 'login.html';
                return;
            }

            if (user.role !== 'company' && user.role !== 'admin') {
                alert('هذه الصفحة مخصصة للشركات فقط');
                window.location.href = '../index.html';
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
    // 2. إعادة تحميل الترجمة
    // ============================================
    function refreshTranslations() {
        if (typeof window.loadLanguage === 'function') {
            const currentLang = localStorage.getItem('lang') || 'ar';
            window.loadLanguage(currentLang);
        }
    }


    // ============================================
    // 3. فلتر الفترة الزمنية
    // ============================================
    const periodButtons = document.querySelectorAll('.period-btn');

    const mockData = {
        month: {
            total: '4,100',
            commission: '410',
            net: '3,690',
            avg: '342'
        },
        quarter: {
            total: '12,450',
            commission: '1,245',
            net: '11,205',
            avg: '328'
        },
        year: {
            total: '38,200',
            commission: '3,820',
            net: '34,380',
            avg: '316'
        }
    };


    // ============================================
    // 4. دالة تحديث KPI
    // ============================================
    function updateKpiValues(data) {
        const keys = ['total', 'commission', 'net', 'avg'];

        keys.forEach(function (key) {
            const el = document.querySelector('[data-kpi="' + key + '"]');
            if (el && data[key] !== undefined) {
                const currencySpan = el.querySelector('[data-i18n="car.currency"]');

                if (currencySpan && el.childNodes[0] && el.childNodes[0].nodeType === 3) {
                    el.childNodes[0].textContent = data[key] + ' ';
                } else {
                    el.textContent = data[key] + ' ';
                    if (currencySpan) {
                        el.appendChild(currencySpan);
                    } else {
                        const newSpan = document.createElement('span');
                        newSpan.setAttribute('data-i18n', 'car.currency');
                        newSpan.textContent = 'د.أ';
                        el.appendChild(newSpan);
                    }
                }
            }
        });

        refreshTranslations();
    }


    // ============================================
    // 5. تفعيل فلتر الفترة
    // ============================================
    periodButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const period = this.getAttribute('data-period');
            const data = mockData[period];

            if (!data) return;

            periodButtons.forEach(function (b) {
                b.classList.remove('active');
            });
            this.classList.add('active');

            updateKpiValues(data);

            console.log('📊 تم تحديث الفترة:', period);
        });
    });


    // ============================================
    // 6. تفاعل أعمدة الرسم البياني
    // ============================================
    const chartBars = document.querySelectorAll('.chart-bar');

    chartBars.forEach(function (bar) {
        bar.addEventListener('click', function () {
            const value = this.getAttribute('data-value');
            console.log('💰 الشهر المختار:', value, 'د.أ');
        });
    });


    // ============================================
    // 7. تسجيل الخروج
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

})();