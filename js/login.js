// ============================================
// Yalla Car — JavaScript صفحة تسجيل الدخول
// ============================================

(function () {
    'use strict';

    // ============================================
    // 0. قوائم الإيميلات
    // ============================================
    const MOCK_ADMIN_EMAILS = [
        'admin@yallacar.jo',
        'manager@yallacar.jo'
    ];

    const MOCK_COMPANY_EMAILS = [
        'company@test.com',
        'ram@rentals.jo',
        'petra@wheels.jo'
    ];

    const COMPANY_NAMES = {
        'company@test.com': 'Ram Rentals',
        'ram@rentals.jo': 'Ram Rentals',
        'petra@wheels.jo': 'Petra Car'
    };


    // ============================================
    // 0.1 إذا المستخدم مسجّل → وجّهه مباشرة
    // ============================================
    (function checkAlreadyLoggedIn() {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (!user.loggedIn) return;

            const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
            let target = '';

            if (savedRedirect && savedRedirect.indexOf('login.html') === -1) {
                sessionStorage.removeItem('redirectAfterLogin');
                target = savedRedirect;
            } else {
                if (user.role === 'admin') target = 'admin-approvals.html';
                else if (user.role === 'company') target = 'dashboard.html';
                else target = 'my-bookings.html';
            }

            console.log('ℹ️ أنت مسجّل دخول بالفعل — جاري تحويلك...');
            window.location.replace(target);
        } catch (err) {
            console.error('Check logged-in error:', err);
        }
    })();


    // ============================================
    // 1. تبديل التابين (عميل / شركة)
    // ============================================
    const roleTabs = document.querySelectorAll('.auth-role-tab');
    const authForms = document.querySelectorAll('.auth-form');

    function switchRole(role) {
        roleTabs.forEach(function (tab) {
            tab.classList.remove('active');
            if (tab.getAttribute('data-role') === role) {
                tab.classList.add('active');
            }
        });

        authForms.forEach(function (form) {
            form.classList.remove('active');
            if (form.getAttribute('data-role') === role) {
                form.classList.add('active');
            }
        });

        authForms.forEach(function (form) {
            const inputs = form.querySelectorAll('input');
            inputs.forEach(function (input) {
                if (input.type === 'checkbox') {
                    input.checked = false;
                } else {
                    input.value = '';
                }
            });
        });

        console.log('🔄 تم التبديل لوضع:', role);
    }

    roleTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            const role = this.getAttribute('data-role');
            switchRole(role);
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
    // 3. تحديد دور المستخدم
    // ============================================
    function checkUserRole(email) {
        const cleanEmail = email.toLowerCase().trim();

        if (MOCK_ADMIN_EMAILS.includes(cleanEmail)) return 'admin';
        if (MOCK_COMPANY_EMAILS.includes(cleanEmail)) return 'company';
        return 'customer';
    }


    // ============================================
    // 4. صفحة التوجيه
    // ============================================
    function getRedirectUrl(role) {
        const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
        if (savedRedirect && savedRedirect.indexOf('login.html') === -1) {
            sessionStorage.removeItem('redirectAfterLogin');
            return savedRedirect;
        }

        if (role === 'admin') return 'admin-approvals.html';
        if (role === 'company') return 'dashboard.html';
        return 'my-bookings.html';
    }


    // ============================================
    // 5. تسجيل الدخول
    // ============================================
    const customerForm = document.getElementById('customerForm');
    const companyForm = document.getElementById('companyForm');

    function handleLogin(e, formRole) {
        e.preventDefault();

        const emailInput = formRole === 'customer'
            ? document.getElementById('customerEmail')
            : document.getElementById('companyEmail');

        const passwordInput = formRole === 'customer'
            ? document.getElementById('customerPassword')
            : document.getElementById('companyPassword');

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !email.includes('@')) {
            showToast('❌ البريد الإلكتروني غير صحيح', 'error');
            return;
        }

        if (!password || password.length < 4) {
            showToast('❌ كلمة المرور قصيرة جداً', 'error');
            return;
        }

        const actualRole = checkUserRole(email);

        console.log('محاولة تسجيل دخول:', { email: email, formRole: formRole, actualRole: actualRole });

        if (formRole === 'company' && actualRole !== 'company' && actualRole !== 'admin') {
            showToast('❌ هذا الإيميل ليس مسجلاً كشركة', 'error');
            return;
        }

        if (formRole === 'customer' && actualRole === 'company') {
            showToast('💡 هذا الإيميل مسجّل كشركة — جاري تحويلك...', 'success');
            setTimeout(function () {
                switchRole('company');
            }, 1200);
            return;
        }

        const userData = {
            email: email,
            role: actualRole,
            loggedIn: true,
            loginTime: new Date().toISOString()
        };

        if (actualRole === 'company' && COMPANY_NAMES[email.toLowerCase()]) {
            userData.companyName = COMPANY_NAMES[email.toLowerCase()];
        }

        localStorage.setItem('user', JSON.stringify(userData));

        const redirectUrl = getRedirectUrl(actualRole);

        let welcomeMsg = '✅ تم تسجيل الدخول بنجاح!';
        if (actualRole === 'admin') welcomeMsg = '🔐 مرحباً أيها المدير! جاري الدخول...';
        else if (actualRole === 'company') welcomeMsg = '🏢 مرحباً بك في لوحة شركتك!';

        showToast(welcomeMsg, 'success');

        setTimeout(function () {
            window.location.href = redirectUrl;
        }, 1500);
    }

    if (customerForm) {
        customerForm.addEventListener('submit', function (e) {
            handleLogin(e, 'customer');
        });
    }

    if (companyForm) {
        companyForm.addEventListener('submit', function (e) {
            handleLogin(e, 'company');
        });
    }


    // ============================================
    // 6. تسجيل الخروج
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