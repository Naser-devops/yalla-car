// ============================================
// Yalla Car — JavaScript صفحة البحث
// (خاص بهذه الصفحة فقط)
// ============================================


// ============================================
// 1. سنة الفوتر تلقائية
// ============================================
const yearElement = document.getElementById('year');
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


// ============================================
// 2. فلتر السعر — تحديث الرقم أثناء السحب
// ============================================
const priceRange = document.getElementById('priceRange');
const priceValue = document.getElementById('priceValue');

if (priceRange && priceValue) {
    priceRange.addEventListener('input', function () {
        priceValue.textContent = this.value + ' د.أ';
    });
}


// ============================================
// 3. زر "تطبيق الفلاتر" — جلب القيم المختارة
// ============================================
const applyBtn = document.getElementById('applyFilters');

if (applyBtn) {
    applyBtn.addEventListener('click', function () {
        // جمع كل الـ checkboxes المفعّلة
        const selectedTypes = [];
        const selectedSeats = [];
        const selectedCompanies = [];

        document.querySelectorAll('input[name="type"]:checked').forEach(function (cb) {
            selectedTypes.push(cb.value);
        });

        document.querySelectorAll('input[name="seats"]:checked').forEach(function (cb) {
            selectedSeats.push(cb.value);
        });

        document.querySelectorAll('input[name="company"]:checked').forEach(function (cb) {
            selectedCompanies.push(cb.value);
        });

        const maxPrice = priceRange ? priceRange.value : 150;

        // عرض النتائج في الـ Console (مؤقتاً — حتى نبني الـ Backend)
        console.log('الفلاتر المختارة:', {
            types: selectedTypes,
            seats: selectedSeats,
            companies: selectedCompanies,
            maxPrice: maxPrice + ' د.أ'
        });

        // تنبيه للمستخدم — مؤقت
        alert('الفلاتر:\n' +
            'النوع: ' + (selectedTypes.join(', ') || 'الكل') + '\n' +
            'المقاعد: ' + (selectedSeats.join(', ') || 'الكل') + '\n' +
            'الشركة: ' + (selectedCompanies.join(', ') || 'الكل') + '\n' +
            'أعلى سعر: ' + maxPrice + ' د.أ');
    });
}


// ============================================
// 4. الترتيب — يشتغل بصرياً (Frontend فقط)
// ============================================
const sortSelect = document.getElementById('sortSelect');
const resultsContainer = document.querySelector('.search-results');

if (sortSelect && resultsContainer) {
    sortSelect.addEventListener('change', function () {
        const sortBy = this.value;
        console.log('ترتيب حسب:', sortBy);

        // (التطبيق الفعلي للترتيب يكون بالـ Backend)
    });
}