// ============================================
// Yalla Car — JavaScript صفحة تسجيل الدخول
// ✅ مُصلَّح: redirect آمن (يمنع التحويلات الخارجية)
// ============================================

(function () {
    'use strict';

    // ============================================
    // 0. قوائم الإيميلات
    // ⚠️ مؤقت للتطوير فقط — يُحذف عند ربط PHP + MySQL
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
    // 0.1 ✅ دالة إعادة توجيه آمنة
    // ============================================
    function getSafeRedirect(savedRedirect, fallbackUrl) {
        // لو ما فيه redirect محفوظ → استخدم الافتراضي
        if (!savedRedirect || typeof savedRedirect !== 'string') {
            return fallbackUrl;
        }

        try {
            // resolve الرابط بالنسبة للـ origin الحالي
            const target = new URL(savedRedirect, window.location.origin);

            // ✅ رفض أي رابط لموقع خارجي
            if (target.origin !== window.location.origin) {
                console.warn('🚫 Redirect blocked (external origin):', savedRedirect);
                return fallbackUrl;
            }

            // ✅ رفض أي protocol غير http/https
            if (target.protocol !== 'http:' && target.protocol !== 'https:') {
                console.warn('🚫 Redirect blocked (unsafe protocol):', savedRedirect);
                return fallbackUrl;
            }

            return target.href;

        } catch (err) {
            // لو الرابط غير صالح أصلاً
            console.warn('🚫 Invalid redirect URL:', savedRedirect);
            return fallbackUrl;
        }
    }


    // ============================================
    // 0.2 إذا المستخدم مسجّل → وجّهه مباشرة
    // ============================================
    (function checkAlreadyLoggedIn() {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (!user.loggedIn) return;

            const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
            let fallback;

            if (user.role === 'admin') fallback = 'admin-approvals.html';
            else if (user.role === 'company') fallback = 'dashboard.html';
            else fallback = 'my-bookings.html';

            // ✅ استخدام الدالة الآمنة
            const target = getSafeRedirect(savedRedirect, fallback);

            if (savedRedirect) {
                sessionStorage.removeItem('redirectAfterLogin');
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
    // 4. ✅ صفحة التوجيه (آمنة)
    // ============================================
    function getRedirectUrl(role) {
        // الوجهة الافتراضية حسب الدور
        let fallback;
        if (role === 'admin') fallback = 'admin-approvals.html';
        else if (role === 'company') fallback = 'dashboard.html';
        else fallback = 'my-bookings.html';

        // قراءة الـ redirect المحفوظ
        const savedRedirect = sessionStorage.getItem('redirectAfterLogin');

        if (savedRedirect) {
            sessionStorage.removeItem('redirectAfterLogin');
        }

        // ✅ استخدام الدالة الآمنة
        return getSafeRedirect(savedRedirect, fallback);
    }


    // ============================================
    // 5. تسجيل الدخول
    // ⚠️ مؤقت — يتحقق محلياً. سيُنقل إلى PHP + MySQL
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

        console.log('محاولة تسجيل دخول:', {
            email: email,
            formRole: formRole,
            actualRole: actualRole
        });

        // ⚠️ هذا التحقق مؤقت — سيُنقل إلى الخادم
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