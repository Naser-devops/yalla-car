// ============================================
// Yalla Car — JavaScript صفحة البحث
// (فلترة فعلية — Client-side Filtering)
// ============================================


// ============================================
// 1. سنة الفوتر تلقائية
// ============================================
const yearElement = document.getElementById('year');
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


// ============================================
// 2. المتغيرات الأساسية
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
// 3. فلتر السعر — تحديث الرقم أثناء السحب
// ============================================
if (priceRange && priceValue) {
    priceRange.addEventListener('input', function () {
        priceValue.textContent = this.value + ' د.أ';
    });
}


// ============================================
// 4. جمع الفلاتر المختارة
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
// 5. ✅ تطبيق الفلترة الفعلية
// ============================================
function applyFilters() {
    const filters = getSelectedFilters();
    let visibleCount = 0;

    resultCards.forEach(function (card) {
        const cardPrice = parseInt(card.getAttribute('data-price')) || 0;
        const cardType = card.getAttribute('data-type') || '';
        const cardSeats = card.getAttribute('data-seats') || '';
        const cardCompany = card.getAttribute('data-company') || '';

        // فحص كل شرط
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

    // تحديث عدّاد النتائج
    if (resultsCount) {
        resultsCount.textContent = visibleCount;
    }

    // إظهار/إخفاء رسالة "لا نتائج"
    if (noResults) {
        noResults.style.display = (visibleCount === 0) ? 'block' : 'none';
    }

    console.log('📊 نتائج الفلترة:', visibleCount, 'من', resultCards.length);
}


// ============================================
// 6. ✅ إعادة تعيين الفلاتر
// ============================================
function resetFilters() {
    // مسح كل الـ checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
        cb.checked = false;
    });

    // إعادة شريط السعر
    if (priceRange) {
        priceRange.value = priceRange.max;
    }
    if (priceValue) {
        priceValue.textContent = priceRange.max + ' د.أ';
    }

    // إعادة الترتيب للافتراضي
    if (sortSelect) {
        sortSelect.value = 'default';
    }

    // إعادة ترتيب الكروت للأصل
    resultCards.forEach(function (card) {
        card.style.display = '';
    });

    // إعادة ترتيب DOM
    if (resultsContainer) {
        resultCards.forEach(function (card) {
            resultsContainer.appendChild(card);
        });
    }

    // تحديث العدّاد
    if (resultsCount) {
        resultsCount.textContent = resultCards.length;
    }

    if (noResults) {
        noResults.style.display = 'none';
    }

    console.log('🔄 تم إعادة تعيين الفلاتر');
}


// ============================================
// 7. ✅ الترتيب الفعلي
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
    // 'default' → ما نغيّر الترتيب

    if (sortBy !== 'default') {
        // إعادة إدراج الكروت بالترتيب الجديد
        cardsArray.forEach(function (card) {
            resultsContainer.appendChild(card);
        });
    }
}


// ============================================
// 8. ربط الأحداث
// ============================================

// زر "تطبيق الفلاتر"
if (applyBtn) {
    applyBtn.addEventListener('click', function () {
        applyFilters();
        // إعادة تطبيق الترتيب لو موجود
        if (sortSelect && sortSelect.value !== 'default') {
            applySorting(sortSelect.value);
        }
    });
}

// زر "إعادة تعيين"
if (resetBtn) {
    resetBtn.addEventListener('click', resetFilters);
}

// تغيير الترتيب
if (sortSelect) {
    sortSelect.addEventListener('change', function () {
        applySorting(this.value);
    });
}

// تطبيق فوري عند تغيير شريط السعر (اختياري — أكثر تفاعلية)
if (priceRange) {
    priceRange.addEventListener('change', function () {
        applyFilters();
    });
}