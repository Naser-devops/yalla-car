// ============================================
// Yalla Car — JavaScript صفحة الأسئلة الشائعة
// ============================================

(function () {
    'use strict';

    // ============================================
    // 1. سنة الفوتر
    // ============================================
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }


    // ============================================
    // 2. المتغيرات الأساسية
    // ============================================
    const faqGroups = document.querySelectorAll('.faq-group');
    const faqItems = document.querySelectorAll('.faq-item');
    const faqCats = document.querySelectorAll('.faq-cat');
    const searchInput = document.getElementById('faqSearchInput');
    const searchClear = document.getElementById('faqSearchClear');
    const noResults = document.getElementById('faqNoResults');

    let activeCategory = 'all';


    // ============================================
    // 3. الفلترة حسب التصنيف
    // ============================================
    function filterByCategory(cat) {
        activeCategory = cat;

        faqGroups.forEach(function (group) {
            const groupCat = group.getAttribute('data-category');

            if (cat === 'all' || groupCat === cat) {
                group.classList.remove('hidden');
            } else {
                group.classList.add('hidden');
            }

            group.querySelectorAll('.faq-item').forEach(function (item) {
                item.classList.remove('hidden');
            });
        });

        if (searchInput && searchInput.value.trim()) {
            filterBySearch(searchInput.value);
        } else {
            if (noResults) {
                noResults.classList.remove('visible');
            }
        }
    }

    faqCats.forEach(function (catBtn) {
        catBtn.addEventListener('click', function () {
            const cat = this.getAttribute('data-cat');

            faqCats.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');

            filterByCategory(cat);
        });
    });


    // ============================================
    // 4. البحث
    // ============================================
    function filterBySearch(query) {
        const q = query.trim().toLowerCase();
        let totalVisible = 0;

        faqGroups.forEach(function (group) {
            group.classList.remove('hidden');
        });

        faqItems.forEach(function (item) {
            const questionText = item.getAttribute('data-question') || '';
            const answerEl = item.querySelector('.faq-answer');
            const answerText = answerEl ? answerEl.textContent : '';
            const combined = (questionText + ' ' + answerText).toLowerCase();

            const match = combined.includes(q);

            const group = item.closest('.faq-group');
            const groupCat = group ? group.getAttribute('data-category') : 'all';
            const catMatch = (activeCategory === 'all' || groupCat === activeCategory);

            if (match && catMatch) {
                item.classList.remove('hidden');
                totalVisible++;
            } else {
                item.classList.add('hidden');
            }
        });

        faqGroups.forEach(function (group) {
            const visibleItems = group.querySelectorAll('.faq-item:not(.hidden)');

            if (visibleItems.length === 0) {
                group.classList.add('hidden');
            } else {
                group.classList.remove('hidden');
            }
        });

        if (noResults) {
            if (totalVisible === 0) {
                noResults.classList.add('visible');
            } else {
                noResults.classList.remove('visible');
            }
        }

        if (searchClear) {
            if (q.length > 0) {
                searchClear.classList.add('visible');
            } else {
                searchClear.classList.remove('visible');
            }
        }
    }


    // ============================================
    // 5. أحداث البحث
    // ============================================
    if (searchInput) {
        let searchTimeout = null;

        searchInput.addEventListener('input', function () {
            clearTimeout(searchTimeout);
            const q = this.value;

            searchTimeout = setTimeout(function () {
                if (!q.trim()) {
                    filterByCategory(activeCategory);
                    return;
                }

                filterBySearch(q);
            }, 200);
        });
    }

    if (searchClear) {
        searchClear.addEventListener('click', function () {
            searchInput.value = '';
            searchClear.classList.remove('visible');
            filterByCategory(activeCategory);
            if (noResults) {
                noResults.classList.remove('visible');
            }
            searchInput.focus();
        });
    }


    // ============================================
    // 6. إغلاق باقي الأسئلة
    // ============================================
    faqItems.forEach(function (item) {
        item.addEventListener('toggle', function () {
            if (item.open) {
                faqItems.forEach(function (other) {
                    if (other !== item && other.open) {
                        other.open = false;
                    }
                });
            }
        });
    });

})();