// ============================================
// Yalla Car — JavaScript لوحة الأدمن
// ============================================


// ============================================
// 0. 🔒 فحص الصلاحيات (Admin فقط — صارم جداً)
// ============================================
(function checkAdminAuth() {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        if (!user.loggedIn) {
            console.warn('🚫 وصول مرفوض: يجب تسجيل الدخول أولاً');
            sessionStorage.setItem('redirectAfterLogin', window.location.href);
            window.location.href = 'login.html';
            return;
        }

        if (user.role !== 'admin') {
            console.warn('🚫 وصول مرفوض: هذه الصفحة للمديرين فقط');
            alert('هذه الصفحة مخصصة للمديرين فقط');
            window.location.href = 'index.html';
            return;
        }

        console.log('✅ مرحباً أيها المدير:', user.email);
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
const drawer = document.getElementById('reviewDrawer');
const drawerOverlay = document.getElementById('drawerOverlay');
const drawerClose = document.getElementById('drawerClose');
const drawerFooter = document.getElementById('drawerFooter');

const tabs = document.querySelectorAll('.admin-tab');
const rows = document.querySelectorAll('#companiesTable tbody tr');
const searchInput = document.getElementById('searchInput');

const toast = document.getElementById('adminToast');
const toastMsg = document.getElementById('toastMsg');

let currentRow = null;
let currentCompanyKey = null;


// ============================================
// 3. Toast Notification
// ============================================
let toastTimeout = null;

function showToast(message, type) {
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.className = 'admin-toast show ' + (type || 'success');

    if (toastTimeout) clearTimeout(toastTimeout);

    toastTimeout = setTimeout(function () {
        toast.classList.remove('show');
    }, 3200);
}


// ============================================
// 4. إعادة تحميل الترجمة
// ============================================
function refreshTranslations() {
    if (typeof loadLanguage === 'function') {
        const currentLang = localStorage.getItem('lang') || 'ar';
        loadLanguage(currentLang);
    }
}


// ============================================
// 5. بيانات الشركات الكاملة (mock — حتى الباك إند)
// ✅ الوثائق تستخدم nameKey (مفتاح ترجمة) بدل name (نص عربي)
// ============================================
const companiesData = {
    safwa: {
        name: 'Al-Safwa Rentals',
        cr: 'CR-2026-45821',
        gradient: 'linear-gradient(135deg, #F97316, #EA580C)',
        email: 'safwa@rentals.jo',
        phone: '+962 79 555 1234',
        address: 'Amman, Jordan',
        cars: 6,
        years: 3,
        founded: 2023,
        documents: [
            { icon: '📄', nameKey: 'admin.doc.cr',      file: 'CR-2026-45821.pdf', ok: true },
            { icon: '📄', nameKey: 'admin.doc.tax',     file: 'tax-cert.pdf',      ok: true },
            { icon: '📄', nameKey: 'admin.doc.license', file: 'لم تُرفع بعد',       ok: false }
        ]
    },
    petra: {
        name: 'Petra Wheels',
        cr: 'CR-2026-51102',
        gradient: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
        email: 'info@petrawheels.jo',
        phone: '+962 78 444 5566',
        address: 'Aqaba, Jordan',
        cars: 12,
        years: 5,
        founded: 2021,
        documents: [
            { icon: '📄', nameKey: 'admin.doc.cr',      file: 'CR-2026-51102.pdf', ok: true },
            { icon: '📄', nameKey: 'admin.doc.tax',     file: 'tax-cert.pdf',      ok: true },
            { icon: '📄', nameKey: 'admin.doc.license', file: 'license.pdf',       ok: true }
        ]
    },
    ram: {
        name: 'Ram Rentals',
        cr: 'CR-2025-33018',
        gradient: 'linear-gradient(135deg, #1E3A8A, #3B5BA9)',
        email: 'ram@rentals.jo',
        phone: '+962 79 111 2233',
        address: 'Amman, Jordan',
        cars: 15,
        years: 8,
        founded: 2018,
        documents: [
            { icon: '📄', nameKey: 'admin.doc.cr',      file: 'CR-2025-33018.pdf', ok: true },
            { icon: '📄', nameKey: 'admin.doc.tax',     file: 'tax-cert.pdf',      ok: true },
            { icon: '📄', nameKey: 'admin.doc.license', file: 'license.pdf',       ok: true }
        ]
    },
    amman: {
        name: 'Amman Rent',
        cr: 'CR-2025-28471',
        gradient: 'linear-gradient(135deg, #059669, #10B981)',
        email: 'contact@ammanrent.jo',
        phone: '+962 77 333 4455',
        address: 'Amman, Jordan',
        cars: 10,
        years: 6,
        founded: 2020,
        documents: [
            { icon: '📄', nameKey: 'admin.doc.cr',      file: 'CR-2025-28471.pdf', ok: true },
            { icon: '📄', nameKey: 'admin.doc.tax',     file: 'tax-cert.pdf',      ok: true },
            { icon: '📄', nameKey: 'admin.doc.license', file: 'license.pdf',       ok: true }
        ]
    },
    quick: {
        name: 'Quick Cars',
        cr: 'CR-2026-40012',
        gradient: 'linear-gradient(135deg, #6B7280, #4B5563)',
        email: 'quick@cars.jo',
        phone: '+962 78 999 8877',
        address: 'Zarqa, Jordan',
        cars: 3,
        years: 1,
        founded: 2025,
        documents: [
            { icon: '📄', nameKey: 'admin.doc.cr',      file: 'CR-2026-40012.pdf', ok: true },
            { icon: '📄', nameKey: 'admin.doc.tax',     file: 'لم تُرفع بعد',       ok: false },
            { icon: '📄', nameKey: 'admin.doc.license', file: 'لم تُرفع بعد',       ok: false }
        ]
    }
};


// ============================================
// 6. ✅ بناء قائمة الوثائق ديناميكياً (مع ترجمة صحيحة)
// ============================================
function renderDocuments(documents) {
    const container = document.getElementById('drawerDocs');
    if (!container) return;

    // مسح القديم
    container.innerHTML = '';

    // خريطة fallback عربي (لو i18n ما اشتغلت)
    const fallbackMap = {
        'admin.doc.cr': 'السجل التجاري',
        'admin.doc.tax': 'شهادة ضريبة',
        'admin.doc.license': 'رخصة البلدية'
    };

    documents.forEach(function (doc) {
        const item = document.createElement('div');
        item.className = 'doc-item' + (doc.ok ? '' : ' doc-missing');

        // الأيقونة
        const iconSpan = document.createElement('span');
        iconSpan.className = 'doc-icon';
        iconSpan.textContent = doc.icon;

        // معلومات الوثيقة
        const infoDiv = document.createElement('div');
        infoDiv.className = 'doc-info';

        const strong = document.createElement('strong');
        // ✅ نضع data-i18n دائماً للمفتاح
        if (doc.nameKey) {
            strong.setAttribute('data-i18n', doc.nameKey);
            strong.textContent = fallbackMap[doc.nameKey] || doc.nameKey;
        } else {
            strong.textContent = doc.name || '—';
        }

        const small = document.createElement('small');
        small.textContent = doc.file;

        infoDiv.appendChild(strong);
        infoDiv.appendChild(small);

        // علامة الحالة
        const checkSpan = document.createElement('span');
        checkSpan.className = doc.ok ? 'doc-check' : 'doc-warn';
        checkSpan.textContent = doc.ok ? '✓' : '!';

        item.appendChild(iconSpan);
        item.appendChild(infoDiv);
        item.appendChild(checkSpan);

        container.appendChild(item);
    });

    refreshTranslations();
}


// ============================================
// 7. حساب نسبة الاكتمال
// ============================================
function calculateCompleteness(documents) {
    if (!documents || documents.length === 0) return 0;
    const complete = documents.filter(function (d) { return d.ok; }).length;
    return Math.round((complete / documents.length) * 100);
}


// ============================================
// 8. فتح الـ Drawer
// ============================================
function openDrawer(row, data) {
    currentRow = row;

    // --- رأس الـ Drawer ---
    document.getElementById('drawerName').textContent = data.name;
    document.getElementById('drawerCR').textContent = data.cr;

    const logoEl = document.getElementById('drawerLogo');
    logoEl.textContent = data.name.charAt(0);
    logoEl.style.background = data.gradient;

    // --- معلومات الاتصال ---
    document.getElementById('drawerEmail').textContent = data.email || '—';
    document.getElementById('drawerPhone').textContent = data.phone || '—';
    document.getElementById('drawerAddress').textContent = data.address || '—';

    // --- معلومات الشركة ---
    document.getElementById('drawerCars').textContent = data.cars || '0';
    document.getElementById('drawerYears').textContent = data.years || '0';
    document.getElementById('drawerFounded').textContent = data.founded || '—';

    // --- الوثائق ---
    renderDocuments(data.documents || []);

    // --- نسبة الاكتمال ---
    const percent = calculateCompleteness(data.documents);
    document.getElementById('progressValue').textContent = percent + '%';
    document.getElementById('progressFill').style.width = percent + '%';

    // --- فتح ---
    drawer.classList.add('active');
    drawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}


// ============================================
// 9. إغلاق الـ Drawer
// ============================================
function closeDrawer() {
    drawer.classList.remove('active');
    drawerOverlay.classList.remove('active');
    document.body.style.overflow = '';
    currentRow = null;
    currentCompanyKey = null;
}

if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer.classList.contains('active')) {
        closeDrawer();
    }
});


