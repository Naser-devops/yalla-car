// ============================================
// Yalla Car — Language Switcher (i18n)
// ============================================

async function loadLanguage(lang) {
    try {
        const response = await fetch(`lang/${lang}.json`);
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

        if (texts['meta.title']) {
            document.title = texts['meta.title'];
        }

        document.documentElement.lang = lang;
        document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';

    } catch (error) {
        console.warn('i18n: Could not load', lang, error);
    }
}

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