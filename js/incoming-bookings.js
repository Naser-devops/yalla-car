// ============================================
// Yalla Car — JavaScript صفحة الحجوزات الواردة
// ============================================

(function () {
    'use strict';

    // ============================================
    // 0. 🛡️ فحص الصلاحيات
    // ============================================
    (function checkAuth() {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            if (!user.loggedIn) {
                sessionStorage.setItem('redirectAfterLogin', window.location.href);
                window.location.href = 'login.html';
                return;
            }

            if (user.role !== 'company' && user.role !== 'admin') {
                alert('هذه الصفحة مخصصة للشركات فقط');
                window.location.href = '../index.html';
                return;
            }

            console.log('✅ مرحباً', user.email, '| الدور:', user.role);
        } catch (err) {
            console.error('Auth check error:', err);
            window.location.href = 'login.html';
        }
    })();


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
    // 3. Toast Notification
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
    // 4. Modal التأكيد
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

    function closeModal() {
        if (!modalOverlay) return;
        modalOverlay.classList.remove('active');
        delete modalOverlay.dataset.action;
    }

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
    // 5. فلترة حسب التاب
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
    // 6. البحث
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
    // 7. إعادة تحميل الترجمة
    // ============================================
    function refreshTranslations() {
        if (typeof window.loadLanguage === 'function') {
            const currentLang = localStorage.getItem('lang') || 'ar';
            window.loadLanguage(currentLang);
        }
    }


    // ============================================
    // 8. تغيير حالة الحجز
    // ============================================
    function updateBookingStatus(row, newStatus) {
        row.setAttribute('data-status', newStatus);

        const badge = row.querySelector('.status-badge');
        if (badge) {
            badge.className = 'status-badge status-' + newStatus;

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

        const actionsCell = row.querySelector('.cell-actions');
        if (actionsCell) {
            actionsCell.innerHTML = '';

            const detailsBtn = document.createElement('button');
            detailsBtn.type = 'button';
            detailsBtn.className = 'btn-details';
            detailsBtn.setAttribute('data-i18n', 'incoming.details');
            detailsBtn.textContent = 'تفاصيل';

            actionsCell.appendChild(detailsBtn);
        }

        refreshTranslations();
    }


    // ============================================
    // 9. أزرار القبول
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
    // 10. أزرار الرفض
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
    // 11. زر التفاصيل (يفتح Modal تفاصيل)
    // ============================================
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('btn-details')) {
            const row = e.target.closest('tr');
            if (!row) return;

            const customer = row.getAttribute('data-customer') || 'العميل';
            const car = row.getAttribute('data-car') || 'سيارة';
            const price = row.querySelector('.cell-price');
            const dates = row.querySelector('.cell-dates');
            const status = row.getAttribute('data-status');
            const carImage = row.querySelector('.cell-image img');

            if (window.YallaBookingDetails && typeof window.YallaBookingDetails.open === 'function') {
                window.YallaBookingDetails.open({
                    bookingId: 'BK-' + Math.floor(Math.random() * 90000 + 10000),
                    customerName: customer,
                    customerPhone: '+962 79 000 0000',
                    carName: car,
                    carCompany: 'شركتك',
                    carImage: carImage ? carImage.src.replace(/^.*?images\//, 'images/') : 'images/kia-picanto-2023.jpg',
                    pickupFormatted: dates ? (dates.querySelector('span') ? dates.querySelector('span').textContent : '—') : '—',
                    returnFormatted: '—',
                    days: dates ? (dates.querySelector('small') ? dates.querySelector('small').textContent.replace(/[^\d]/g, '') : '0') : '0',
                    total: price ? price.textContent.replace(/[^\d.]/g, '').trim() : '0',
                    status: status,
                    createdAt: new Date().toISOString()
                }, {
                    mode: 'company',
                    onAccept: function () {
                        updateBookingStatus(row, 'confirmed');
                        showToast('✅ تم قبول الحجز بنجاح', 'success');
                    },
                    onReject: function () {
                        updateBookingStatus(row, 'cancelled');
                        showToast('تم رفض الحجز', 'error');
                    }
                });
            } else {
                showToast('عرض تفاصيل ' + customer + ' — قريباً', 'success');
            }
        }
    });


    // ============================================
    // 12. تسجيل الخروج
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

})();