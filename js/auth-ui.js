// ============================================
// Yalla Car — Global Auth UI
// يحدّث الهيدر تلقائياً حسب حالة تسجيل الدخول
// يعمل على كل الصفحات (index, search, car-details, ...)
// ============================================

(function () {
    'use strict';

    if (window.__yallaAuthUI) return;
    window.__yallaAuthUI = true;

    const USER_KEY = 'user';

    // ============================================
    // 1. الأدوات المساعدة
    // ============================================
    function getUser() {
        try {
            return JSON.parse(localStorage.getItem(USER_KEY) || '{}');
        } catch (e) {
            return {};
        }
    }

    function isLoggedIn() {
        const user = getUser();
        return !!user.loggedIn;
    }

    function getUserName(user) {
        if (user.name) return user.name;
        if (user.companyName) return user.companyName;
        if (user.email) return user.email.split('@')[0];
        return 'مستخدم';
    }

    function getUserInitial(user) {
        const name = getUserName(user);
        return name ? name.charAt(0).toUpperCase() : '👤';
    }

    function getRoleLabel(role) {
        const map = {
            'customer': 'عميل',
            'company': 'شركة',
            'admin': 'مدير'
        };
        return map[role] || 'مستخدم';
    }

    function getBasePath() {
        // لو إحنا في pages/, نرجع '', وإلا 'pages/'
        return (window.location.pathname.indexOf('/pages/') !== -1) ? '' : 'pages/';
    }

    function getLoginUrl() {
        // احفظ الصفحة الحالية للتوجيه بعد تسجيل الدخول
        if (window.location.pathname.indexOf('login.html') === -1) {
            sessionStorage.setItem('redirectAfterLogin', window.location.href);
        }
        return getBasePath() + 'login.html';
    }

    // ============================================
    // 2. بناء قائمة المستخدم
    // ============================================
    function buildUserMenu(user) {
        const base = getBasePath();
        const initial = getUserInitial(user);
        const name = getUserName(user);
        const roleLabel = getRoleLabel(user.role);

        const wrap = document.createElement('div');
        wrap.className = 'user-menu-wrap';

        // زر الأفاتار
        const avatarBtn = document.createElement('button');
        avatarBtn.type = 'button';
        avatarBtn.className = 'user-avatar-btn';
        avatarBtn.setAttribute('aria-label', 'قائمة المستخدم');
        avatarBtn.textContent = initial;

        // القائمة المنسدلة
        const dropdown = document.createElement('div');
        dropdown.className = 'user-dropdown';

        let linksHTML = '';

        if (user.role === 'customer') {
            linksHTML += `
                <a href="${base}my-bookings.html" class="user-dropdown-link">
                    <span>📋</span>
                    <span>حجوزاتي</span>
                </a>
                <a href="${base}notifications.html" class="user-dropdown-link">
                    <span>🔔</span>
                    <span>الإشعارات</span>
                </a>
                <a href="${base}profile.html" class="user-dropdown-link">
                    <span>👤</span>
                    <span>ملفي الشخصي</span>
                </a>
            `;
        } else if (user.role === 'company') {
            linksHTML += `
                <a href="${base}dashboard.html" class="user-dropdown-link">
                    <span>📊</span>
                    <span>لوحة التحكم</span>
                </a>
                <a href="${base}my-bookings.html" class="user-dropdown-link">
                    <span>📋</span>
                    <span>حجوزاتي</span>
                </a>
                <a href="${base}profile.html" class="user-dropdown-link">
                    <span>👤</span>
                    <span>ملفي الشخصي</span>
                </a>
            `;
        } else if (user.role === 'admin') {
            linksHTML += `
                <a href="${base}admin-approvals.html" class="user-dropdown-link">
                    <span>🛡️</span>
                    <span>لوحة الأدمن</span>
                </a>
                <a href="${base}profile.html" class="user-dropdown-link">
                    <span>👤</span>
                    <span>ملفي الشخصي</span>
                </a>
            `;
        }

        dropdown.innerHTML = `
            <div class="user-dropdown-header">
                <div class="user-dropdown-avatar">${initial}</div>
                <div class="user-dropdown-info">
                    <strong>${name}</strong>
                    <small>${roleLabel}</small>
                </div>
            </div>
            <div class="user-dropdown-links">
                ${linksHTML}
                <button type="button" class="user-dropdown-link user-dropdown-logout" data-logout-global>
                    <span>🚪</span>
                    <span>تسجيل الخروج</span>
                </button>
            </div>
        `;

        wrap.appendChild(avatarBtn);
        wrap.appendChild(dropdown);

        // فتح/إغلاق القائمة
        avatarBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            dropdown.classList.toggle('active');
            avatarBtn.classList.toggle('active');
        });

        // إغلاق عند الضغط خارج القائمة
        document.addEventListener('click', function (e) {
            if (!wrap.contains(e.target)) {
                dropdown.classList.remove('active');
                avatarBtn.classList.remove('active');
            }
        });

        // إغلاق بـ Escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && dropdown.classList.contains('active')) {
                dropdown.classList.remove('active');
                avatarBtn.classList.remove('active');
            }
        });

        // زر تسجيل الخروج
        const logoutBtn = dropdown.querySelector('[data-logout-global]');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function (e) {
                e.preventDefault();
                handleLogout();
            });
        }

        return wrap;
    }

    // ============================================
    // 3. بناء زر تسجيل الدخول
    // ============================================
    function buildLoginButton() {
        const btn = document.createElement('a');
        btn.href = getLoginUrl();
        btn.className = 'login-btn';
        btn.setAttribute('data-i18n', 'auth.login');
        btn.textContent = 'تسجيل الدخول';
        return btn;
    }

    // ============================================
    // 4. تسجيل الخروج
    // ============================================
    function handleLogout() {
        localStorage.removeItem('user');
        console.log('👋 تم تسجيل الخروج');
        window.location.href = getBasePath() + 'login.html';
    }

  // ============================================
