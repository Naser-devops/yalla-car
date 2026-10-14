// ============================================
// Yalla Car — JavaScript صفحة الملف الشخصي
// ============================================

(function () {
    'use strict';

    let currentUser = null;

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

            currentUser = user;
            console.log('✅ مرحباً', user.email);
        } catch (err) {
            console.error('Auth error:', err);
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
        let toast = document.getElementById('profileToast');

        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'profileToast';
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
    // 3. تحميل بيانات المستخدم
    // ============================================
    function loadUserData() {
        if (!currentUser) return;

        const user = currentUser;

        let displayName = user.name || user.companyName || '';
        if (!displayName && user.email) {
            displayName = user.email.split('@')[0];
        }
        if (!displayName) displayName = 'المستخدم';

        const firstLetter = displayName.charAt(0).toUpperCase();

        const avatarEl = document.getElementById('profileAvatar');
        const nameEl = document.getElementById('profileName');
        const emailEl = document.getElementById('profileEmail');
        const roleEl = document.getElementById('profileRole');

        if (avatarEl) avatarEl.textContent = firstLetter;
        if (nameEl) nameEl.textContent = displayName;
        if (emailEl) emailEl.textContent = user.email || '—';

        const roleLabels = {
            'customer': 'عميل',
            'company': 'شركة',
            'admin': 'مدير النظام'
        };

        if (roleEl) {
            roleEl.textContent = roleLabels[user.role] || 'مستخدم';
        }

        const inputName = document.getElementById('inputName');
        const inputEmail = document.getElementById('inputEmail');
        const inputPhone = document.getElementById('inputPhone');
        const inputRole = document.getElementById('inputRole');

        if (inputName) inputName.value = user.name || user.companyName || displayName;
        if (inputEmail) inputEmail.value = user.email || '';
        if (inputPhone) inputPhone.value = user.phone || '';

        if (inputRole) {
            inputRole.value = roleLabels[user.role] || 'مستخدم';
        }
    }

    loadUserData();


    // ============================================
    // 4. التبويبات
    // ============================================
    const profileTabs = document.querySelectorAll('.profile-tab');
    const profilePanels = document.querySelectorAll('.profile-panel');

    profileTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            const tabName = this.getAttribute('data-tab');

            profileTabs.forEach(function (t) { t.classList.remove('active'); });
            this.classList.add('active');

            profilePanels.forEach(function (panel) {
                panel.classList.remove('active');
                if (panel.getAttribute('data-panel') === tabName) {
                    panel.classList.add('active');
                }
            });
        });
    });


    // ============================================
    // 5. حفظ المعلومات الشخصية
    // ============================================
    const infoForm = document.getElementById('infoForm');

    if (infoForm) {
        infoForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('inputName').value.trim();
            const email = document.getElementById('inputEmail').value.trim();
            const phone = document.getElementById('inputPhone').value.trim();

            if (!name || name.length < 3) {
                showToast('❌ الاسم يجب أن يكون 3 أحرف على الأقل', 'error');
                return;
            }

            if (!email || !email.includes('@')) {
                showToast('❌ البريد الإلكتروني غير صحيح', 'error');
                return;
            }

            currentUser.name = name;
            currentUser.email = email;
            currentUser.phone = phone;

            if (currentUser.role === 'company') {
                currentUser.companyName = name;
            }

            try {
                localStorage.setItem('user', JSON.stringify(currentUser));
                console.log('✅ تم تحديث البيانات:', currentUser);

                loadUserData();

                showToast('✅ تم حفظ التعديلات بنجاح', 'success');
            } catch (err) {
                console.error('خطأ في الحفظ:', err);
                showToast('❌ حدث خطأ أثناء الحفظ', 'error');
            }
        });
    }


    // ============================================
    // 6. تغيير كلمة المرور
    // ============================================
    const passwordForm = document.getElementById('passwordForm');

    if (passwordForm) {
        passwordForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const currentPassword = document.getElementById('inputCurrentPassword').value;
            const newPassword = document.getElementById('inputNewPassword').value;
            const confirmPassword = document.getElementById('inputConfirmPassword').value;

            if (!currentPassword) {
                showToast('❌ يرجى إدخال كلمة المرور الحالية', 'error');
                return;
            }

            if (newPassword.length < 8) {
                showToast('❌ كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل', 'error');
                return;
            }

            if (newPassword !== confirmPassword) {
                showToast('❌ كلمتا المرور غير متطابقتين', 'error');
                return;
            }

            console.log('🔐 تم تغيير كلمة المرور (محاكاة)');

            showToast('✅ تم تحديث كلمة المرور بنجاح', 'success');

            passwordForm.reset();
        });
    }


    // ============================================
    // 7. حذف الحساب + Modal
    // ============================================
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');

    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', function () {
            openDeleteModal();
        });
    }

    function openDeleteModal() {
        let modal = document.getElementById('deleteProfileModal');

        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'deleteProfileModal';
            modal.style.cssText = `
                position: fixed;
                inset: 0;
                background: rgba(15, 23, 42, 0.7);
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
                    max-width: 460px;
                    width: 100%;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
                    font-family: Cairo, sans-serif;
                    transform: scale(0.9);
                    transition: transform 0.3s;
                " id="deleteProfileModalBox">
                    <div style="font-size: 56px; line-height: 1; margin-bottom: 16px;">⚠️</div>
                    <h3 style="
                        font-size: 22px;
                        font-weight: 800;
                        color: #DC2626;
                        margin-bottom: 12px;
                    ">حذف الحساب نهائياً</h3>
                    <p style="
                        font-size: 15px;
                        color: #64748B;
                        margin-bottom: 8px;
                        line-height: 1.7;
                    ">
                        سيتم حذف حسابك وجميع بياناتك نهائياً.
                    </p>
                    <p style="
                        font-size: 14px;
                        color: #DC2626;
                        font-weight: 700;
                        margin-bottom: 24px;
                    ">
                        هذا الإجراء لا يمكن التراجع عنه.
                    </p>
                    <div style="display: flex; gap: 12px;">
                        <button type="button" id="deleteModalCancelBtn" style="
                            flex: 1;
                            height: 48px;
                            border-radius: 10px;
                            background: #F8FAFC;
                            color: #0F172A;
                            border: 1px solid #E2E8F0;
                            font-family: Cairo, sans-serif;
                            font-size: 15px;
                            font-weight: 700;
                            cursor: pointer;
                        ">رجوع</button>
                        <button type="button" id="deleteModalConfirmBtn" style="
                            flex: 1;
                            height: 48px;
                            border-radius: 10px;
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

            document.getElementById('deleteModalCancelBtn').addEventListener('click', closeDeleteModal);
            document.getElementById('deleteModalConfirmBtn').addEventListener('click', performAccountDeletion);

            modal.addEventListener('click', function (e) {
                if (e.target === modal) closeDeleteModal();
            });
        }

        modal.style.opacity = '1';
        modal.style.pointerEvents = 'all';
        document.getElementById('deleteProfileModalBox').style.transform = 'scale(1)';
    }

    function closeDeleteModal() {
        const modal = document.getElementById('deleteProfileModal');
        const box = document.getElementById('deleteProfileModalBox');

        if (modal) {
            modal.style.opacity = '0';
            modal.style.pointerEvents = 'none';
        }
        if (box) box.style.transform = 'scale(0.9)';
    }

    function performAccountDeletion() {
        closeDeleteModal();

        console.log('🗑️ جاري حذف الحساب...');

        try {
            localStorage.removeItem('user');
            localStorage.removeItem('myBookings');
            localStorage.removeItem('yallaNotifications');
            localStorage.removeItem('adminCompanyDecisions');

            showToast('✅ تم حذف حسابك بنجاح', 'success');

            setTimeout(function () {
                window.location.href = '../index.html';
            }, 1500);

        } catch (err) {
            console.error('خطأ في الحذف:', err);
            showToast('❌ حدث خطأ أثناء الحذف', 'error');
        }
    }


    // ============================================
    // 8. تسجيل الخروج
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


    // ============================================
    // 9. Escape لإغلاق Modal
    // ============================================
    document.addEventListener('keydown', function (e) {
        const modal = document.getElementById('deleteProfileModal');
        if (e.key === 'Escape' && modal && modal.style.opacity === '1') {
            closeDeleteModal();
        }
    });

    console.log('✅ Profile page ready');

})();