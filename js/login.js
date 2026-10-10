// ============================================
// Yalla Car — JavaScript صفحة تسجيل الدخول
// ============================================


// ============================================
// 1. تبديل التابين (Login / Register)
// ============================================
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');

function switchTab(target) {
    // تحديث التابين
    authTabs.forEach(function (t) {
        t.classList.remove('active');
        if (t.getAttribute('data-tab') === target) {
            t.classList.add('active');
        }
    });

    // تحديث النماذج
    authForms.forEach(function (f) {
        f.classList.remove('active');
    });

    const targetForm = document.getElementById(target + 'Form');
    if (targetForm) {
        targetForm.classList.add('active');
    }
}

// عند الضغط على تاب
authTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
        switchTab(this.getAttribute('data-tab'));
    });
});

// عند الضغط على رابط "أنشئ حساب" أو "تسجيل الدخول" (جوّا النموذج)
document.querySelectorAll('[data-tab-switch]').forEach(function (link) {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        switchTab(this.getAttribute('data-tab-switch'));
    });
});


// ============================================
// 2. معالجة إرسال النماذج
// ============================================
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // مؤقتاً — حتى نبني الـ Backend
        console.log('محاولة تسجيل دخول:', { email: email, password: '***' });

        alert(
            '✅ تسجيل الدخول!\n\n' +
            'البريد: ' + email + '\n\n' +
            '(بانتظار ربط الـ Backend)'
        );
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        // مؤقتاً — حتى نبني الـ Backend
        console.log('محاولة إنشاء حساب:', { name: name, email: email, password: '***' });

        alert(
            '✅ تم إنشاء الحساب!\n\n' +
            'الاسم: ' + name + '\n' +
            'البريد: ' + email + '\n\n' +
            '(بانتظار ربط الـ Backend)'
        );
    });
}