// ============================================
// 10. أزرار "مراجعة" / "عرض"
// ============================================
document.querySelectorAll('.btn-review').forEach(function (btn) {
    btn.addEventListener('click', function () {
        const key = this.getAttribute('data-review');
        const data = companiesData[key];
        const row = this.closest('tr');

        if (!data || !row) return;

        currentCompanyKey = key;
        openDrawer(row, data);

        const status = row.getAttribute('data-status');

        // إظهار أزرار الموافقة/الرفض فقط لو الحالة "قيد المراجعة"
        if (status === 'pending') {
            drawerFooter.style.display = 'flex';
        } else {
            drawerFooter.style.display = 'none';
        }
    });
});


// ============================================
// 11. ✅ تحديث شارة الحالة بأمان
// ============================================
function updateStatusBadge(row, newStatus) {
    const statusBadge = row.querySelector('.admin-status');
    if (!statusBadge) return;

    // مسح الكلاسات القديمة
    statusBadge.className = 'admin-status status-' + newStatus;

    // مسح المحتوى
    statusBadge.innerHTML = '';

    // نقطة الحالة
    const dot = document.createElement('span');
    dot.className = 'status-dot';

    // النص مع data-i18n
    const textSpan = document.createElement('span');
    if (newStatus === 'approved') {
        textSpan.setAttribute('data-i18n', 'admin.status.approved');
        textSpan.textContent = 'مقبولة';
    } else if (newStatus === 'rejected') {
        textSpan.setAttribute('data-i18n', 'admin.status.rejected');
        textSpan.textContent = 'مرفوضة';
    } else if (newStatus === 'pending') {
        textSpan.setAttribute('data-i18n', 'admin.status.pending');
        textSpan.textContent = 'قيد المراجعة';
    }

    statusBadge.appendChild(dot);
    statusBadge.appendChild(textSpan);

    refreshTranslations();
}


