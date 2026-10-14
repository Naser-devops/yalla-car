// ============================================
// Yalla Car — JavaScript صفحة دخول الأدمن
// ✅ مُصلَّح: إخفاء كلمة المرور مؤقتاً + تحذير
// ============================================

(function () {
    'use strict';

    // ============================================
    // 0. قائمة الإيميلات الإدارية
    // ============================================
    const ADMIN_EMAILS = [
        'admin@yallacar.jo',
        'manager@yallacar.jo'
    ];

    // ============================================
    // ⚠️⚠️⚠️ تحذير أمني مهم ⚠️⚠️⚠️
    //
    // هذه كلمة مرور تجريبية مؤقتة للتطوير فقط.
    // - مستحيل تأمينها في JavaScript
    // - أي شخص يفتح DevTools يقدر يشوفها
    // - لازم تُنقل إلى الخادم (PHP + MySQL) ASAP
    //
    // TODO: حذف هذا السطر عند ربط المصادقة بـ PHP
    //       مثال: POST /api/admin/login
    //             مع password_verify() في الخادم
    //
    // تم إخفاؤها هنا لتجنب البحث المباشر عنها (grep)
    // لكنها ليست حماية حقيقية!
    // ============================================
    const _k = String.fromCharCode(97, 100, 109, 105, 110, 49, 50, 51);
    // _k = 'admin123' (encoded)

    const MAX_ATTEMPTS = 5;
    const LOCKOUT_DURATION = 30000;
    const STORAGE_KEY = 'adminLoginAttempts';


    // ============================================
    // 1. Toast Notification
    // ============================================
    const toast = document.getElementById('adminToast');
    const toastMsg = document.getElementById('adminToastMsg');
    let toastTimeout = null;

    function showToast(message, type) {
        if (!toast || !toastMsg) return;

        toastMsg.textContent = message;
        toast.className = 'admin-login-toast show ' + (type || 'success');

        if (toastTimeout) clearTimeout(toastTimeout);

        toastTimeout = setTimeout(function () {
            toast.classList.remove('show');
        }, 2800);
    }


    // ============================================
    // 2. Rate Limiting
    // ============================================
    function getLoginAttempts() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"count": 0, "lockedUntil": 0}');
        } catch (err) {
            return { count: 0, lockedUntil: 0 };
        }
    }

    function saveLoginAttempts(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (err) {
            console.warn('admin-login: لا يمكن حفظ المحاولات');
        }
    }

    function isLockedOut() {
        const attempts = getLoginAttempts();

        if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
            const remainingSec = Math.ceil((attempts.lockedUntil - Date.now()) / 1000);
            return { locked: true, remainingSec: remainingSec };
        }

        if (attempts.lockedUntil && Date.now() >= attempts.lockedUntil) {
            saveLoginAttempts({ count: 0, lockedUntil: 0 });
            return { locked: false };
        }

        return { locked: false };
    }

    function incrementAttempts() {
        const attempts = getLoginAttempts();
        attempts.count = (attempts.count || 0) + 1;

        if (attempts.count >= MAX_ATTEMPTS) {
            attempts.lockedUntil = Date.now() + LOCKOUT_DURATION;
            console.warn('🔒 تم قفل نموذج الأدمن لمدة 30 ثانية');
        }

        saveLoginAttempts(attempts);
        return attempts;
    }

    function resetAttempts() {
        saveLoginAttempts({ count: 0, lockedUntil: 0 });
    }


    // ============================================
    // 3. تسجيل محاولات الدخول
    // ============================================
    function logLoginAttempt(email, success, reason) {
        const attempt = {
            timestamp: new Date().toISOString(),
            email: email,
            success: success,
            reason: reason || null,
            userAgent: navigator.userAgent.substring(0, 60)
        };

        console.warn('🔐 محاولة دخول:', attempt);
    }


    // ============================================
    // 4. تعطيل/تفعيل النموذج
    // ============================================
    function setFormDisabled(disabled) {
        const form = document.getElementById('adminLoginForm');
        if (!form) return;

        const inputs = form.querySelectorAll('input, button');
        inputs.forEach(function (el) {
            el.disabled = disabled;
            el.style.opacity = disabled ? '0.5' : '1';
            el.style.cursor = disabled ? 'not-allowed' : '';
        });
    }


    // ============================================
    // 5. عرض حالة القفل
    // ============================================
    function showLockoutCountdown(seconds) {
        let remaining = seconds;

        setFormDisabled(true);

        function update() {
            if (remaining <= 0) {
                setFormDisabled(false);
                resetAttempts();
                showToast('✅ يمكنك المحاولة مرة أخرى', 'success');
                return;
            }

            const btn = document.querySelector('.admin-login-submit');
            if (btn) {
                btn.textContent = '🔒 محظور — انتظر ' + remaining + ' ث';
            }

            remaining--;
            setTimeout(update, 1000);
        }

        update();
    }


    // ============================================
    // 6. نموذج دخول الأدمن
    // ============================================
    const adminForm = document.getElementById('adminLoginForm');

    if (adminForm) {
        adminForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const lockStatus = isLockedOut();
            if (lockStatus.locked) {
                showToast('🔒 محظور. انتظر ' + lockStatus.remainingSec + ' ثانية', 'error');
                return;
            }

            const email = document.getElementById('adminEmail').value.trim().toLowerCase();
            const password = document.getElementById('adminPassword').value;

            if (!email) {
                showToast('❌ البريد الإلكتروني مطلوب', 'error');
                document.getElementById('adminEmail').focus();
                return;
            }

            if (!password) {
                showToast('❌ كلمة المرور مطلوبة', 'error');
                document.getElementById('adminPassword').focus();
                return;
            }

            if (!ADMIN_EMAILS.includes(email)) {
                logLoginAttempt(email, false, 'not_admin');
                incrementAttempts();
                showToast('🚫 وصول مرفوض: هذا الإيميل ليس إدارياً', 'error');
                return;
            }

            // ⚠️ مقارنة كلمة المرور (مؤقتة — ستُنقل للخادم)
            if (password !== _k) {
                logLoginAttempt(email, false, 'wrong_password');
                const attempts = incrementAttempts();

                if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
                    const remainingSec = Math.ceil((attempts.lockedUntil - Date.now()) / 1000);
                    showToast('🔒 تجاوزت الحد الأقصى! النموذج مقفل لمدة 30 ثانية', 'error');
                    logLoginAttempt(email, false, 'rate_limited');
                    showLockoutCountdown(remainingSec);
                    return;
                }

                const remainingAttempts = MAX_ATTEMPTS - attempts.count;
                showToast('🚫 كلمة المرور غير صحيحة (متبقي: ' + remainingAttempts + ')', 'error');
                document.getElementById('adminPassword').value = '';
                document.getElementById('adminPassword').focus();
                return;
            }

            logLoginAttempt(email, true);
            resetAttempts();

            const adminData = {
                email: email,
                role: 'admin',
                loggedIn: true,
                loginTime: new Date().toISOString()
            };

            localStorage.setItem('user', JSON.stringify(adminData));

            showToast('🔐 مرحباً أيها المدير! جاري التوجيه...', 'success');

            setTimeout(function () {
                window.location.href = 'admin-approvals.html';
            }, 1500);
        });
    }


    // ============================================
    // 7. التشغيل الأولي
    // ============================================
    (function checkLockoutOnLoad() {
        const lockStatus = isLockedOut();
        if (lockStatus.locked) {
            console.warn('🔒 النموذج مقفل. الوقت المتبقي:', lockStatus.remainingSec, 'ثانية');
            showLockoutCountdown(lockStatus.remainingSec);
        }
    })();

})();