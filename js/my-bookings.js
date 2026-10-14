// ============================================
// Yalla Car — JavaScript صفحة حجوزاتي
// ============================================

(function () {
    'use strict';

    // ============================================
    // 0. 🛡️ Auth Guard
    // ============================================
    (function checkAuth() {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            if (!user.loggedIn) {
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
    // 1. سنة الفوتر
    // ============================================
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }


    // ============================================
    // 2. Toast Notification (تحت)
    // ============================================
    function showToast(message, type) {
        let toast = document.getElementById('myBookingsToast');

        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'myBookingsToast';
            toast.style.cssText = `
                position: fixed;
                bottom: 30px;
                inset-inline-end: 30px;
                transform: translateY(100px);
                background: linear-gradient(135deg, #047857, #10B981);
                color: white;
                padding: 14px 22px;
                border-radius: 12px;
                font-family: Cairo, sans-serif;
                font-size: 14px;
                font-weight: 700;
                box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
                z-index: 9999;
                opacity: 0;
                transition: opacity 0.3s, transform 0.3s;
                pointer-events: none;
                max-width: 340px;
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
        toast.style.transform = 'translateY(0)';

        setTimeout(function () {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(100px)';
        }, 3200);
    }


    // ============================================
    // 3. Modal مخصص للإلغاء
    // ============================================
    function createConfirmModal() {
        let modal = document.getElementById('cancelConfirmModal');
        if (modal) return modal;

        modal = document.createElement('div');
        modal.id = 'cancelConfirmModal';
        modal.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.65);
            backdrop-filter: blur(6px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 4000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.25s ease;
            padding: 20px;
        `;

        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 20px;
                padding: 32px 28px;
                max-width: 420px;
                width: 100%;
                text-align: center;
                box-shadow: 0 25px 70px rgba(0, 0, 0, 0.3);
                font-family: Cairo, sans-serif;
                transform: scale(0.92) translateY(10px);
                transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            " id="cancelConfirmBox">
                <div style="font-size: 56px; line-height: 1; margin-bottom: 16px;">⚠️</div>
                <h3 style="
                    font-size: 20px;
                    font-weight: 800;
                    color: #0F172A;
                    margin: 0 0 10px 0;
                    letter-spacing: -0.3px;
                ">تأكيد إلغاء الحجز</h3>
                <p style="
                    font-size: 15px;
                    color: #64748B;
                    margin: 0 0 24px 0;
                    line-height: 1.7;
                " id="cancelConfirmText">هل أنت متأكد من إلغاء هذا الحجز؟</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <button type="button" id="cancelConfirmNo" style="
                        height: 48px;
                        border-radius: 12px;
                        background: #F1F5F9;
                        color: #0F172A;
                        border: 1px solid #E2E8F0;
                        font-family: Cairo, sans-serif;
                        font-size: 15px;
                        font-weight: 700;
                        cursor: pointer;
                    ">رجوع</button>
                    <button type="button" id="cancelConfirmYes" style="
                        height: 48px;
                        border-radius: 12px;
                        background: linear-gradient(135deg, #DC2626, #EF4444);
                        color: white;
                        border: none;
                        font-family: Cairo, sans-serif;
                        font-size: 15px;
                        font-weight: 700;
                        cursor: pointer;
                        box-shadow: 0 4px 14px rgba(220, 38, 38, 0.3);
                    ">نعم، ألغِ</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeConfirmModal();
        });

        document.getElementById('cancelConfirmNo').addEventListener('click', closeConfirmModal);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.style.opacity === '1') {
                closeConfirmModal();
            }
        });

        return modal;
    }

    function openConfirmModal(message, onConfirm) {
        const modal = createConfirmModal();
        const box = document.getElementById('cancelConfirmBox');
        const textEl = document.getElementById('cancelConfirmText');
        const yesBtn = document.getElementById('cancelConfirmYes');

        if (textEl) textEl.textContent = message;

        const newYesBtn = yesBtn.cloneNode(true);
        yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);

        newYesBtn.addEventListener('click', function () {
            closeConfirmModal();
            if (typeof onConfirm === 'function') onConfirm();
        });

        modal.style.opacity = '1';
        modal.style.pointerEvents = 'all';
        if (box) box.style.transform = 'scale(1) translateY(0)';
    }

    function closeConfirmModal() {
        const modal = document.getElementById('cancelConfirmModal');
        const box = document.getElementById('cancelConfirmBox');
        if (modal) {
            modal.style.opacity = '0';
            modal.style.pointerEvents = 'none';
        }
        if (box) box.style.transform = 'scale(0.92) translateY(10px)';
    }


    // ============================================
    // 4. قراءة الحجوزات من localStorage
    // ============================================
    function getBookings() {
        try {
            return JSON.parse(localStorage.getItem('myBookings') || '[]');
        } catch (err) {
            console.error('خطأ في قراءة الحجوزات:', err);
            return [];
        }
    }

    function saveBookings(bookings) {
        try {
            localStorage.setItem('myBookings', JSON.stringify(bookings));
        } catch (err) {
            console.error('خطأ في حفظ الحجوزات:', err);
        }
    }

    function sortBookings(bookings) {
        return bookings.sort(function (a, b) {
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });
    }


    // ============================================
    // 5. تنسيقات
    // ============================================
    function formatDate(dateString) {
        if (!dateString) return '—';
        if (dateString.indexOf('/') !== -1) return dateString;

        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return day + ' / ' + month + ' / ' + year;
    }

    function getBookingStatus(booking) {
        return booking.status || 'pending';
    }

    function getStatusLabel(status) {
        const labels = {
            'pending': 'قيد الانتظار',
            'confirmed': 'نشط',
            'active': 'نشط',
            'completed': 'مكتمل',
            'cancelled': 'ملغى'
        };
        return labels[status] || 'قيد الانتظار';
    }

    function getStatusClass(status) {
        const classes = {
            'pending': 'status-pending',
            'confirmed': 'status-active',
            'active': 'status-active',
            'completed': 'status-completed',
            'cancelled': 'status-cancelled'
        };
        return classes[status] || 'status-pending';
    }

    function isActiveStatus(status) {
        return status === 'pending' || status === 'confirmed' || status === 'active';
    }


    // ============================================
    // 6. بناء كارت الحجز
    // ============================================
    function buildBookingCard(booking) {
        const IMG_BASE = (window.location.pathname.indexOf('/pages/') !== -1) ? '../' : '';

        const status = getBookingStatus(booking);
        const statusLabel = getStatusLabel(status);
        const statusClass = getStatusClass(status);

        let dataStatus = 'active';
        if (status === 'completed') dataStatus = 'completed';
        else if (status === 'cancelled') dataStatus = 'cancelled';

        const card = document.createElement('article');
        card.className = 'booking-card' + (status === 'cancelled' ? ' cancelled' : '');
        card.setAttribute('data-status', dataStatus);
        card.setAttribute('data-booking-id', booking.bookingId || '');

        const imageDiv = document.createElement('div');
        imageDiv.className = 'booking-card-image';

        const img = document.createElement('img');
        img.src = IMG_BASE + (booking.carImage || 'images/kia-picanto-2023.jpg');
        img.alt = booking.carName || 'Car';
        img.onerror = function () {
            this.src = IMG_BASE + 'images/kia-picanto-2023.jpg';
        };
        imageDiv.appendChild(img);

        const bodyDiv = document.createElement('div');
        bodyDiv.className = 'booking-card-body';

        const headerDiv = document.createElement('div');
        headerDiv.className = 'booking-card-header';

        const nameH3 = document.createElement('h3');
        nameH3.className = 'booking-card-name';
        nameH3.textContent = booking.carName || 'سيارة';

        const statusBadge = document.createElement('span');
        statusBadge.className = 'booking-status ' + statusClass;
        statusBadge.textContent = statusLabel;

        headerDiv.appendChild(nameH3);
        headerDiv.appendChild(statusBadge);

        const companyP = document.createElement('p');
        companyP.className = 'booking-card-company';
        companyP.textContent = booking.carCompany || '';

        const datesDiv = document.createElement('div');
        datesDiv.className = 'booking-card-dates';

        const pickupDateDiv = document.createElement('div');
        pickupDateDiv.className = 'booking-date';

        const pickupLabel = document.createElement('span');
        pickupLabel.className = 'date-label';
        pickupLabel.textContent = 'الاستلام';

        const pickupValue = document.createElement('strong');
        pickupValue.className = 'date-value';
        pickupValue.textContent = booking.pickupFormatted || formatDate(booking.pickup);

        pickupDateDiv.appendChild(pickupLabel);
        pickupDateDiv.appendChild(pickupValue);

        const returnDateDiv = document.createElement('div');
        returnDateDiv.className = 'booking-date';

        const returnLabel = document.createElement('span');
        returnLabel.className = 'date-label';
        returnLabel.textContent = 'الإرجاع';

        const returnValue = document.createElement('strong');
        returnValue.className = 'date-value';
        returnValue.textContent = booking.returnFormatted || formatDate(booking.returnDate);

        returnDateDiv.appendChild(returnLabel);
        returnDateDiv.appendChild(returnValue);

        datesDiv.appendChild(pickupDateDiv);
        datesDiv.appendChild(returnDateDiv);

        bodyDiv.appendChild(headerDiv);
        bodyDiv.appendChild(companyP);
        bodyDiv.appendChild(datesDiv);

        const footerDiv = document.createElement('div');
        footerDiv.className = 'booking-card-footer';

        const priceDiv = document.createElement('div');
        priceDiv.className = 'booking-card-price';
        priceDiv.textContent = (booking.total || 0) + ' د.أ';

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'booking-card-actions';

        const detailsBtn = document.createElement('button');
        detailsBtn.type = 'button';
        detailsBtn.className = 'btn-outline btn-details';
        detailsBtn.textContent = 'تفاصيل';
        detailsBtn.addEventListener('click', function () {
            openBookingDetails(booking);
        });

        actionsDiv.appendChild(detailsBtn);

        if (status === 'cancelled') {
            const rebookBtn = document.createElement('a');
            rebookBtn.className = 'btn-outline btn-accent';
            rebookBtn.textContent = 'احجز مرة أخرى';
            rebookBtn.href = 'booking.html?id=' + (booking.carId || '1');
            actionsDiv.appendChild(rebookBtn);
        } else if (status !== 'completed') {
            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.className = 'btn-outline btn-danger';
            cancelBtn.textContent = 'إلغاء';
            cancelBtn.addEventListener('click', function () {
                cancelBooking(booking.bookingId, booking.carName);
            });
            actionsDiv.appendChild(cancelBtn);
        }

        footerDiv.appendChild(priceDiv);
        footerDiv.appendChild(actionsDiv);

        card.appendChild(imageDiv);
        card.appendChild(bodyDiv);
        card.appendChild(footerDiv);

        return card;
    }


    // ============================================
    // 7. عرض كل الحجوزات
    // ============================================
    function renderBookings() {
        const listContainer = document.querySelector('.bookings-list');
        const browseMoreWrap = document.getElementById('browseMoreWrap');
        if (!listContainer) return;

        const bookings = sortBookings(getBookings());

        listContainer.innerHTML = '';

        if (bookings.length === 0) {
            if (browseMoreWrap) browseMoreWrap.style.display = 'none';

            const emptyDiv = document.createElement('div');
            emptyDiv.style.cssText = `
                text-align: center;
                padding: 60px 20px;
                background: var(--color-white);
                border: 1px solid var(--color-border);
                border-radius: 16px;
            `;
            emptyDiv.innerHTML = `
                <div style="font-size: 64px; opacity: 0.3; margin-bottom: 16px;">🚗</div>
                <h3 style="font-size: 20px; font-weight: 800; color: var(--color-text-dark); margin-bottom: 8px;">
                    ما عندك حجوزات
                </h3>
                <p style="font-size: 15px; color: var(--color-text-gray); margin-bottom: 20px;">
                    ابدأ بتصفح السيارات واحجز سيارتك الأولى
                </p>
                <a href="search.html" style="
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    height: 48px;
                    padding: 0 32px;
                    background: var(--color-accent);
                    color: white;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 700;
                    font-family: Cairo, sans-serif;
                ">تصفّح السيارات</a>
            `;
            listContainer.appendChild(emptyDiv);
            updateTabCounts(bookings);
            return;
        }

        if (browseMoreWrap) browseMoreWrap.style.display = 'block';

        bookings.forEach(function (booking) {
            listContainer.appendChild(buildBookingCard(booking));
        });

        updateTabCounts(bookings);
        applyActiveTab();

        console.log('✅ تم عرض', bookings.length, 'حجز');
    }


    // ============================================
    // 8. تحديث Tab counts
    // ============================================
    function updateTabCounts(bookings) {
        if (!bookings) bookings = getBookings();

        const counts = {
            all: bookings.length,
            active: 0,
            completed: 0,
            cancelled: 0
        };

        bookings.forEach(function (b) {
            const status = getBookingStatus(b);
            if (status === 'completed') counts.completed++;
            else if (status === 'cancelled') counts.cancelled++;
            else if (isActiveStatus(status)) counts.active++;
        });

        document.querySelectorAll('.bookings-tab').forEach(function (tab) {
            const filter = tab.getAttribute('data-filter');
            let countSpan = tab.querySelector('.tab-count');
            if (!countSpan) {
                countSpan = document.createElement('span');
                countSpan.className = 'tab-count';
                tab.appendChild(countSpan);
            }
            countSpan.textContent = counts[filter] !== undefined ? counts[filter] : 0;
        });
    }


    // ============================================
    // 9. فلترة حسب التاب
    // ============================================
    let activeTab = 'all';

    function applyActiveTab() {
        const cards = document.querySelectorAll('.booking-card');

        cards.forEach(function (card) {
            const status = card.getAttribute('data-status');
            if (activeTab === 'all' || status === activeTab) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }


    // ============================================
    // 10. ربط التابات
    // ============================================
    const tabs = document.querySelectorAll('.bookings-tab');

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            activeTab = this.getAttribute('data-filter');

            tabs.forEach(function (t) { t.classList.remove('active'); });
            this.classList.add('active');

            applyActiveTab();
        });
    });


    // ============================================
    // 11. Modal تفاصيل الحجز
    // ============================================
    function openBookingDetails(booking) {
        if (window.YallaBookingDetails && typeof window.YallaBookingDetails.open === 'function') {
            window.YallaBookingDetails.open(booking, { mode: 'customer' });
        } else {
            showToast('عرض التفاصيل — قريباً', 'success');
        }
    }


    // ============================================
    // 12. إلغاء حجز
    // ============================================
    function cancelBooking(bookingId, carName) {
        openConfirmModal(
            'هل أنت متأكد من إلغاء حجز "' + carName + '"؟',
            function () {
                const bookings = getBookings();
                const updated = bookings.map(function (b) {
                    if (b.bookingId === bookingId) {
                        return Object.assign({}, b, {
                            status: 'cancelled',
                            cancelledAt: new Date().toISOString()
                        });
                    }
                    return b;
                });

                saveBookings(updated);
                showToast('✅ تم إلغاء الحجز بنجاح', 'success');

                renderBookings();

                console.log('❌ تم إلغاء الحجز:', bookingId);
            }
        );
    }


    // ============================================
    // 13. تشغيل أولي
    // ============================================
    document.addEventListener('DOMContentLoaded', function () {
        renderBookings();
    });

    if (document.readyState !== 'loading') {
        renderBookings();
    }


    // ============================================
    // 14. تسجيل الخروج
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