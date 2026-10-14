// ============================================
// Yalla Car — Language Switcher (i18n)
// ============================================

(function () {
    'use strict';

    // ============================================
    // 1. دالة تحميل اللغة (مكشوفة على window)
    // ============================================
    async function loadLanguage(lang) {
        const base = (window.location.pathname.indexOf('/pages/') !== -1) ? '../' : '';
        try {
            const response = await fetch(base + 'lang/' + lang + '.json');
            const texts = await response.json();

            document.querySelectorAll('[data-i18n]').forEach(function (el) {
                const key = el.getAttribute('data-i18n');
                if (texts[key]) {
                    el.textContent = texts[key];
                }
            });

            document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
                const key = el.getAttribute('data-i18n-placeholder');
                if (texts[key]) {
                    el.placeholder = texts[key];
                }
            });

            // ✅ عنوان الصفحة يُحدَّث فقط لو ما كان فيه data-i18n مخصص
            const titleEl = document.querySelector('title');
            const titleKey = titleEl ? titleEl.getAttribute('data-i18n') : null;

            if (titleKey && texts[titleKey]) {
                document.title = texts[titleKey];
            } else if (texts['meta.title'] && (!titleKey)) {
                document.title = texts['meta.title'];
            }

            document.documentElement.lang = lang;
            document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';

        } catch (error) {
            console.warn('i18n: Could not load', lang, error);
        }
    }

    // ✅ كشف الدالة على window عشان باقي الملفات تستخدمها
    window.loadLanguage = loadLanguage;


    // ============================================
    // 2. التشغيل الأولي + زر التبديل
    // ============================================
    const langBtn = document.querySelector('.en');
    let currentLang = localStorage.getItem('lang') || 'ar';

    loadLanguage(currentLang);

    if (langBtn) {
        langBtn.addEventListener('click', function () {
            currentLang = (currentLang === 'ar') ? 'en' : 'ar';
            localStorage.setItem('lang', currentLang);
            loadLanguage(currentLang);
        });
    }

})();