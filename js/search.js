// ============================================
// Yalla Car — JavaScript صفحة البحث
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
    // 2. قراءة الفلاتر من الرابط
    // ============================================
    (function readUrlFilters() {
        const params = new URLSearchParams(window.location.search);
        const typeParam = params.get('type');
        const cityParam = params.get('city');

        console.log('🔗 URL params:', { type: typeParam, city: cityParam });

        if (typeParam) {
            const checkbox = document.querySelector('input[name="type"][value="' + typeParam + '"]');
            if (checkbox) {
                checkbox.checked = true;
                console.log('✅ تم تفعيل فلتر:', typeParam);
            }
        }
    })();


    // ============================================
    // 3. المتغيرات
    // ============================================
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');

    const applyBtn = document.getElementById('applyFilters');
    const resetBtn = document.getElementById('resetFilters');

    const sortSelect = document.getElementById('sortSelect');
    const resultsContainer = document.querySelector('.search-results');
    const resultCards = document.querySelectorAll('.result-card');
    const resultsCount = document.getElementById('resultsCount');
    const noResults = document.getElementById('noResults');


    // ============================================
    // 4. فلتر السعر
    // ============================================
    if (priceRange && priceValue) {
        priceRange.addEventListener('input', function () {
            priceValue.textContent = this.value + ' د.أ';
        });
    }


    // ============================================
    // 5. جمع الفلاتر
    // ============================================
    function getSelectedFilters() {
        const types = [];
        const seats = [];
        const companies = [];

        document.querySelectorAll('input[name="type"]:checked').forEach(function (cb) {
            types.push(cb.value);
        });

        document.querySelectorAll('input[name="seats"]:checked').forEach(function (cb) {
            seats.push(cb.value);
        });

        document.querySelectorAll('input[name="company"]:checked').forEach(function (cb) {
            companies.push(cb.value);
        });

        const maxPrice = priceRange ? parseInt(priceRange.value) : 150;

        return {
            types: types,
            seats: seats,
            companies: companies,
            maxPrice: maxPrice
        };
    }


    // ============================================
    // 6. تطبيق الفلترة
    // ============================================
    function applyFilters() {
        const filters = getSelectedFilters();
        let visibleCount = 0;

        resultCards.forEach(function (card) {
            const cardPrice = parseInt(card.getAttribute('data-price')) || 0;
            const cardType = card.getAttribute('data-type') || '';
            const cardSeats = card.getAttribute('data-seats') || '';
            const cardCompany = card.getAttribute('data-company') || '';

            const matchesPrice = cardPrice <= filters.maxPrice;
            const matchesType = filters.types.length === 0 || filters.types.includes(cardType);
            const matchesSeats = filters.seats.length === 0 || filters.seats.includes(cardSeats);
            const matchesCompany = filters.companies.length === 0 || filters.companies.includes(cardCompany);

            const isMatch = matchesPrice && matchesType && matchesSeats && matchesCompany;

            if (isMatch) {
                card.style.display = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (resultsCount) {
            resultsCount.textContent = visibleCount;
        }

        if (noResults) {
            noResults.style.display = (visibleCount === 0) ? 'block' : 'none';
        }

        console.log('📊 نتائج الفلترة:', visibleCount, 'من', resultCards.length);
    }


    // ============================================
    // 7. إعادة تعيين
    // ============================================
    function resetFilters() {
        document.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
            cb.checked = false;
        });

        if (priceRange) {
            priceRange.value = priceRange.max;
        }
        if (priceValue) {
            priceValue.textContent = priceRange.max + ' د.أ';
        }

        if (sortSelect) {
            sortSelect.value = 'default';
        }

        resultCards.forEach(function (card) {
            card.style.display = '';
        });

        if (resultsContainer) {
            resultCards.forEach(function (card) {
                resultsContainer.appendChild(card);
            });
        }

        if (resultsCount) {
            resultsCount.textContent = resultCards.length;
        }

        if (noResults) {
            noResults.style.display = 'none';
        }

        console.log('🔄 تم إعادة تعيين الفلاتر');
    }


    // ============================================
    // 8. الترتيب
    // ============================================
    function applySorting(sortBy) {
        if (!resultsContainer) return;

        const cardsArray = Array.from(resultCards);

        if (sortBy === 'cheapest') {
            cardsArray.sort(function (a, b) {
                return parseInt(a.getAttribute('data-price')) - parseInt(b.getAttribute('data-price'));
            });
        } else if (sortBy === 'expensive') {
            cardsArray.sort(function (a, b) {
                return parseInt(b.getAttribute('data-price')) - parseInt(a.getAttribute('data-price'));
            });
        } else if (sortBy === 'rating') {
            cardsArray.sort(function (a, b) {
                return parseFloat(b.getAttribute('data-rating')) - parseFloat(a.getAttribute('data-rating'));
            });
        }

        if (sortBy !== 'default') {
            cardsArray.forEach(function (card) {
                resultsContainer.appendChild(card);
            });
        }
    }


    // ============================================
    // 9. الأحداث
    // ============================================
    if (applyBtn) {
        applyBtn.addEventListener('click', function () {
            applyFilters();
            if (sortSelect && sortSelect.value !== 'default') {
                applySorting(sortSelect.value);
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            applySorting(this.value);
        });
    }

    if (priceRange) {
        priceRange.addEventListener('change', function () {
            applyFilters();
        });
    }


    // ============================================
    // 10. تطبيق الفلتر الأولي من الرابط
    // ============================================
    setTimeout(function () {
        const params = new URLSearchParams(window.location.search);
        if (params.get('type')) {
            applyFilters();
            console.log('✅ تم تطبيق فلتر من الرابط تلقائياً');
        }
    }, 200);

})();