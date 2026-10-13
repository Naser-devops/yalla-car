// ============================================
// Yalla Car — JavaScript صفحة حجوزاتي
// ============================================


// ============================================
// 0. 🛡️ فحص الصلاحيات (Auth Guard)
// ============================================
(function checkAuth() {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        if (!user.loggedIn) {
            console.warn('🚫 وصول مرفوض: يجب تسجيل الدخول أولاً');
            sessionStorage.setItem('redirectAfterLogin', window.location.href);
            window.location.href = 'login.html';
            return;
        }

        console.log('✅ مرحباً', user.email, '| الدور:', user.role);
    } catch (err) {
        console.error('Auth check error:', err);
        window.location.href = 'login.html';
    }
})();


// ============================================
// 1. سنة الفوتر تلقائية
// ============================================
const yearElement = document.getElementById('year');
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


// ============================================
// 2. Toast Notification
// ============================================
function showToast(message, type) {
    let toast = document.getElementById('myBookingsToast');

    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'myBookingsToast';
        toast.style.cssText = `
            position: fixed;
            top: 40px;
            inset-inline-start: 50%;
            transform: translateX(-50%) translateY(-100px);
            background: linear-gradient(135deg, #047857, #10B981);
            color: white;
            padding: 14px 24px;
            border-radius: 14px;
            font-family: Cairo, sans-serif;
            font-weight: 700;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
            z-index: 2000;
            opacity: 0;
            transition: opacity 0.3s, transform 0.3s;
            pointer-events: none;
            max-width: 90%;
            text-align: center;
        `;
        document.body.appendChild(toast);
    }

    if (type === 'error') {
        toast.style.background = 'linear-gradient(135deg, #B91C1C, #EF4444)';
    } else {
        toast.style.background = 'linear-gradient(135deg, #047857, #10B981)';
    }

    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';

    setTimeout(function () {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-100px)';
    }, 3200);
}


