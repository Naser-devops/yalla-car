// ============================================
// Yalla Car — JavaScript صفحة الأرباح
// ============================================


// ============================================
// 0. 🛡️ فحص الصلاحيات (Auth Guard — Company/Admin فقط)
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

        if (user.role !== 'company' && user.role !== 'admin') {
            console.warn('🚫 هذه الصفحة للشركات فقط');
            alert('هذه الصفحة مخصصة للشركات فقط');
            window.location.href = 'index.html';
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
// 2. إعادة تحميل الترجمة بعد التحديث الديناميكي
// ============================================
function refreshTranslations() {
    if (typeof loadLanguage === 'function') {
        const currentLang = localStorage.getItem('lang') || 'ar';
        loadLanguage(currentLang);
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
// 4. دالة تحديث KPI (بطريقة آمنة)
// ============================================
function updateKpiValues(data) {
    // ✅ نستخدم data-kpi بدل ترتيب Array — أكثر ضماناً
    const keys = ['total', 'commission', 'net', 'avg'];
    const currencyText = ' د.أ';

    keys.forEach(function (key) {
        const el = document.querySelector('[data-kpi="' + key + '"]');
        if (el && data[key] !== undefined) {
            // ✅ نستخدم textContent بدل innerHTML (أكثر أماناً)
            // نبحث عن span العملة جواه لو موجود
            const currencySpan = el.querySelector('[data-i18n="car.currency"]');

            if (currencySpan) {
                // لو في span عملة داخلي، نحدّث النص بس
                // نمسح النص الأصلي ونحط الرقم الجديد
                el.childNodes[0].textContent = data[key] + ' ';
            } else {
                // ما في span — نحط النص كامل
                el.textContent = data[key] + currencyText;
            }
        }
    });
}


// ============================================
// 5. تفعيل فلتر الفترة
// ============================================
periodButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
        const period = this.getAttribute('data-period');
        const data = mockData[period];

        if (!data) return;

        // تحديث الحالة النشطة
        periodButtons.forEach(function (b) {
            b.classList.remove('active');
        });
        this.classList.add('active');

        // تحديث KPI
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
// 7. تسجيل الخروج (موحّد)
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