// ============================================
// Yalla Car — JavaScript صفحة تفاصيل السيارة
// ============================================


// ============================================
// 1. سنة الفوتر تلقائية
// ============================================
const yearElement = document.getElementById('year');
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


// ============================================
// 2. بيانات السيارات (مؤقتاً — حتى الباك إند)
// ============================================
const carsData = {
    '1': {
        name: 'Kia Picanto 2023',
        company: 'Ram Rentals',
        companyInitial: 'R',
        companySince: '2024',
        price: 22,
        seats: 5,
        year: 2023,
        images: [
            'images/kia-picanto-2023.jpg',
            'images/kia-picanto-2023-side.jpg',
            'images/kia-picanto-2023-rear.jpg'
        ]
    },
    '2': {
        name: 'Toyota Corolla 2023',
        company: 'Amman Rent',
        companyInitial: 'A',
        companySince: '2024',
        price: 28,
        seats: 5,
        year: 2023,
        images: [
            'images/toyota-corolla-2023.jpg',
            'images/toyota-corolla-2023-side.jpg',
            'images/toyota-corolla-2023-rear.jpg'
        ]
    },
    '3': {
        name: 'Hyundai Tucson 2024',
        company: 'Petra Car',
        companyInitial: 'P',
        companySince: '2023',
        price: 45,
        seats: 5,
        year: 2024,
        images: [
            'images/hyundai-tucson-2024.jpg',
            'images/hyundai-tucson-2024-side.jpg',
            'images/hyundai-tucson-2024-rear.jpg'
        ]
    },
    '4': {
        name: 'Mercedes C200',
        company: 'Nukhba Car',
        companyInitial: 'N',
        companySince: '2024',
        price: 85,
        seats: 5,
        year: 2024,
        images: [
            'images/mercedes-c200.jpg',
            'images/mercedes-c200-side.jpg',
            'images/mercedes-c200-rear.jpg'
        ]
    }
};


// ============================================
// 3. قراءة id السيارة من الرابط (مع تحقق)
// ============================================
const params = new URLSearchParams(window.location.search);
const rawId = params.get('id');
const carId = (rawId && carsData[rawId]) ? rawId : '1';
const car = carsData[carId];

console.log('🚗 تحميل سيارة:', carId, '-', car.name);


// ============================================
// 4. ✅ تعيين صورة بديلة (fallback) عند الخطأ
// ============================================
function setupImageFallback(imgElement, fallbackSrc) {
    if (!imgElement) return;

    imgElement.onerror = function () {
        // منع الحلقة اللانهائية
        this.onerror = null;

        // استخدم الصورة الأساسية للسيارة
        if (this.src !== fallbackSrc) {
            this.src = fallbackSrc;
        }
    };
}


// ============================================
// 5. تعبئة بيانات السيارة في الصفحة
// ============================================
function fillCarData() {
    // --- تحديث العنوان في المتصفح ---
    document.title = car.name + ' — يلا كار';

    // --- العناصر الرئيسية ---
    const carNameEl = document.getElementById('carName');
    const breadcrumbNameEl = document.getElementById('breadcrumbName');
    const carCompanyEl = document.getElementById('carCompany');
    const carPriceEl = document.getElementById('carPrice');
    const specSeatsEl = document.getElementById('specSeats');
    const specYearEl = document.getElementById('specYear');
    const companyNameEl = document.getElementById('companyName');
    const companyAvatarEl = document.getElementById('companyAvatar');
    const companySinceEl = document.getElementById('companySince');

    if (carNameEl) carNameEl.textContent = car.name;
    if (breadcrumbNameEl) breadcrumbNameEl.textContent = car.name;
    if (carCompanyEl) carCompanyEl.textContent = car.company;
    if (carPriceEl) carPriceEl.textContent = car.price;
    if (specSeatsEl) specSeatsEl.textContent = car.seats;
    if (specYearEl) specYearEl.textContent = car.year;
    if (companyNameEl) companyNameEl.textContent = car.company;
    if (companyAvatarEl) companyAvatarEl.textContent = car.companyInitial;
    if (companySinceEl) companySinceEl.textContent = car.companySince;

    // --- زر الحجز ---
    const bookBtn = document.getElementById('bookBtn');
    if (bookBtn) {
        bookBtn.href = 'booking.html?id=' + carId;
    }

    // --- الصورة الرئيسية + Fallback ---
    const mainImage = document.getElementById('mainImage');
    if (mainImage) {
        mainImage.src = car.images[0];
        setupImageFallback(mainImage, car.images[0]);
    }

    // --- الصور المصغّرة ---
    const thumbs = document.querySelectorAll('.gallery-thumbs .thumb');
    thumbs.forEach(function (thumb, index) {
        if (car.images[index]) {
            thumb.src = car.images[index];
            thumb.setAttribute('data-idx', index);
            setupImageFallback(thumb, car.images[0]);
        } else {
            // لو ما في صورة → أخفِ المصغّرة
            thumb.style.display = 'none';
        }
    });
}

// تشغيل التعبئة
if (car) {
    fillCarData();
}


// ============================================
// 6. ✅ معرض الصور — التبديل بين الصور
// ============================================
const mainImageEl = document.getElementById('mainImage');
const thumbsEl = document.querySelectorAll('.gallery-thumbs .thumb');

if (mainImageEl && thumbsEl.length > 0) {
    thumbsEl.forEach(function (thumb) {
        thumb.addEventListener('click', function () {
            // لو الصورة مخفية → لا تفعل شي
            if (this.style.display === 'none') return;

            // لو نفس الصورة الحالية → لا تفعل شي
            if (mainImageEl.src === this.src) return;

            // تغيير الصورة الكبيرة
            mainImageEl.src = this.src;

            // إزالة active من كل المصغرات
            thumbsEl.forEach(function (t) {
                t.classList.remove('active');
            });

            // إضافة active للمصغّرة المختارة
            this.classList.add('active');

            console.log('🖼️ تم اختيار الصورة:', this.getAttribute('data-idx'));
        });
    });
}


// ============================================
// 7. ✅ ملاحظة أمان (تعليق تعليمي)
// ============================================
/*
 * ملاحظة: هذه الصفحة عامة (لا تحتاج تسجيل دخول)
 * 
 * لكن زر "احجز الآن" يودّي لصفحة الحجز
 * صفحة الحجز تحتاج تسجيل دخول (لاحقاً في الباك إند)
 * 
 * حالياً: أي زائر يقدر يكبس "احجز الآن" ويفتح booking.html
 * المستقبل: نضيف تحقق في booking.js + الباك إند
 */