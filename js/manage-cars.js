// ============================================
// Yalla Car — JavaScript صفحة إدارة السيارات
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
    let toast = document.getElementById('manageCarsToast');

    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'manageCarsToast';
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
// 3. بحث فوري في الجدول
// ============================================
const searchInput = document.getElementById('searchInput');
const tableRows = document.querySelectorAll('#carsTable tbody tr');

if (searchInput) {
    searchInput.addEventListener('input', function () {
        const query = this.value.trim().toLowerCase();

        tableRows.forEach(function (row) {
            const carName = (row.getAttribute('data-car-name') || '').toLowerCase();

            if (carName.includes(query)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}


// ============================================
// 4. ✅ زر "تعديل" — يودّي لصفحة التعديل
// ============================================
const editButtons = document.querySelectorAll('.btn-outline:not(.btn-danger):not(.btn-delete)');

// بديل أنظف: نحدد الأزرار اللي ما عندها .btn-danger
const allTableButtons = document.querySelectorAll('.cell-actions .btn-outline');

allTableButtons.forEach(function (btn) {
    // تجاهل زر الحذف
    if (btn.classList.contains('btn-danger') || btn.classList.contains('btn-delete')) {
        return;
    }

    btn.addEventListener('click', function () {
        const row = this.closest('tr');
        if (!row) return;

        const carName = row.getAttribute('data-car-name') || 'سيارة';
        const image = row.querySelector('.cell-image img');
        const bookings = row.querySelector('.cell-bookings');
        const price = row.querySelector('.cell-price');
        const status = row.querySelector('.status-badge');

        // استخراج الرقم من السعر (مثلاً "22 د.أ" → 22)
        let priceNumber = '0';
        if (price) {
            const match = price.textContent.match(/(\d+)/);
            if (match) priceNumber = match[1];
        }

        // بيانات السيارة للتعديل
        const carData = {
            name: carName,
            image: image ? image.src : '',
            bookings: bookings ? bookings.textContent.trim() : '0',
            price: priceNumber,
            status: status ? status.textContent.trim() : 'متاحة'
        };

        // حفظ مؤقت للتعديل
        sessionStorage.setItem('editCar', JSON.stringify(carData));

        console.log('✏️ تعديل السيارة:', carData);

        // توجيه لصفحة الإضافة (مع وضع التعديل)
        window.location.href = 'add-car.html?mode=edit';
    });
});


// ============================================
// 5. ✅ زر "حذف" على كل سيارة (مع Modal)
// ============================================
const deleteButtons = document.querySelectorAll('.btn-delete, .btn-outline.btn-danger');

deleteButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
        const row = this.closest('tr');
        if (!row) return;

        const carName = row.getAttribute('data-car-name') || 'السيارة';
        const currentBtn = this;

        // فتح Modal تأكيد
        openDeleteModal(carName, function () {
            // تنفيذ الحذف
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
// 6. Modal تأكيد الحذف
// ============================================
function openDeleteModal(carName, onConfirm) {
    // إنشاء Modal
    let modal = document.getElementById('deleteModal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'deleteModal';
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
            " id="deleteModalBox">
                <div style="font-size: 48px; line-height: 1; margin-bottom: 16px;">🗑️</div>
                <h3 style="
                    font-size: 20px;
                    font-weight: 700;
                    color: #0F172A;
                    margin-bottom: 8px;
                ">تأكيد الحذف</h3>
                <p style="
                    font-size: 15px;
                    color: #64748B;
                    margin-bottom: 24px;
                    line-height: 1.6;
                " id="deleteModalText">هل أنت متأكد؟</p>
                <div style="display: flex; gap: 12px;">
                    <button type="button" id="deleteModalCancel" style="
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
                    <button type="button" id="deleteModalConfirm" style="
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
                    ">نعم، احذف</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // ربط الأزرار مرة واحدة
        document.getElementById('deleteModalCancel').addEventListener('click', closeDeleteModal);
        document.getElementById('deleteModalConfirm').addEventListener('click', function () {
            const confirmAction = modal._onConfirm;
            closeDeleteModal();
            if (typeof confirmAction === 'function') {
                confirmAction();
            }
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

    // تحديث النص + الربط
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
    if (box) box.style.transform = 'scale(0.9)';
}


// ============================================
// 7. تسجيل الخروج (موحّد)
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