// ============================================
// 3. Modal للتأكيد (بدل confirm)
// ============================================
function createModal() {
    // لو موجود → أرجعه
    let modal = document.getElementById('cancelModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'cancelModal';
    modal.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s;
        padding: 24px;
    `;

    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 16px;
            padding: 32px;
            max-width: 420px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            font-family: Cairo, sans-serif;
            transform: scale(0.9);
            transition: transform 0.3s;
        " id="cancelModalBox">
            <div style="font-size: 48px; line-height: 1; margin-bottom: 16px;">⚠️</div>
            <h3 style="
                font-size: 20px;
                font-weight: 700;
                color: #0F172A;
                margin-bottom: 8px;
            ">تأكيد الإلغاء</h3>
            <p style="
                font-size: 15px;
                color: #64748B;
                margin-bottom: 24px;
                line-height: 1.6;
            " id="cancelModalText">هل أنت متأكد من إلغاء الحجز؟</p>
            <div style="display: flex; gap: 12px;">
                <button type="button" id="cancelModalCancel" style="
                    flex: 1;
                    height: 44px;
                    border-radius: 8px;
                    background: #F8FAFC;
                    color: #0F172A;
                    border: 1px solid #E2E8F0;
                    font-family: Cairo, sans-serif;
                    font-size: 15px;
                    font-weight: 700;
                    cursor: pointer;
                ">رجوع</button>
                <button type="button" id="cancelModalConfirm" style="
                    flex: 1;
                    height: 44px;
                    border-radius: 8px;
                    background: #DC2626;
                    color: white;
                    border: none;
                    font-family: Cairo, sans-serif;
                    font-size: 15px;
                    font-weight: 700;
                    cursor: pointer;
                ">نعم، ألغِ</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    return modal;
}

function openCancelModal(message) {
    const modal = createModal();
    const text = document.getElementById('cancelModalText');
    const box = document.getElementById('cancelModalBox');

    if (text) text.textContent = message;

    modal.style.opacity = '1';
    modal.style.pointerEvents = 'all';
    if (box) box.style.transform = 'scale(1)';
}

function closeCancelModal() {
    const modal = document.getElementById('cancelModal');
    const box = document.getElementById('cancelModalBox');

    if (modal) {
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
    }
    if (box) box.style.transform = 'scale(0.9)';
}


// ============================================
// 4. ربط أحداث Modal (مرة وحدة)
// ============================================
document.addEventListener('click', function (e) {
    if (e.target.id === 'cancelModalCancel') {
        closeCancelModal();
    }

    if (e.target.id === 'cancelModal') {
        closeCancelModal();
    }
});

document.addEventListener('keydown', function (e) {
    const modal = document.getElementById('cancelModal');
    if (e.key === 'Escape' && modal && modal.style.opacity === '1') {
        closeCancelModal();
    }
});


// ============================================
// 5. فلترة الحجوزات حسب التاب
// ============================================
const tabs = document.querySelectorAll('.bookings-tab');
const cards = document.querySelectorAll('.booking-card');

tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
        const filter = this.getAttribute('data-filter');

        tabs.forEach(function (t) {
            t.classList.remove('active');
        });
        this.classList.add('active');

        cards.forEach(function (card) {
            const status = card.getAttribute('data-status');

            // "الكل" يعرض كل شي
            // "النشطة" يعرض active
            // "المكتملة" يعرض completed
            // "الملغاة" يعرض cancelled
            if (filter === 'all' || filter === status) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });
});


// ============================================
// 6. ✅ إلغاء الحجز (بدون cloneNode)
// ============================================
const cancelButtons = document.querySelectorAll('.btn-danger');

cancelButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
        const card = this.closest('.booking-card');
        if (!card) return;

        const carName = card.querySelector('.booking-card-name');
        const carNameText = carName ? carName.textContent : 'هذا الحجز';

        // حفظ مرجع للزر
        const cancelBtn = this;

        // فتح Modal
        openCancelModal('هل أنت متأكد من إلغاء حجز "' + carNameText + '"؟');

        // ربط زر التأكيد (مرة وحدة بالحدث)
        const confirmBtn = document.getElementById('cancelModalConfirm');

        // إزالة المستمعين السابقين بـ replace
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

        newConfirmBtn.addEventListener('click', function () {
            closeCancelModal();
            performCancellation(card, cancelBtn);
        });
    });
});


// ============================================
// 7. ✅ تنفيذ الإلغاء
// ============================================
function performCancellation(card, cancelBtn) {
    // --- 1. تحديث الشارة ---
    const statusBadge = card.querySelector('.booking-status');
    if (statusBadge) {
        statusBadge.className = 'booking-status status-cancelled';
        statusBadge.removeAttribute('data-i18n');
        statusBadge.textContent = 'ملغى';
    }

    // --- 2. تحديث data-status ---
    card.setAttribute('data-status', 'cancelled');

    // --- 3. إضافة كلاس "ملغى" (باهت) ---
    card.classList.add('cancelled');

    // --- 4. ✅ استخراج carId من data-id (بدل regex)
    const detailsLink = card.querySelector('.btn-outline:not(.btn-danger)');
    let carId = '1';

    if (detailsLink) {
        const href = detailsLink.getAttribute('href') || '';
        // نبحث عن id= في الرابط
        const match = href.match(/id=(\d+)/);
        if (match) {
            carId = match[1];
        }
    }

    // --- 5. ✅ تحويل الزر "إلغاء" إلى "احجز مرة أخرى" (بدون cloneNode)
    cancelBtn.textContent = 'احجز مرة أخرى';
    cancelBtn.classList.remove('btn-danger');
    cancelBtn.classList.add('btn-accent');
    cancelBtn.removeAttribute('data-i18n');

    // ✅ إزالة كل مستمعي الحدث القديمين
    // نستخدم خاصية onclick بدل addEventListener (تستبدل تلقائياً)
    cancelBtn.onclick = function () {
        window.location.href = 'booking.html?id=' + carId;
    };

    // --- 6. Toast ---
    showToast('✅ تم إلغاء الحجز بنجاح', 'success');
    console.log('❌ تم إلغاء الحجز للسيارة:', carId);
}


// ============================================
// 8. تسجيل الخروج (موحّد)
// ============================================
function logoutUser() {
    localStorage.removeItem('user');
    console.log('👋 تم تسجيل الخروج');
    window.location.href = 'login.html';
}

document.querySelectorAll('[data-logout]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        logoutUser();
    });
});