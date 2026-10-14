// ============================================
// Yalla Car — JavaScript صفحة التسجيل
// ============================================

(function () {
    'use strict';

    // ============================================
    // 1. سنة الفوتر
    // ============================================
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }


    // ============================================
    // 2. Toast Notification
    // ============================================
    const toast = document.getElementById('authToast');
    const toastMsg = document.getElementById('authToastMsg');
    let toastTimeout = null;

    function showToast(message, type) {
        if (!toast || !toastMsg) return;

        toastMsg.textContent = message;
        toast.className = 'auth-toast show ' + (type || 'success');

        if (toastTimeout) clearTimeout(toastTimeout);

        toastTimeout = setTimeout(function () {
            toast.classList.remove('show');
        }, 2800);
    }


    // ============================================
    // 3. دوال التحقق
    // ============================================
    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    function isValidPhone(phone) {
        const cleaned = phone.replace(/[\s\-()]/g, '');
        const regex = /^(\+?\d{10,15}|0\d{9,10})$/;
        return regex.test(cleaned);
    }


    // ============================================
    // 4. نموذج التسجيل
    // ============================================
    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('registerName').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const phone = document.getElementById('registerPhone').value.trim();
            const password = document.getElementById('registerPassword').value;
            const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
            const agreeTerms = document.getElementById('agreeTerms').checked;

            if (!name || name.length < 3) {
                showToast('❌ الاسم يجب أن يكون 3 أحرف على الأقل', 'error');
                document.getElementById('registerName').focus();
                return;
            }

            if (!email || !isValidEmail(email)) {
                showToast('❌ البريد الإلكتروني غير صحيح', 'error');
                document.getElementById('registerEmail').focus();
                return;
            }

            if (!phone || !isValidPhone(phone)) {
                showToast('❌ رقم الهاتف غير صحيح', 'error');
                document.getElementById('registerPhone').focus();
                return;
            }

            if (!password || password.length < 8) {
                showToast('❌ كلمة المرور يجب أن تكون 8 أحرف على الأقل', 'error');
                document.getElementById('registerPassword').focus();
                return;
            }

            if (password !== passwordConfirm) {
                showToast('❌ كلمتا المرور غير متطابقتين', 'error');
                document.getElementById('registerPasswordConfirm').focus();
                return;
            }

            if (!agreeTerms) {
                showToast('❌ يجب الموافقة على الشروط والأحكام', 'error');
                return;
            }

            const userData = {
                name: name,
                email: email,
                phone: phone,
                role: 'customer',
                loggedIn: true,
                loginTime: new Date().toISOString()
            };

            localStorage.setItem('user', JSON.stringify(userData));

            console.log('✅ حساب جديد:', userData);

            showToast('✅ تم إنشاء حسابك بنجاح!', 'success');

            setTimeout(function () {
                window.location.href = 'my-bookings.html';
            }, 1500);
        });
    }

})();