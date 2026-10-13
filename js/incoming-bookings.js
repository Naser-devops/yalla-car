// ============================================
// Yalla Car — JavaScript صفحة الحجوزات الواردة
// ============================================


// ============================================
// 0. 🛡️ فحص الصلاحيات (Auth Guard — Company/Admin فقط)
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

        if (user.role !== 'company' && user.role !== 'admin') {
            console.warn('🚫 هذه الصفحة للشركات فقط');
            alert('هذه الصفحة مخصصة للشركات فقط');
            window.location.href = 'index.html';
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
// 2. المتغيرات الأساسية
// ============================================
const tabs = document.querySelectorAll('.bookings-tab');
const rows = document.querySelectorAll('#bookingsTable tbody tr');
const searchInput = document.getElementById('searchInput');

const modalOverlay = document.getElementById('confirmModal');
const modalIcon = document.getElementById('modalIcon');
const modalTitle = document.getElementById('modalTitle');
const modalText = document.getElementById('modalText');
const modalConfirm = document.getElementById('modalConfirm');
const modalCancel = document.getElementById('modalCancel');

const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');


// ============================================
// 3. عرض Toast Notification
// ============================================
let toastTimeout = null;

function showToast(message, type) {
    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;
    toast.className = 'toast show ' + (type || 'success');

    if (toastTimeout) clearTimeout(toastTimeout);

    toastTimeout = setTimeout(function () {
        toast.classList.remove('show');
    }, 3000);
}


// ============================================
// 4. فتح Modal التأكيد
// ============================================
function openModal(options) {
    if (!modalOverlay) return;

    modalIcon.textContent = options.icon || '⚠️';
    modalTitle.textContent = options.title || 'تأكيد';
    modalText.textContent = options.text || 'هل أنت متأكد؟';
    modalConfirm.textContent = options.confirmText || 'تأكيد';

    modalConfirm.className = 'btn-modal-confirm';
    if (options.confirmClass) {
        modalConfirm.classList.add(options.confirmClass);
    }

    modalOverlay.dataset.action = 'pending';
    modalConfirm._onConfirm = options.onConfirm;

    modalOverlay.classList.add('active');
}


// ============================================
// 5. إغلاق Modal
// ============================================
function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
    delete modalOverlay.dataset.action;
}


// ============================================
// 6. أحداث الـ Modal
// ============================================
if (modalCancel) modalCancel.addEventListener('click', closeModal);

if (modalOverlay) {
    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
}

if (modalConfirm) {
    modalConfirm.addEventListener('click', function () {
        const action = modalConfirm._onConfirm;
        closeModal();
        if (typeof action === 'function') {
            action();
        }
    });
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
        closeModal();
    }
});


// ============================================
// 7. فلترة حسب التاب
// ============================================
tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
        const filter = this.getAttribute('data-filter');

        tabs.forEach(function (t) {
            t.classList.remove('active');
        });
        this.classList.add('active');

        rows.forEach(function (row) {
            const status = row.getAttribute('data-status');

            if (filter === 'all' || filter === status) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
});


// ============================================
// 8. البحث
// ============================================
if (searchInput) {
    searchInput.addEventListener('input', function () {
        const query = this.value.trim().toLowerCase();

        rows.forEach(function (row) {
            const customer = (row.getAttribute('data-customer') || '').toLowerCase();
            const car = (row.getAttribute('data-car') || '').toLowerCase();

            if (customer.includes(query) || car.includes(query)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}


// ============================================
// 9. ✅ إعادة تحميل الترجمة بعد أي تعديل ديناميكي
// ============================================
function refreshTranslations() {
    // لو دالة loadLanguage موجودة من i18n.js → استدعها
    if (typeof loadLanguage === 'function') {
        const currentLang = localStorage.getItem('lang') || 'ar';
        loadLanguage(currentLang);
    }
}


// ============================================
// 10. تغيير حالة الحجز (قبول / رفض)
// ============================================
function updateBookingStatus(row, newStatus) {
    row.setAttribute('data-status', newStatus);

    // --- تحديث الشارة ---
    const badge = row.querySelector('.status-badge');
    if (badge) {
        // مسح الكلاسات القديمة
        badge.className = 'status-badge status-' + newStatus;

        // ✅ نستخدم data-i18n بدل نص ثابت (يتوافق مع الترجمة)
        if (newStatus === 'confirmed') {
            badge.setAttribute('data-i18n', 'incoming.status.confirmed');
            badge.textContent = 'مؤكد';
        } else if (newStatus === 'cancelled') {
            badge.setAttribute('data-i18n', 'incoming.status.cancelled');
            badge.textContent = 'ملغى';
        } else if (newStatus === 'pending') {
            badge.setAttribute('data-i18n', 'incoming.status.pending');
            badge.textContent = 'قيد الانتظار';
        }
    }

    // --- تحديث خلية الإجراءات ---
    const actionsCell = row.querySelector('.cell-actions');
    if (actionsCell) {
        // ✅ نستخدم createElement بدل innerHTML (أكثر أماناً + نحافظ على data-i18n)
        actionsCell.innerHTML = '';

        const detailsBtn = document.createElement('button');
        detailsBtn.type = 'button';
        detailsBtn.className = 'btn-details';
        detailsBtn.setAttribute('data-i18n', 'incoming.details');
        detailsBtn.textContent = 'تفاصيل';

        actionsCell.appendChild(detailsBtn);
    }

    // ✅ إعادة تفعيل الترجمة للعناصر الجديدة
    refreshTranslations();
}


// ============================================
// 11. أزرار القبول
// ============================================
document.querySelectorAll('.btn-accept').forEach(function (btn) {
    btn.addEventListener('click', function () {
        const row = this.closest('tr');
        const customer = row.getAttribute('data-customer') || 'العميل';

        openModal({
            icon: '✓',
            title: 'تأكيد الحجز',
            text: 'هل تريد قبول حجز ' + customer + '؟',
            confirmText: 'نعم، اقبل',
            confirmClass: 'success',
            onConfirm: function () {
                updateBookingStatus(row, 'confirmed');
                showToast('✅ تم قبول الحجز بنجاح', 'success');
                console.log('✅ Accepted booking for:', customer);
            }
        });
    });
});


// ============================================
// 12. أزرار الرفض
// ============================================
document.querySelectorAll('.btn-reject').forEach(function (btn) {
    btn.addEventListener('click', function () {
        const row = this.closest('tr');
        const customer = row.getAttribute('data-customer') || 'العميل';

        openModal({
            icon: '✕',
            title: 'رفض الحجز',
            text: 'هل تريد رفض حجز ' + customer + '؟ هذا الإجراء لا يمكن التراجع عنه.',
            confirmText: 'نعم، ارفض',
            confirmClass: 'danger',
            onConfirm: function () {
                updateBookingStatus(row, 'cancelled');
                showToast('تم رفض الحجز', 'error');
                console.log('❌ Rejected booking for:', customer);
            }
        });
    });
});


// ============================================
// 13. زر التفاصيل (مؤقتاً — حتى نبني صفحة تفاصيل الحجز)
// ============================================
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('btn-details')) {
        const row = e.target.closest('tr');
        const customer = row.getAttribute('data-customer') || 'العميل';
        showToast('عرض تفاصيل ' + customer + ' — قريباً', 'success');
    }
});


// ============================================
// 14. تسجيل الخروج (موحّد)
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