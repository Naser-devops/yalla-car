// ============================================
// Yalla Car — JavaScript صفحة إدارة السيارات
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
        let toast = document.getElementById('manageCarsToast');

        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'manageCarsToast';
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
    // 3. بحث فوري
    // ============================================
    const searchInput = document.getElementById('searchInput');
    const tableRows = document.querySelectorAll('#carsTable tbody tr');

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const query = this.value.trim().toLowerCase();

            tableRows.forEach(function (row) {
                const carName = (row.getAttribute('data-car-name') || '').toLowerCase();
                row.style.display = carName.includes(query) ? '' : 'none';
            });
        });
    }


    // ============================================
    // 4. زر "تعديل"
    // ============================================
    const allTableButtons = document.querySelectorAll('.cell-actions .btn-outline');

    allTableButtons.forEach(function (btn) {
        if (btn.classList.contains('btn-danger') || btn.classList.contains('btn-delete')) return;

        btn.addEventListener('click', function () {
            const row = this.closest('tr');
            if (!row) return;

            const carName = row.getAttribute('data-car-name') || 'سيارة';
            const image = row.querySelector('.cell-image img');
            const bookings = row.querySelector('.cell-bookings');
            const price = row.querySelector('.cell-price');
            const status = row.querySelector('.status-badge');

            let priceNumber = '0';
            if (price) {
                const match = price.textContent.match(/(\d+)/);
                if (match) priceNumber = match[1];
            }

            const carData = {
                name: carName,
                image: image ? image.src : '',
                bookings: bookings ? bookings.textContent.trim() : '0',
                price: priceNumber,
                status: status ? status.textContent.trim() : 'متاحة'
            };

            sessionStorage.setItem('editCar', JSON.stringify(carData));
            console.log('✏️ تعديل السيارة:', carData);

            window.location.href = 'add-car.html?mode=edit';
        });
    });


    // ============================================
    // 5. Modal حذف مخصص
    // ============================================
    function openDeleteModal(carName, onConfirm) {
        let modal = document.getElementById('deleteModal');

        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'deleteModal';
            modal.style.cssText = `
                position: fixed;
                inset: 0;
                background: rgba(15, 23, 42, 0.65);
                backdrop-filter: blur(6px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.25s;
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
                    transform: scale(0.92);
                    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                " id="deleteModalBox">
                    <div style="font-size: 56px; line-height: 1; margin-bottom: 16px;">🗑️</div>
                    <h3 style="
                        font-size: 20px;
                        font-weight: 800;
                        color: #0F172A;
                        margin: 0 0 10px 0;
                    ">تأكيد الحذف</h3>
                    <p style="
                        font-size: 15px;
                        color: #64748B;
                        margin: 0 0 24px 0;
                        line-height: 1.7;
                    " id="deleteModalText">هل أنت متأكد؟</p>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <button type="button" id="deleteModalCancel" style="
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
                        <button type="button" id="deleteModalConfirm" style="
                            height: 48px;
                            border-radius: 12px;
                            background: linear-gradient(135deg, #DC2626, #EF4444);
                            color: white;
                            border: none;
                            font-family: Cairo, sans-serif;
                            font-size: 15px;
                            font-weight: 700;
                            cursor: pointer;
                        ">نعم، احذف</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            document.getElementById('deleteModalCancel').addEventListener('click', closeDeleteModal);
            document.getElementById('deleteModalConfirm').addEventListener('click', function () {
                const confirmAction = modal._onConfirm;
                closeDeleteModal();
                if (typeof confirmAction === 'function') confirmAction();
            });

            modal.addEventListener('click', function (e) {
                if (e.target === modal) closeDeleteModal();
            });

            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && modal.style.opacity === '1') {
                    closeDeleteModal();
                }
            });
        }

        const textEl = document.getElementById('deleteModalText');
        const boxEl = document.getElementById('deleteModalBox');

        if (textEl) {
            textEl.textContent = 'هل أنت متأكد من حذف "' + carName + '"؟ لا يمكن التراجع.';
        }

        modal._onConfirm = onConfirm;

        modal.style.opacity = '1';
        modal.style.pointerEvents = 'all';
        if (boxEl) boxEl.style.transform = 'scale(1)';
    }

    function closeDeleteModal() {
        const modal = document.getElementById('deleteModal');
        const box = document.getElementById('deleteModalBox');

        if (modal) {
            modal.style.opacity = '0';
            modal.style.pointerEvents = 'none';
        }
        if (box) box.style.transform = 'scale(0.92)';
    }


    // ============================================
    // 6. زر "حذف"
    // ============================================
    const deleteButtons = document.querySelectorAll('.btn-delete, .btn-outline.btn-danger');

    deleteButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const row = this.closest('tr');
            if (!row) return;

            const carName = row.getAttribute('data-car-name') || 'السيارة';

            openDeleteModal(carName, function () {
                row.style.opacity = '0';
                row.style.transition = 'opacity 0.3s';

                setTimeout(function () {
                    row.remove();
                    showToast('✅ تم حذف: ' + carName, 'success');
                    console.log('✅ تم حذف:', carName);
                }, 300);
            });
        });
    });


    // ============================================
    // 7. تسجيل الخروج
    // ============================================
    document.querySelectorAll('[data-logout]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    });

})();