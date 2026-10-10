// ============================================
// Yalla Car — JavaScript صفحة حجوزاتي
// ============================================


// ============================================
// 1. سنة الفوتر تلقائية
// ============================================
const yearElement = document.getElementById('year');
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


// ============================================
// 2. فلترة الحجوزات حسب التاب
// ============================================
const tabs = document.querySelectorAll('.bookings-tab');
const cards = document.querySelectorAll('.booking-card');

tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
        const filter = this.getAttribute('data-filter');

        // تحديث التاب النشط
        tabs.forEach(function (t) {
            t.classList.remove('active');
        });
        this.classList.add('active');

        // فلترة الكروت
        cards.forEach(function (card) {
            const status = card.getAttribute('data-status');

            if (filter === 'all' || filter === status) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });
});


// ============================================
// 3. زر "إلغاء الحجز"
// ============================================
const cancelButtons = document.querySelectorAll('.btn-danger');

cancelButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {

        // سؤال التأكيد
        const confirmed = confirm('هل أنت متأكد من إلغاء الحجز؟');

        if (!confirmed) return;

        // جيب الكارت الأب
        const card = this.closest('.booking-card');
        if (!card) return;

        // --- 1. تحديث الشارة (Badge) ---
        const statusBadge = card.querySelector('.booking-status');
        if (statusBadge) {
            statusBadge.className = 'booking-status status-cancelled';
            statusBadge.removeAttribute('data-i18n');
            statusBadge.textContent = 'ملغى';
        }

        // --- 2. تحديث data-status للفلترة ---
        card.setAttribute('data-status', 'cancelled');

        // --- 3. إضافة كلاس "ملغى" للكارت (يخليه باهت) ---
        card.classList.add('cancelled');

        // --- 4. تحويل زر "إلغاء" إلى "احجز مرة أخرى" ---
        // نستخرج id السيارة من زر "تفاصيل" الموجود بنفس الكارت
        const detailsLink = card.querySelector('.btn-outline:not(.btn-danger)');
        let carId = '1'; // قيمة افتراضية

        if (detailsLink) {
            const href = detailsLink.getAttribute('href');
            // الرابط يكون: car-details.html?id=1
            const match = href.match(/id=(\d+)/);
            if (match) {
                carId = match[1];
            }
        }

        // تحويل الزر
        this.textContent = 'احجز مرة أخرى';
        this.classList.remove('btn-danger');
        this.classList.add('btn-accent');
        this.removeAttribute('data-i18n'); // نمنع الترجمة من استبداله

        // إزالة الـ listener القديم (اللي بيعمل cancel)
        // ونخلي الزر يودّي لصفحة الحجز
        const newBtn = this.cloneNode(true);
        this.parentNode.replaceChild(newBtn, this);

        newBtn.addEventListener('click', function () {
            window.location.href = 'booking.html?id=' + carId;
        });

    });
});