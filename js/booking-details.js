// ============================================
// Yalla Car — Booking Details Modal (مشترك)
// يدعم وضعين: customer + company
// ============================================

(function () {
    'use strict';

    function openBookingDetailsModal(booking, options) {
        options = options || {};
        const mode = options.mode || 'customer'; // 'customer' | 'company'

        const IMG_BASE = (window.location.pathname.indexOf('/pages/') !== -1) ? '../' : '';
        const status = booking.status || 'pending';

        // ✅ إضافة 'confirmed' — كان ناقص
        const statusLabels = {
            'pending':   { text: 'قيد الانتظار', cls: 'bd-status-pending', icon: '⏳' },
            'confirmed': { text: 'مؤكد',          cls: 'bd-status-active',  icon: '🟢' },
            'active':    { text: 'نشط',           cls: 'bd-status-active',  icon: '🟢' },
            'completed': { text: 'مكتمل',         cls: 'bd-status-completed', icon: '✅' },
            'cancelled': { text: 'ملغى',          cls: 'bd-status-cancelled', icon: '❌' }
        };

        const statusInfo = statusLabels[status] || statusLabels['pending'];

        const createdAt = booking.createdAt ? new Date(booking.createdAt) : new Date();
        const createdDate = createdAt.toLocaleDateString('ar-JO') + ' - ' + createdAt.toLocaleTimeString('ar-JO', { hour: '2-digit', minute: '2-digit' });

        // ✅ إصلاح: 'confirmed' صار يعتبر "مؤكد"
        const steps = {
            created: true,
            confirmed: (status === 'confirmed' || status === 'active' || status === 'completed'),
            pickedUp: (status === 'completed'),
            returned: (status === 'completed'),
            cancelled: (status === 'cancelled')
        };

        // ✅ Timeline — يتغير حسب الوضع
        const timelineStep2Text = (mode === 'company')
            ? (steps.confirmed ? 'تم تأكيد الحجز بواسطتك' : 'بانتظار تأكيدك')
            : (steps.confirmed ? 'تم تأكيد الحجز' : 'قيد التأكيد من الشركة');

        const timelineStep2Sub = (mode === 'company')
            ? (steps.confirmed ? 'تم التأكيد ✓' : '⚠️ يجب تأكيد الحجز')
            : (steps.confirmed ? 'تم التأكيد' : 'بانتظار موافقة الشركة');

        const timelineStep2Icon = (mode === 'company' && !steps.confirmed)
            ? '⚠️'
            : (steps.confirmed ? '✓' : '⏳');

        let timelineHTML = '';

        if (status === 'cancelled') {
            timelineHTML = `
                <div class="bd-timeline-step done">
                    <div class="bd-timeline-dot">✓</div>
                    <div class="bd-timeline-text">
                        <strong>${mode === 'company' ? 'العميل أنشأ الحجز' : 'تم إنشاء الحجز'}</strong>
                        <span>${createdDate}</span>
                    </div>
                </div>
                <div class="bd-timeline-step done">
                    <div class="bd-timeline-dot" style="background:#DC2626; border-color:#DC2626;">✕</div>
                    <div class="bd-timeline-text">
                        <strong style="color:#DC2626;">${mode === 'company' ? 'تم رفض الحجز' : 'تم إلغاء الحجز'}</strong>
                        <span>${booking.cancelledAt ? new Date(booking.cancelledAt).toLocaleDateString('ar-JO') : '—'}</span>
                    </div>
                </div>
            `;
        } else {
            timelineHTML = `
                <div class="bd-timeline-step done">
                    <div class="bd-timeline-dot">✓</div>
                    <div class="bd-timeline-text">
                        <strong>${mode === 'company' ? 'العميل أنشأ الحجز' : 'تم إنشاء الحجز'}</strong>
                        <span>${createdDate}</span>
                    </div>
                </div>
                <div class="bd-timeline-step ${steps.confirmed ? 'done' : 'current'}">
                    <div class="bd-timeline-dot">${timelineStep2Icon}</div>
                    <div class="bd-timeline-text">
                        <strong>${timelineStep2Text}</strong>
                        <span>${timelineStep2Sub}</span>
                    </div>
                </div>
                <div class="bd-timeline-step ${steps.pickedUp ? 'done' : (steps.confirmed ? 'current' : '')}">
                    <div class="bd-timeline-dot">${steps.pickedUp ? '✓' : '🚗'}</div>
                    <div class="bd-timeline-text">
                        <strong>${steps.pickedUp ? 'تم استلام السيارة' : (mode === 'company' ? 'العميل سيستلم السيارة' : 'استلام السيارة')}</strong>
                        <span>${booking.pickupFormatted || booking.pickup || '—'}</span>
                    </div>
                </div>
                <div class="bd-timeline-step ${steps.returned ? 'done' : ''}">
                    <div class="bd-timeline-dot">${steps.returned ? '✓' : '🏁'}</div>
                    <div class="bd-timeline-text">
                        <strong>${steps.returned ? 'تم إرجاع السيارة' : (mode === 'company' ? 'العميل سيرجع السيارة' : 'إرجاع السيارة')}</strong>
                        <span>${booking.returnFormatted || booking.returnDate || '—'}</span>
                    </div>
                </div>
            `;
        }

        // ✅ WhatsApp
        let waPhone = '962790000000';
        let waText = `مرحباً، بخصوص حجزي رقم ${booking.bookingId || '—'} لسيارة ${booking.carName || ''}`;
        let waLabel = '💬 تواصل مع الشركة';

        if (mode === 'company') {
            waPhone = (booking.customerPhone || '962790000000').replace(/[^0-9]/g, '');
            waText = `مرحباً ${booking.customerName || ''}، بخصوص حجزك رقم ${booking.bookingId || '—'} لسيارة ${booking.carName || ''}`;
            waLabel = '💬 تواصل مع العميل';
        }

        const waLink = `https://wa.me/${waPhone}?text=${encodeURIComponent(waText)}`;

        // ✅ معلومات العميل (في وضع الشركة فقط)
        const customerSectionHTML = (mode === 'company' && (booking.customerName || booking.customerPhone)) ? `
            <h3 class="bd-timeline-title">👤 معلومات العميل</h3>
            <div class="bd-details-grid" style="margin-bottom:24px;">
                <div class="bd-detail-item">
                    <div class="bd-detail-icon">👤</div>
                    <div class="bd-detail-text">
                        <span class="bd-detail-label">الاسم</span>
                        <span class="bd-detail-value">${booking.customerName || '—'}</span>
                    </div>
                </div>
                <div class="bd-detail-item">
                    <div class="bd-detail-icon">📱</div>
                    <div class="bd-detail-text">
                        <span class="bd-detail-label">الهاتف</span>
                        <span class="bd-detail-value">${booking.customerPhone || '—'}</span>
                    </div>
                </div>
            </div>
        ` : '';

        const modalLabel = (mode === 'company') ? 'تفاصيل حجز العميل' : 'تفاصيل الحجز';

        // ✅ أزرار القبول/الرفض السريعة — للحالة pending فقط
        let extraActionHTML = '';
        if (mode === 'company' && status === 'pending') {
            extraActionHTML = `
                <div class="bd-quick-actions" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 0 20px 0;">
                    <button type="button" class="bd-btn bd-btn-quick-reject" id="bdQuickReject"
                        style="background:transparent;color:#DC2626;border:2px solid #DC2626;height:50px;border-radius:12px;font-family:var(--font-main);font-size:14px;font-weight:800;cursor:pointer;">
                        ✕ رفض الحجز
                    </button>
                    <button type="button" class="bd-btn bd-btn-quick-accept" id="bdQuickAccept"
                        style="background:linear-gradient(135deg,#059669,#10B981);color:white;border:none;height:50px;border-radius:12px;font-family:var(--font-main);font-size:14px;font-weight:800;cursor:pointer;box-shadow:0 4px 14px rgba(16,185,129,0.3);">
                        ✓ قبول الحجز
                    </button>
                </div>
            `;
        }

        let overlay = document.getElementById('bdOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'bdOverlay';
            overlay.className = 'bd-overlay';
            document.body.appendChild(overlay);
        }

        overlay.innerHTML = `
            <div class="bd-modal" id="bdModal" role="dialog" aria-modal="true" aria-label="${modalLabel}">
                <button type="button" class="bd-close" id="bdClose" aria-label="إغلاق">✕</button>

                <div class="bd-image-wrap">
                    <img src="${IMG_BASE}${booking.carImage || 'images/kia-picanto-2023.jpg'}" alt="${booking.carName || 'سيارة'}">
                    <div class="bd-image-overlay">
                        <h2 class="bd-car-name">${booking.carName || 'سيارة'}</h2>
                        <span class="bd-car-company">🏢 ${booking.carCompany || '—'}</span>
                    </div>
                </div>

                <div class="bd-body">

                    <div class="bd-header-row">
                        <div class="bd-booking-id">
                            <span class="bd-booking-id-label">رقم الحجز</span>
                            <span class="bd-booking-id-value">${booking.bookingId || '—'}</span>
                        </div>
                        <span class="bd-status ${statusInfo.cls}">
                            ${statusInfo.icon} ${statusInfo.text}
                        </span>
                    </div>

                    ${customerSectionHTML}

                    <div class="bd-details-grid">
                        <div class="bd-detail-item">
                            <div class="bd-detail-icon">📅</div>
                            <div class="bd-detail-text">
                                <span class="bd-detail-label">الاستلام</span>
                                <span class="bd-detail-value">${booking.pickupFormatted || booking.pickup || '—'}</span>
                            </div>
                        </div>

                        <div class="bd-detail-item">
                            <div class="bd-detail-icon">📅</div>
                            <div class="bd-detail-text">
                                <span class="bd-detail-label">الإرجاع</span>
                                <span class="bd-detail-value">${booking.returnFormatted || booking.returnDate || '—'}</span>
                            </div>
                        </div>

                        <div class="bd-detail-item">
                            <div class="bd-detail-icon">⏱️</div>
                            <div class="bd-detail-text">
                                <span class="bd-detail-label">المدة</span>
                                <span class="bd-detail-value">${booking.days || '0'} أيام</span>
                            </div>
                        </div>

                        <div class="bd-detail-item bd-price-highlight">
                            <div class="bd-detail-icon">💰</div>
                            <div class="bd-detail-text">
                                <span class="bd-detail-label">المجموع</span>
                                <span class="bd-detail-value">${booking.total || '0'} د.أ</span>
                            </div>
                        </div>
                    </div>

                    <h3 class="bd-timeline-title">📊 مراحل الحجز</h3>
                    <div class="bd-timeline">
                        ${timelineHTML}
                    </div>

                    ${extraActionHTML}

                    <div class="bd-actions">
                        <a href="${waLink}" target="_blank" rel="noopener" class="bd-btn bd-btn-whatsapp">
                            ${waLabel}
                        </a>
                        <button type="button" class="bd-btn bd-btn-close" id="bdCloseBtn">
                            إغلاق
                        </button>
                    </div>

                </div>
            </div>
        `;

        // ✅ ربط الأحداث
        const closeBtn = overlay.querySelector('#bdClose');
        const closeBtn2 = overlay.querySelector('#bdCloseBtn');

        if (closeBtn) closeBtn.addEventListener('click', closeBookingDetailsModal);
        if (closeBtn2) closeBtn2.addEventListener('click', closeBookingDetailsModal);

        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeBookingDetailsModal();
        });

        document.addEventListener('keydown', handleBdEsc);

        // ✅ أزرار القبول/الرفض السريعة
        const quickAccept = overlay.querySelector('#bdQuickAccept');
        const quickReject = overlay.querySelector('#bdQuickReject');

        if (quickAccept && options.onAccept) {
            quickAccept.addEventListener('click', function () {
                closeBookingDetailsModal();
                if (typeof options.onAccept === 'function') {
                    options.onAccept();
                }
            });
        }

        if (quickReject && options.onReject) {
            quickReject.addEventListener('click', function () {
                closeBookingDetailsModal();
                if (typeof options.onReject === 'function') {
                    options.onReject();
                }
            });
        }

        document.body.style.overflow = 'hidden';

        requestAnimationFrame(function () {
            overlay.classList.add('active');
        });
    }

    function handleBdEsc(e) {
        if (e.key === 'Escape') closeBookingDetailsModal();
    }

    function closeBookingDetailsModal() {
        const overlay = document.getElementById('bdOverlay');
        if (!overlay) return;

        overlay.classList.remove('active');
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleBdEsc);

        setTimeout(function () {
            if (overlay && !overlay.classList.contains('active')) {
                overlay.innerHTML = '';
            }
        }, 300);
    }

    window.YallaBookingDetails = {
        open: openBookingDetailsModal,
        close: closeBookingDetailsModal
    };

    console.log('✅ Booking Details Modal loaded — يدعم customer + company + confirmed');
})();