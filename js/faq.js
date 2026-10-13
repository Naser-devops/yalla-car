// ============================================
// Yalla Car — JavaScript صفحة الأسئلة الشائعة
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

        // إعادة إظهار كل الأسئلة داخل المجموعة (لو كان فيه بحث سابق)
        group.querySelectorAll('.faq-item').forEach(function (item) {
            item.classList.remove('hidden');
        });
    });

    // إذا في بحث نشط → أعد تطبيقه
    if (searchInput && searchInput.value.trim()) {
        filterBySearch(searchInput.value);
    } else {
        // أخفِ "لا نتائج"
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
// 4. ✅ البحث (مع إصلاح الأقسام المخفية)
// ============================================
function filterBySearch(query) {
    const q = query.trim().toLowerCase();
    let totalVisible = 0;

    // ✅ خطوة 1: إعادة ضبط كل الأقسام (قبل الفلترة)
    faqGroups.forEach(function (group) {
        group.classList.remove('hidden');
    });

    // ✅ خطوة 2: فلترة كل سؤال
    faqItems.forEach(function (item) {
        const questionText = item.getAttribute('data-question') || '';
        const answerEl = item.querySelector('.faq-answer');
        const answerText = answerEl ? answerEl.textContent : '';
        const combined = (questionText + ' ' + answerText).toLowerCase();

        const match = combined.includes(q);

        // تحقق أيضاً من التصنيف النشط
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

    // ✅ خطوة 3: أخفِ المجموعات الفارغة
    faqGroups.forEach(function (group) {
        const visibleItems = group.querySelectorAll('.faq-item:not(.hidden)');

        if (visibleItems.length === 0) {
            group.classList.add('hidden');
        } else {
            group.classList.remove('hidden');
        }
    });

    // ✅ خطوة 4: عرض/إخفاء "لا نتائج"
    if (noResults) {
        if (totalVisible === 0) {
            noResults.classList.add('visible');
        } else {
            noResults.classList.remove('visible');
        }
    }

    // ✅ خطوة 5: زر المسح
    if (searchClear) {
        if (q.length > 0) {
            searchClear.classList.add('visible');
        } else {
            searchClear.classList.remove('visible');
        }
    }
}


// ============================================
// 5. أحداث البحث (مع debounce)
// ============================================
if (searchInput) {
    let searchTimeout = null;

    searchInput.addEventListener('input', function () {
        clearTimeout(searchTimeout);
        const q = this.value;

        searchTimeout = setTimeout(function () {
            // لو فاضي → رجع للتصنيف النشط
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
// 6. إغلاق باقي الأسئلة عند فتح واحد
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