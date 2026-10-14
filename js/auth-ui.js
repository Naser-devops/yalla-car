// ============================================
// Yalla Car — Global Auth UI
// يحدّث الهيدر تلقائياً حسب حالة تسجيل الدخول
// ✅ مُصلَّح: لا يستخدم innerHTML لبيانات المستخدم
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
        return (window.location.pathname.indexOf('/pages/') !== -1) ? '' : 'pages/';
    }

    function getLoginUrl() {
        if (window.location.pathname.indexOf('login.html') === -1) {
            sessionStorage.setItem('redirectAfterLogin', window.location.href);
        }
        return getBasePath() + 'login.html';
    }

    // ============================================
    // 2. ✅ بناء القائمة المنسدلة (آمن — بدون innerHTML)
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

        // --- رأس القائمة ---
        const header = document.createElement('div');
        header.className = 'user-dropdown-header';

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'user-dropdown-avatar';
        avatarDiv.textContent = initial;

        const infoDiv = document.createElement('div');
        infoDiv.className = 'user-dropdown-info';

        // ✅ textContent بدل innerHTML (آمن من XSS)
        const nameEl = document.createElement('strong');
        nameEl.textContent = name;

        const roleEl = document.createElement('small');
        roleEl.textContent = roleLabel;

        infoDiv.appendChild(nameEl);
        infoDiv.appendChild(roleEl);

        header.appendChild(avatarDiv);
        header.appendChild(infoDiv);

        // --- روابط القائمة ---
        const linksWrap = document.createElement('div');
        linksWrap.className = 'user-dropdown-links';

        // بناء الروابط حسب الدور
        const links = buildMenuLinks(user.role, base);
        links.forEach(function (link) {
            linksWrap.appendChild(link);
        });

        // زر تسجيل الخروج
        const logoutBtn = document.createElement('button');
        logoutBtn.type = 'button';
        logoutBtn.className = 'user-dropdown-link user-dropdown-logout';
        logoutBtn.setAttribute('data-logout-global', '1');

        const logoutIcon = document.createElement('span');
        logoutIcon.textContent = '🚪';

        const logoutText = document.createElement('span');
        logoutText.textContent = 'تسجيل الخروج';

        logoutBtn.appendChild(logoutIcon);
        logoutBtn.appendChild(logoutText);

        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            handleLogout();
        });

        linksWrap.appendChild(logoutBtn);

        dropdown.appendChild(header);
        dropdown.appendChild(linksWrap);

        wrap.appendChild(avatarBtn);
        wrap.appendChild(dropdown);

        // --- فتح/إغلاق القائمة ---
        avatarBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            dropdown.classList.toggle('active');
            avatarBtn.classList.toggle('active');
        });

        document.addEventListener('click', function (e) {
            if (!wrap.contains(e.target)) {
                dropdown.classList.remove('active');
                avatarBtn.classList.remove('active');
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && dropdown.classList.contains('active')) {
                dropdown.classList.remove('active');
                avatarBtn.classList.remove('active');
            }
        });

        return wrap;
    }

    // ============================================
    // 2.1 ✅ بناء روابط القائمة حسب الدور
    // ============================================
    function buildMenuLinks(role, base) {
        const links = [];

        function createLink(href, icon, text) {
            const a = document.createElement('a');
            a.href = href;
            a.className = 'user-dropdown-link';

            const iconEl = document.createElement('span');
            iconEl.textContent = icon;

            const textEl = document.createElement('span');
            textEl.textContent = text;

            a.appendChild(iconEl);
            a.appendChild(textEl);

            return a;
        }

        if (role === 'customer') {
            links.push(createLink(base + 'my-bookings.html', '📋', 'حجوزاتي'));
            links.push(createLink(base + 'notifications.html', '🔔', 'الإشعارات'));
            links.push(createLink(base + 'profile.html', '👤', 'ملفي الشخصي'));
        } else if (role === 'company') {
            links.push(createLink(base + 'dashboard.html', '📊', 'لوحة التحكم'));
            links.push(createLink(base + 'my-bookings.html', '📋', 'حجوزاتي'));
            links.push(createLink(base + 'profile.html', '👤', 'ملفي الشخصي'));
        } else if (role === 'admin') {
            links.push(createLink(base + 'admin-approvals.html', '🛡️', 'لوحة الأدمن'));
            links.push(createLink(base + 'profile.html', '👤', 'ملفي الشخصي'));
        }

        return links;
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
    // 5. تحديث الهيدر
    // ============================================
    function updateHeader() {
        const header = document.querySelector('header');
        if (!header) return;

        // احذف القديم من .action
        const action = header.querySelector('.action');
        if (action) {
            action.querySelectorAll('.login-btn, .user-menu-wrap').forEach(function (el) {
                el.remove();
            });
        }

        // ابحث عن .header-user-area أو أنشئه
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

        userArea.querySelectorAll('.login-btn, .user-menu-wrap').forEach(function (el) {
            el.remove();
        });

        const user = getUser();

        if (isLoggedIn()) {
            userArea.appendChild(buildUserMenu(user));
        } else {
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

    window.YallaAuth = {
        isLoggedIn: isLoggedIn,
        getUser: getUser,
        logout: handleLogout,
        refresh: updateHeader
    };

    console.log('✅ Auth UI loaded (XSS-safe)');
})();