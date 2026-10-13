// ============================================
// Yalla Car — JavaScript صفحة تسجيل الدخول
// نظام الأدوار الكامل: customer / company / admin
// ============================================


// ============================================
// 0. قوائم الإيميلات (مؤقتة — للتجربة)
// ============================================
// ⚠️ TODO: استبدلها بـ Backend API في المرحلة القادمة
// ⚠️ لا يمكن الاعتماد على Frontend للتحقق الأمني

const MOCK_ADMIN_EMAILS = [
    'admin@yallacar.jo',
    'manager@yallacar.jo'
];

const MOCK_COMPANY_EMAILS = [
    'company@test.com',
    'ram@rentals.jo',
    'petra@wheels.jo'
];

// خريطة أسماء الشركات (للترحيب لاحقاً)
const COMPANY_NAMES = {
    'company@test.com': 'Ram Rentals',
    'ram@rentals.jo': 'Ram Rentals',
    'petra@wheels.jo': 'Petra Car'
};


// ============================================
// 1. تبديل التابين (Login / Register)
// ============================================
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');

function switchTab(target) {
    authTabs.forEach(function (t) {
        t.classList.remove('active');
        if (t.getAttribute('data-tab') === target) {
            t.classList.add('active');
        }
    });

    authForms.forEach(function (f) {
        f.classList.remove('active');
    });

    const targetForm = document.getElementById(target + 'Form');
    if (targetForm) {
        targetForm.classList.add('active');
    }
}

authTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
        switchTab(this.getAttribute('data-tab'));
    });
});

document.querySelectorAll('[data-tab-switch]').forEach(function (link) {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        switchTab(this.getAttribute('data-tab-switch'));
    });
});


// ============================================
// 2. Toast Notification
// ============================================
const toast = document.getElementById('authToast');
const toastMsg = document.getElementById('authToastMsg');
let toastTimeout = null;

function showToast(message, type) {
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.className = 'auth-toast show ' + (type || 'success');

    if (toastTimeout) clearTimeout(toastTimeout);

    toastTimeout = setTimeout(function () {
        toast.classList.remove('show');
    }, 2500);
}


// ============================================
// 3. تحديد دور المستخدم حسب الإيميل
// ============================================
function checkUserRole(email) {
    const cleanEmail = email.toLowerCase().trim();

    if (MOCK_ADMIN_EMAILS.includes(cleanEmail)) {
        return 'admin';
    }

    if (MOCK_COMPANY_EMAILS.includes(cleanEmail)) {
        return 'company';
    }

    return 'customer';
}


// ============================================
// 4. الحصول على صفحة التوجيه حسب الدور
// ============================================
function getRedirectUrl(role) {
    // لو في صفحة محفوظة قبل تسجيل الدخول → روح لها
    const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
    if (savedRedirect && savedRedirect.indexOf('login.html') === -1) {
        sessionStorage.removeItem('redirectAfterLogin');
        return savedRedirect;
    }

    // وإلا — روح حسب الدور
    if (role === 'admin') {
        return 'admin-approvals.html';
    }
    if (role === 'company') {
        return 'dashboard.html';
    }
    return 'my-bookings.html';
}


// ============================================
// 5. تسجيل الدخول
// ============================================
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        // تحقق أساسي من الإيميل
        if (!email || !email.includes('@')) {
            showToast('❌ البريد الإلكتروني غير صحيح', 'error');
            return;
        }

        // تحقق من طول كلمة المرور (تجريبي)
        if (!password || password.length < 4) {
            showToast('❌ كلمة المرور قصيرة جداً', 'error');
            return;
        }

        const role = checkUserRole(email);

        console.log('محاولة تسجيل دخول:', { email: email, role: role });

        // تجهيز بيانات المستخدم
        const userData = {
            email: email,
            role: role,
            loggedIn: true,
            loginTime: new Date().toISOString()
        };

        // لو شركة → احفظ اسم الشركة
        if (role === 'company' && COMPANY_NAMES[email.toLowerCase()]) {
            userData.companyName = COMPANY_NAMES[email.toLowerCase()];
        }

        // حفظ في localStorage
        localStorage.setItem('user', JSON.stringify(userData));

        // التوجيه حسب الدور
        const redirectUrl = getRedirectUrl(role);

        let welcomeMsg = '✅ تم تسجيل الدخول بنجاح!';
        if (role === 'admin') {
            welcomeMsg = '🔐 مرحباً أيها المدير! جاري الدخول...';
        } else if (role === 'company') {
            welcomeMsg = '🏢 مرحباً بك في لوحة شركتك!';
        }

        showToast(welcomeMsg, 'success');

        setTimeout(function () {
            window.location.href = redirectUrl;
        }, 1500);
    });
}


// ============================================
// 6. إنشاء حساب جديد
// ============================================
const registerForm = document.getElementById('registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;

        // تحقق
        if (!name || name.length < 3) {
            showToast('❌ الاسم قصير جداً', 'error');
            return;
        }

        if (!email || !email.includes('@')) {
            showToast('❌ البريد الإلكتروني غير صحيح', 'error');
            return;
        }

        if (!password || password.length < 6) {
            showToast('❌ كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
            return;
        }

        console.log('محاولة إنشاء حساب:', { name: name, email: email });

        // حفظ بيانات المستخدم (كل حساب جديد = customer)
        localStorage.setItem('user', JSON.stringify({
            name: name,
            email: email,
            role: 'customer',
            loggedIn: true,
            loginTime: new Date().toISOString()
        }));

        showToast('✅ تم إنشاء الحساب! جاري التوجيه...', 'success');

        setTimeout(function () {
            window.location.href = 'my-bookings.html';
        }, 1500);
    });
}