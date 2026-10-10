async function loadLanguage(lang) {
    const response = await fetch(`lang/${lang}.json`);
    const texts = await response.json();

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
        const key = el.getAttribute('data-i18n');
        el.textContent = texts[key];
    });

    document.documentElement.lang = lang;

    if (lang === 'ar') {
        document.documentElement.dir = 'rtl';
    } else {
        document.documentElement.dir = 'ltr';
    }
}

const langBtn = document.querySelector('.en');
let currentLang = 'ar';

langBtn.addEventListener('click', function () {
    if (currentLang === 'ar') {
        currentLang = 'en';
    } else {
        currentLang = 'ar';
    }
    loadLanguage(currentLang);
});



