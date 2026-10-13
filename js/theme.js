// ============================================
// Yalla Car — Theme Switcher (Dark/Light Mode)
// ============================================

(function () {
    'use strict';

    // حماية من التشغيل المزدوج
    if (window.__yallaThemeLoaded) return;
    window.__yallaThemeLoaded = true;

    const THEME_KEY = 'yallacar_theme';
    const html = document.documentElement;

    // ============================================
    // 1. تطبيق الثيم المحفوظ فوراً (قبل render الصفحة)
    // ============================================
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    html.setAttribute('data-theme', savedTheme);

    // ============================================
    // 2. دالة تبديل الثيم
    // ============================================
    function toggleTheme() {
        const current = html.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';

        html.setAttribute('data-theme', newTheme);
        localStorage.setItem(THEME_KEY, newTheme);

        // تحديث أيقونة جميع الأزرار
        document.querySelectorAll('.theme-toggle').forEach(function (btn) {
            btn.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
            btn.setAttribute('aria-label',
                newTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
            );
        });
    }

    // ============================================
    // 3. إنشاء زر التبديل
    // ============================================
    function createToggleButton() {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'theme-toggle';
        btn.innerHTML = savedTheme === 'dark' ? '☀️' : '🌙';
        btn.setAttribute('aria-label',
            savedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
        );
        btn.addEventListener('click', toggleTheme);
        return btn;
    }

    // ============================================
    // 4. حقن الزر في المكان المناسب
    // ============================================
    function injectButton() {
        // تجنب التكرار
        if (document.querySelector('.theme-toggle')) return;

        const btn = createToggleButton();

        // (1) الهيدر العادي (index, search, about, contact, etc.)
        const action = document.querySelector('header .action');
        if (action) {
            action.insertBefore(btn, action.firstChild);
            return;
        }

        // (2) admin header
        const adminRight = document.querySelector('.admin-header-right');
        if (adminRight) {
            adminRight.insertBefore(btn, adminRight.firstChild);
            return;
        }

        // (3) صفحات auth (login, register-company)
        const authBody = document.querySelector('.auth-body, .register-body, .pending-page');
        if (authBody) {
            btn.classList.add('theme-toggle-fixed');
            document.body.appendChild(btn);
            return;
        }

        // (4) fallback — ثابت في الزاوية
        btn.classList.add('theme-toggle-fixed');
        document.body.appendChild(btn);
    }

    // ============================================
    // 5. الحقن بعد تحميل DOM
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectButton);
    } else {
        injectButton();
    }

    // ============================================
    // 6. ✅ مراقبة تغيير اللغة (dir فقط)
    // ============================================
    // قبل الإصلاح: يراقب كل attribute
    // بعد الإصلاح: يراقب dir فقط
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.attributeName === 'dir') {
                // اللغة تغيرت — نحدّث aria-label للزر
                const current = html.getAttribute('data-theme');
                document.querySelectorAll('.theme-toggle').forEach(function (btn) {
                    btn.setAttribute('aria-label',
                        current === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
                    );
                });
            }
        });
    });

    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['dir']   // ⬅️ فقط dir — أداء أفضل
    });

})();