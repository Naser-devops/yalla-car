// ============================================
// Yalla Car — JavaScript لوحة الأدمن
// ============================================

(function () {
    'use strict';

    // ============================================
    // 0. 🔒 فحص الصلاحيات (Admin فقط)
    // ============================================
    (function checkAdminAuth() {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            if (!user.loggedIn) {
                sessionStorage.setItem('redirectAfterLogin', window.location.href);
                window.location.href = 'login.html';
                return;
            }

            if (user.role !== 'admin') {
                alert('هذه الصفحة مخصصة للمديرين فقط');
                window.location.href = '../index.html';
                return;
            }

            console.log('✅ مرحباً أيها المدير:', user.email);
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
    let activeFilter = 'all';


    // ============================================
    // 3. Toast Notification (تحت)
    // ============================================
    let toastTimeout = null;

    function showToast(message, type) {
        if (!toast || !toastMsg) {
            let fallbackToast = document.getElementById('adminToastDynamic');

            if (!fallbackToast) {
                fallbackToast = document.createElement('div');
                fallbackToast.id = 'adminToastDynamic';
                fallbackToast.style.cssText = `
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
                document.body.appendChild(fallbackToast);
            }

            if (type === 'error') {
                fallbackToast.style.background = 'linear-gradient(135deg, #B91C1C, #EF4444)';
            } else {
                fallbackToast.style.background = 'linear-gradient(135deg, #047857, #10B981)';
            }

            fallbackToast.textContent = message;
            fallbackToast.style.opacity = '1';
            fallbackToast.style.transform = 'translateY(0)';

            setTimeout(function () {
                fallbackToast.style.opacity = '0';
                fallbackToast.style.transform = 'translateY(100px)';
            }, 3200);
            return;
        }

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
        if (typeof window.loadLanguage === 'function') {
            const currentLang = localStorage.getItem('lang') || 'ar';
            window.loadLanguage(currentLang);
        }
    }


    // ============================================
    // 5. تحديث عدّادات التابات
    // ============================================
    function updateTabCounts() {
        const counts = { all: 0, pending: 0, approved: 0, rejected: 0 };

        rows.forEach(function (row) {
            const status = row.getAttribute('data-status');
            counts.all++;
            if (counts[status] !== undefined) counts[status]++;
        });

        const kpiMap = {
            'admin.kpi.total': counts.all,
            'admin.kpi.pending': counts.pending,
            'admin.kpi.approved': counts.approved,
            'admin.kpi.rejected': counts.rejected
        };

        document.querySelectorAll('.admin-kpi-card').forEach(function (card) {
            const labelEl = card.querySelector('.kpi-label');
            const numberEl = card.querySelector('.kpi-number');
            if (!labelEl || !numberEl) return;

            const i18nKey = labelEl.getAttribute('data-i18n');
            if (i18nKey && kpiMap[i18nKey] !== undefined) {
                numberEl.textContent = kpiMap[i18nKey];
            }
        });

        const tabMap = { all: counts.all, pending: counts.pending, approved: counts.approved, rejected: counts.rejected };

        tabs.forEach(function (tab) {
            const filter = tab.getAttribute('data-filter');
            const countEl = tab.querySelector('.tab-count');
            if (countEl && tabMap[filter] !== undefined) {
                countEl.textContent = tabMap[filter];
            }
        });

        console.log('📊 تم تحديث العدّادات:', counts);
    }


    // ============================================
    // 6. بيانات الشركات
    // ============================================
    const companiesData = {
        safwa: {
            name: 'Al-Safwa Rentals', cr: 'CR-2026-45821',
            gradient: 'linear-gradient(135deg, #F97316, #EA580C)',
            email: 'safwa@rentals.jo', phone: '+962 79 555 1234', address: 'Amman, Jordan',
            cars: 6, years: 3, founded: 2023,
            documents: [
                { icon: '📄', nameKey: 'admin.doc.cr',      file: 'CR-2026-45821.pdf', ok: true },
                { icon: '📄', nameKey: 'admin.doc.tax',     file: 'tax-cert.pdf',      ok: true },
                { icon: '📄', nameKey: 'admin.doc.license', file: 'لم تُرفع بعد',       ok: false }
            ]
        },
        petra: {
            name: 'Petra Wheels', cr: 'CR-2026-51102',
            gradient: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
            email: 'info@petrawheels.jo', phone: '+962 78 444 5566', address: 'Aqaba, Jordan',
            cars: 12, years: 5, founded: 2021,
            documents: [
                { icon: '📄', nameKey: 'admin.doc.cr',      file: 'CR-2026-51102.pdf', ok: true },
                { icon: '📄', nameKey: 'admin.doc.tax',     file: 'tax-cert.pdf',      ok: true },
                { icon: '📄', nameKey: 'admin.doc.license', file: 'license.pdf',       ok: true }
            ]
        },
        ram: {
            name: 'Ram Rentals', cr: 'CR-2025-33018',
            gradient: 'linear-gradient(135deg, #1E3A8A, #3B5BA9)',
            email: 'ram@rentals.jo', phone: '+962 79 111 2233', address: 'Amman, Jordan',
            cars: 15, years: 8, founded: 2018,
            documents: [
                { icon: '📄', nameKey: 'admin.doc.cr',      file: 'CR-2025-33018.pdf', ok: true },
                { icon: '📄', nameKey: 'admin.doc.tax',     file: 'tax-cert.pdf',      ok: true },
                { icon: '📄', nameKey: 'admin.doc.license', file: 'license.pdf',       ok: true }
            ]
        },
        amman: {
            name: 'Amman Rent', cr: 'CR-2025-28471',
            gradient: 'linear-gradient(135deg, #059669, #10B981)',
            email: 'contact@ammanrent.jo', phone: '+962 77 333 4455', address: 'Amman, Jordan',
            cars: 10, years: 6, founded: 2020,
            documents: [
                { icon: '📄', nameKey: 'admin.doc.cr',      file: 'CR-2025-28471.pdf', ok: true },
                { icon: '📄', nameKey: 'admin.doc.tax',     file: 'tax-cert.pdf',      ok: true },
                { icon: '📄', nameKey: 'admin.doc.license', file: 'license.pdf',       ok: true }
            ]
        },
        quick: {
            name: 'Quick Cars', cr: 'CR-2026-40012',
            gradient: 'linear-gradient(135deg, #6B7280, #4B5563)',
            email: 'quick@cars.jo', phone: '+962 78 999 8877', address: 'Zarqa, Jordan',
            cars: 3, years: 1, founded: 2025,
            documents: [
                { icon: '📄', nameKey: 'admin.doc.cr',      file: 'CR-2026-40012.pdf', ok: true },
                { icon: '📄', nameKey: 'admin.doc.tax',     file: 'لم تُرفع بعد',       ok: false },
                { icon: '📄', nameKey: 'admin.doc.license', file: 'لم تُرفع بعد',       ok: false }
            ]
        }
    };


    // ============================================
    // 7. بناء الوثائق
    // ============================================
    function renderDocuments(documents) {
        const container = document.getElementById('drawerDocs');
        if (!container) return;

        container.innerHTML = '';

        const fallbackMap = {
            'admin.doc.cr': 'السجل التجاري',
            'admin.doc.tax': 'شهادة ضريبة',
            'admin.doc.license': 'رخصة البلدية'
        };

        documents.forEach(function (doc) {
            const item = document.createElement('div');
            item.className = 'doc-item' + (doc.ok ? '' : ' doc-missing');

            const iconSpan = document.createElement('span');
            iconSpan.className = 'doc-icon';
            iconSpan.textContent = doc.icon;

            const infoDiv = document.createElement('div');
            infoDiv.className = 'doc-info';

            const strong = document.createElement('strong');
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
    // 8. حساب الاكتمال
    // ============================================
    function calculateCompleteness(documents) {
        if (!documents || documents.length === 0) return 0;
        const complete = documents.filter(function (d) { return d.ok; }).length;
        return Math.round((complete / documents.length) * 100);
    }


    // ============================================
    // 9. فتح Drawer
    // ============================================
    function openDrawer(row, data) {
        currentRow = row;

        document.getElementById('drawerName').textContent = data.name;
        document.getElementById('drawerCR').textContent = data.cr;

        const logoEl = document.getElementById('drawerLogo');
        logoEl.textContent = data.name.charAt(0);
        logoEl.style.background = data.gradient;

        document.getElementById('drawerEmail').textContent = data.email || '—';
        document.getElementById('drawerPhone').textContent = data.phone || '—';
        document.getElementById('drawerAddress').textContent = data.address || '—';

        document.getElementById('drawerCars').textContent = data.cars || '0';
        document.getElementById('drawerYears').textContent = data.years || '0';
        document.getElementById('drawerFounded').textContent = data.founded || '—';

        renderDocuments(data.documents || []);

        const percent = calculateCompleteness(data.documents);
        document.getElementById('progressValue').textContent = percent + '%';
        document.getElementById('progressFill').style.width = percent + '%';

        drawer.classList.add('active');
        drawerOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }


    // ============================================
    // 10. إغلاق Drawer
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
    // 11. أزرار المراجعة
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
            drawerFooter.style.display = status === 'pending' ? 'flex' : 'none';
        });
    });


    // ============================================
    // 12. تحديث شارة الحالة
    // ============================================
    function updateStatusBadge(row, newStatus) {
        const statusBadge = row.querySelector('.admin-status');
        if (!statusBadge) return;

        statusBadge.className = 'admin-status status-' + newStatus;
        statusBadge.innerHTML = '';

        const dot = document.createElement('span');
        dot.className = 'status-dot';

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
    // 13. زر الموافقة
    // ============================================
    const btnApprove = document.getElementById('btnApprove');
    if (btnApprove) {
        btnApprove.addEventListener('click', function () {
            if (!currentRow) return;

            const companyName = currentRow.querySelector('.company-details strong').textContent;

            currentRow.setAttribute('data-status', 'approved');
            updateStatusBadge(currentRow, 'approved');

            const newBadge = currentRow.querySelector('.new-badge');
            if (newBadge) newBadge.remove();

            const reviewBtn = currentRow.querySelector('.btn-review');
            if (reviewBtn) reviewBtn.classList.add('btn-review-secondary');

            drawerFooter.style.display = 'none';

            showToast('✅ تمت الموافقة على: ' + companyName, 'success');
            closeDrawer();

            updateTabCounts();
            applyActiveFilter();

            console.log('✅ Approved:', companyName);
        });
    }


    // ============================================
    // 14. زر الرفض
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
            if (reviewBtn) reviewBtn.classList.add('btn-review-secondary');

            drawerFooter.style.display = 'none';

            showToast('تم رفض الطلب: ' + companyName, 'error');
            closeDrawer();

            updateTabCounts();
            applyActiveFilter();

            console.log('❌ Rejected:', companyName);
        });
    }


    // ============================================
    // 15. الفلتر + البحث
    // ============================================
    function applyActiveFilter() {
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

        rows.forEach(function (row) {
            const status = row.getAttribute('data-status');
            const name = (row.getAttribute('data-name') || '').toLowerCase();

            const matchesFilter = (activeFilter === 'all' || status === activeFilter);
            const matchesSearch = (!query || name.includes(query));

            if (matchesFilter && matchesSearch) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            activeFilter = this.getAttribute('data-filter');

            tabs.forEach(function (t) { t.classList.remove('active'); });
            this.classList.add('active');

            applyActiveFilter();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            applyActiveFilter();
        });
    }

    updateTabCounts();


    // ============================================
    // 16. تسجيل الخروج (موحّد)
    // ============================================
    document.querySelectorAll('[data-logout]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.removeItem('user');
            console.log('👋 تم تسجيل خروج الأدمن');
            window.location.href = 'login.html';
        });
    });

})();