// ============================================
// 12. زر الموافقة
// ============================================
const btnApprove = document.getElementById('btnApprove');
if (btnApprove) {
    btnApprove.addEventListener('click', function () {
        if (!currentRow) return;

        const companyName = currentRow.querySelector('.company-details strong').textContent;

        currentRow.setAttribute('data-status', 'approved');
        updateStatusBadge(currentRow, 'approved');

        // إزالة شارة "جديد"
        const newBadge = currentRow.querySelector('.new-badge');
        if (newBadge) newBadge.remove();

        // تحديث زر المراجعة
        const reviewBtn = currentRow.querySelector('.btn-review');
        if (reviewBtn) {
            reviewBtn.classList.add('btn-review-secondary');
        }

        drawerFooter.style.display = 'none';

        showToast('✅ تمت الموافقة على: ' + companyName, 'success');
        closeDrawer();

        console.log('✅ Approved:', companyName);
    });
}


// ============================================
// 13. زر الرفض
// ============================================
const btnReject = document.getElementById('btnReject');
if (btnReject) {
    btnReject.addEventListener('click', function () {
        if (!currentRow) return;

        const companyName = currentRow.querySelector('.company-details strong').textContent;

        currentRow.setAttribute('data-status', 'rejected');
        updateStatusBadge(currentRow, 'rejected');

        const newBadge = currentRow.querySelector('.new-badge');
        if (newBadge) newBadge.remove();

        const reviewBtn = currentRow.querySelector('.btn-review');
        if (reviewBtn) {
            reviewBtn.classList.add('btn-review-secondary');
        }

        drawerFooter.style.display = 'none';

        showToast('تم رفض الطلب: ' + companyName, 'error');
        closeDrawer();

        console.log('❌ Rejected:', companyName);
    });
}


// ============================================
// 14. التابات
// ============================================
tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
        const filter = this.getAttribute('data-filter');

        tabs.forEach(function (t) { t.classList.remove('active'); });
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
// 15. البحث
// ============================================
if (searchInput) {
    searchInput.addEventListener('input', function () {
        const q = this.value.trim().toLowerCase();

        rows.forEach(function (row) {
            const name = (row.getAttribute('data-name') || '').toLowerCase();
            if (name.includes(q)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}


// ============================================
// 16. تسجيل الخروج (موحّد)
// ============================================
function logoutUser() {
    localStorage.removeItem('user');
    console.log('👋 تم تسجيل خروج الأدمن');
    window.location.href = 'login.html';
}

document.querySelectorAll('[data-logout]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        logoutUser();
    });
});