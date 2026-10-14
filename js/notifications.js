// ============================================
// Yalla Car — JavaScript الإشعارات (Bell + Dropdown + Page)
// ============================================

(function () {
    'use strict';

    // ============================================
    // 0. Auth Guard (فقط للصفحة الكاملة)
    // ============================================
    (function checkAuth() {
        if (!document.querySelector('.notifications-page')) return;

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            if (!user.loggedIn) {
                sessionStorage.setItem('redirectAfterLogin', window.location.href);
                window.location.href = 'login.html';
            }
        } catch (err) {
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
    // 2. المتغيرات
    // ============================================
    const NOTIF_KEY = 'yallaNotifications';
    const notifList = document.getElementById('notifList');
    const notifEmpty = document.getElementById('notifEmpty');
    const countAllEl = document.getElementById('countAll');
    const countUnreadEl = document.getElementById('countUnread');
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    const notifTabs = document.querySelectorAll('.notif-tab');

    let activeFilter = 'all';

    const NOTIF_CONFIG = {
        'booking_confirmed':  { icon: '✅', color: 'success' },
        'booking_pending':    { icon: '⏰', color: 'warning' },
        'booking_cancelled':  { icon: '❌', color: 'error' },
        'booking_completed':  { icon: '🏁', color: 'info' },
        'company_approved':   { icon: '🎉', color: 'success' },
        'company_rejected':   { icon: '🚫', color: 'error' },
        'payment_received':   { icon: '💰', color: 'success' },
        'welcome':            { icon: '👋', color: 'info' },
        'default':            { icon: '🔔', color: 'info' }
    };


    // ============================================
    // 3. المسار الأساسي
    // ============================================
    function getBasePath() {
        return (window.location.pathname.indexOf('/pages/') !== -1) ? '' : 'pages/';
    }


    // ============================================
    // 4. قراءة وحفظ
    // ============================================
    function getNotifications() {
        try {
            return JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]');
        } catch (err) {
            console.error('خطأ في قراءة الإشعارات:', err);
            return [];
        }
    }

    function saveNotifications(notifs) {
        try {
            localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
            updateBellBadge();
        } catch (err) {
            console.error('خطأ في حفظ الإشعارات:', err);
        }
    }


    // ============================================
    // 5. تنسيق الوقت
    // ============================================
    function formatTime(isoString) {
        if (!isoString) return '';

        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        const lang = localStorage.getItem('lang') || 'ar';
        const isAr = lang === 'ar';

        if (diffSec < 60) return isAr ? 'الآن' : 'Just now';
        if (diffMin < 60) return isAr ? 'منذ ' + diffMin + ' دقيقة' : diffMin + ' min ago';
        if (diffHour < 24) return isAr ? 'منذ ' + diffHour + ' ساعة' : diffHour + 'h ago';
        if (diffDay < 30) return isAr ? 'منذ ' + diffDay + ' يوم' : diffDay + 'd ago';

        return date.toLocaleDateString(isAr ? 'ar-JO' : 'en-US');
    }


    // ============================================
    // 6. بناء كارت الإشعار (للصفحة)
    // ============================================
    function buildNotifCard(notif) {
        const config = NOTIF_CONFIG[notif.type] || NOTIF_CONFIG['default'];

        const card = document.createElement('article');
        card.className = 'notif-card' + (notif.isRead ? '' : ' unread');
        card.setAttribute('data-id', notif.id || '');

        const iconDiv = document.createElement('div');
        iconDiv.className = 'notif-icon notif-icon-' + config.color;
        iconDiv.textContent = notif.icon || config.icon;

        const bodyDiv = document.createElement('div');
        bodyDiv.className = 'notif-body';

        const titleH4 = document.createElement('h4');
        titleH4.textContent = notif.title || '';

        const msgP = document.createElement('p');
        msgP.textContent = notif.message || '';

        const timeSpan = document.createElement('span');
        timeSpan.className = 'notif-time';
        timeSpan.textContent = '🕐 ' + formatTime(notif.createdAt);

        bodyDiv.appendChild(titleH4);
        bodyDiv.appendChild(msgP);
        bodyDiv.appendChild(timeSpan);

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'notif-delete';
        deleteBtn.setAttribute('aria-label', 'حذف الإشعار');
        deleteBtn.textContent = '✕';
        deleteBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            deleteNotification(notif.id);
        });

        card.appendChild(iconDiv);
        card.appendChild(bodyDiv);
        card.appendChild(deleteBtn);

        card.addEventListener('click', function () {
            markAsRead(notif.id);
            if (notif.link) {
                setTimeout(function () {
                    window.location.href = notif.link;
                }, 200);
            }
        });

        return card;
    }


    // ============================================
    // 7. عرض الإشعارات (الصفحة الكاملة)
    // ============================================
    function renderNotifications() {
        if (!notifList) return;

        const notifs = getNotifications();

        notifs.sort(function (a, b) {
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });

        let filtered = notifs;
        if (activeFilter === 'unread') {
            filtered = notifs.filter(function (n) { return !n.isRead; });
        }

        notifList.innerHTML = '';

        if (filtered.length === 0) {
            notifList.style.display = 'none';
            if (notifEmpty) notifEmpty.style.display = 'block';
        } else {
            notifList.style.display = 'flex';
            if (notifEmpty) notifEmpty.style.display = 'none';

            filtered.forEach(function (notif) {
                notifList.appendChild(buildNotifCard(notif));
            });
        }

        updateCounts(notifs);

        if (typeof loadLanguage === 'function') {
            const currentLang = localStorage.getItem('lang') || 'ar';
            loadLanguage(currentLang);
        }
    }


    // ============================================
    // 8. تحديث العدّادات
    // ============================================
    function updateCounts(notifs) {
        const all = notifs.length;
        const unread = notifs.filter(function (n) { return !n.isRead; }).length;

        if (countAllEl) countAllEl.textContent = all;
        if (countUnreadEl) countUnreadEl.textContent = unread;

        if (markAllReadBtn) {
            markAllReadBtn.disabled = (unread === 0);
        }
    }


    // ============================================
    // 9. تحديد كمقروء
    // ============================================
    function markAsRead(id) {
        if (!id) return;

        const notifs = getNotifications();
        const updated = notifs.map(function (n) {
            if (n.id === id && !n.isRead) {
                return Object.assign({}, n, { isRead: true, readAt: new Date().toISOString() });
            }
            return n;
        });

        saveNotifications(updated);
        renderNotifications();
    }


    // ============================================
    // 10. حذف إشعار
    // ============================================
    function deleteNotification(id) {
        if (!id) return;

        const notifs = getNotifications();
        const filtered = notifs.filter(function (n) { return n.id !== id; });

        saveNotifications(filtered);
        renderNotifications();

        console.log('🗑️ تم حذف الإشعار:', id);
    }


    // ============================================
    // 11. زر تحديد الكل كمقروء
    // ============================================
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', function () {
            const notifs = getNotifications();
            const updated = notifs.map(function (n) {
                return Object.assign({}, n, { isRead: true, readAt: new Date().toISOString() });
            });

            saveNotifications(updated);
            renderNotifications();
        });
    }


    // ============================================
    // 12. تابات الصفحة
    // ============================================
    notifTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            activeFilter = this.getAttribute('data-filter');

            notifTabs.forEach(function (t) { t.classList.remove('active'); });
            this.classList.add('active');

            renderNotifications();
        });
    });


    // ============================================
    // 13. حقن الجرس في الهيدر
    // ============================================
    function injectNotificationBell() {
        if (document.querySelector('.notif-bell-wrap')) return;

        const header = document.querySelector('header');
        if (!header) return;

        if (document.querySelector('.notifications-page')) return;

        let userArea = header.querySelector('.header-user-area');
        if (!userArea) {
            userArea = document.createElement('div');
            userArea.className = 'header-user-area';
            const logo = header.querySelector('.logo');
            if (logo && logo.parentNode) {
                logo.parentNode.insertBefore(userArea, logo.nextSibling);
            } else {
                header.appendChild(userArea);
            }
        }

        const wrap = document.createElement('div');
        wrap.className = 'notif-bell-wrap';

        const bellBtn = document.createElement('button');
        bellBtn.type = 'button';
        bellBtn.className = 'notif-bell';
        bellBtn.setAttribute('aria-label', 'الإشعارات');
        bellBtn.innerHTML = '🔔<span class="notif-badge" style="display:none;">0</span>';

        const dropdown = document.createElement('div');
        dropdown.className = 'notif-dropdown';
        dropdown.innerHTML = `
            <div class="notif-dropdown-header">
                <span class="notif-dropdown-title">🔔 الإشعارات</span>
                <button type="button" class="notif-mark-all-btn" id="bellMarkAll">تحديد الكل</button>
            </div>
            <div class="notif-dropdown-list" id="bellList"></div>
            <div class="notif-dropdown-footer">
                <a href="${getBasePath()}notifications.html">عرض كل الإشعارات →</a>
            </div>
        `;

        wrap.appendChild(bellBtn);
        wrap.appendChild(dropdown);

        userArea.appendChild(wrap);

        bellBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            dropdown.classList.toggle('active');
            bellBtn.classList.toggle('active');
        });

        document.addEventListener('click', function (e) {
            if (!wrap.contains(e.target)) {
                dropdown.classList.remove('active');
                bellBtn.classList.remove('active');
            }
        });

        const bellMarkAll = dropdown.querySelector('#bellMarkAll');
        if (bellMarkAll) {
            bellMarkAll.addEventListener('click', function (e) {
                e.stopPropagation();
                const notifs = getNotifications();
                const updated = notifs.map(function (n) {
                    return Object.assign({}, n, { isRead: true });
                });
                saveNotifications(updated);
                renderBellDropdown();
            });
        }

        renderBellDropdown();
        updateBellBadge();
    }


    // ============================================
    // 14. عرض قائمة البيل
    // ============================================
    function renderBellDropdown() {
        const list = document.getElementById('bellList');
        if (!list) return;

        const notifs = getNotifications().sort(function (a, b) {
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });

        list.innerHTML = '';

        if (notifs.length === 0) {
            list.innerHTML = `
                <div class="notif-dropdown-empty">
                    <div class="notif-empty-icon">🔔</div>
                    <p>ما عندك إشعارات</p>
                </div>
            `;
            return;
        }

        notifs.slice(0, 5).forEach(function (notif) {
            const config = NOTIF_CONFIG[notif.type] || NOTIF_CONFIG['default'];

            const item = document.createElement('div');
            item.className = 'notif-dropdown-item' + (notif.isRead ? '' : ' unread');

            const iconEl = document.createElement('div');
            iconEl.className = 'notif-dropdown-item-icon';
            iconEl.textContent = notif.icon || config.icon;

            const body = document.createElement('div');
            body.className = 'notif-dropdown-item-body';

            const title = document.createElement('strong');
            title.textContent = notif.title || '';

            const msg = document.createElement('span');
            msg.textContent = notif.message || '';

            const time = document.createElement('small');
            time.textContent = formatTime(notif.createdAt);

            body.appendChild(title);
            body.appendChild(msg);
            body.appendChild(time);

            item.appendChild(iconEl);
            item.appendChild(body);

            item.addEventListener('click', function () {
                markAsRead(notif.id);
                if (notif.link) {
                    window.location.href = notif.link;
                }
            });

            list.appendChild(item);
        });
    }


    // ============================================
    // 15. تحديث شارة البيل
    // ============================================
    function updateBellBadge() {
        const badge = document.querySelector('.notif-badge');
        if (!badge) return;

        const unreadCount = getNotifications().filter(function (n) { return !n.isRead; }).length;

        if (unreadCount > 0) {
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }


    // ============================================
    // 16. API عام
    // ============================================
    window.YallaNotifications = {
        add: function (data) {
            const notifs = getNotifications();
            const config = NOTIF_CONFIG[data.type] || NOTIF_CONFIG['default'];

            const newNotif = {
                id: 'NOT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                type: data.type || 'default',
                title: data.title || '',
                message: data.message || '',
                icon: data.icon || config.icon,
                link: data.link || '',
                isRead: false,
                createdAt: new Date().toISOString()
            };

            notifs.push(newNotif);
            saveNotifications(notifs);

            renderBellDropdown();
            renderNotifications();

            console.log('🔔 إشعار جديد:', newNotif);
            return newNotif;
        },

        seedDemo: function () {
            const now = Date.now();
            const base = getBasePath();

            const demos = [
                {
                    type: 'booking_confirmed',
                    title: 'تم تأكيد حجزك',
                    message: 'تم تأكيد حجز Kia Picanto 2023 — سيتم التواصل معك عبر واتساب',
                    link: base + 'my-bookings.html',
                    createdAt: new Date(now - 5 * 60 * 1000).toISOString()
                },
                {
                    type: 'booking_pending',
                    title: 'طلب حجز جديد',
                    message: 'طلبك لحجز Toyota Corolla 2023 قيد المراجعة',
                    link: base + 'my-bookings.html',
                    createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString()
                },
                {
                    type: 'welcome',
                    title: 'أهلاً بك في يلا كار',
                    message: 'شكراً لتسجيلك — ابدأ بتصفح السيارات الآن',
                    link: base + 'search.html',
                    createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString()
                }
            ];

            const notifs = getNotifications();
            demos.forEach(function (demo) {
                notifs.push(Object.assign({
                    id: 'NOT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                    icon: NOTIF_CONFIG[demo.type] ? NOTIF_CONFIG[demo.type].icon : '🔔',
                    isRead: false
                }, demo));
            });

            saveNotifications(notifs);
            renderNotifications();
        },

        getUnreadCount: function () {
            return getNotifications().filter(function (n) { return !n.isRead; }).length;
        }
    };


    // ============================================
    // 17. التشغيل الأولي
    // ============================================
    renderNotifications();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            setTimeout(function () {
                injectNotificationBell();

                if (getNotifications().length === 0) {
                    window.YallaNotifications.seedDemo();
                }
            }, 50);
        });
    } else {
        setTimeout(function () {
            injectNotificationBell();

            if (getNotifications().length === 0) {
                window.YallaNotifications.seedDemo();
            }
        }, 50);
    }


    // ============================================
    // 18. تسجيل الخروج
    // ============================================
    function logoutUser() {
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }

    document.querySelectorAll('[data-logout]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            logoutUser();
        });
    });

})();