// 5. ✅ تحديث الهيدر (Avatar/Login داخل .header-user-area)
// ============================================
function updateHeader() {
    const header = document.querySelector('header');
    if (!header) return;

    // --- احذف القديم من .action (لو موجود) ---
    const action = header.querySelector('.action');
    if (action) {
        action.querySelectorAll('.login-btn, .user-menu-wrap').forEach(function (el) {
            el.remove();
        });
    }

    // --- ابحث عن .header-user-area أو أنشئه ---
    let userArea = header.querySelector('.header-user-area');
    if (!userArea) {
        userArea = document.createElement('div');
        userArea.className = 'header-user-area';
        const logo = header.querySelector('.logo');
        if (logo && logo.parentNode) {
            logo.parentNode.insertBefore(userArea, logo.nextSibling);
        } else {
            header.appendChild(userArea);
        }
    }

    // --- احذف أي عناصر قديمة من userArea ---
    userArea.querySelectorAll('.login-btn, .user-menu-wrap').forEach(function (el) {
        el.remove();
    });

    const user = getUser();

    if (isLoggedIn()) {
        // ✅ مسجّل → Avatar مع قائمة منسدلة
        userArea.appendChild(buildUserMenu(user));
    } else {
        // ✅ غير مسجّل → زر تسجيل الدخول
        userArea.appendChild(buildLoginButton());

        if (typeof loadLanguage === 'function') {
            const lang = localStorage.getItem('lang') || 'ar';
            loadLanguage(lang);
        }
    }
}

    // ============================================
    // 6. ربط أزرار data-logout (fallback)
    // ============================================
    function bindFallbackLogout() {
        document.querySelectorAll('[data-logout]').forEach(function (btn) {
            if (btn.dataset.logoutBound) return;
            btn.dataset.logoutBound = '1';

            btn.addEventListener('click', function (e) {
                e.preventDefault();
                handleLogout();
            });
        });
    }

    // ============================================
    // 7. التشغيل
    // ============================================
    function init() {
        updateHeader();
        bindFallbackLogout();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // تصدير للاستخدام العام
    window.YallaAuth = {
        isLoggedIn: isLoggedIn,
        getUser: getUser,
        logout: handleLogout,
        refresh: updateHeader
    };

    console.log('✅ Auth UI loaded');
})();