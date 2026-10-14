// ============================================
// Yalla Car — JavaScript صفحة إضافة / تعديل سيارة
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

            if (user.role !== 'company' && user.role !== 'admin') {
                alert('هذه الصفحة مخصصة للشركات فقط');
                window.location.href = '../index.html';
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
        let toast = document.getElementById('addCarToast');

        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'addCarToast';
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
    // 3. كشف وضع التعديل
    // ============================================
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const isEditMode = mode === 'edit';

    if (isEditMode) {
        console.log('✏️ وضع التعديل');

        const pageTitle = document.querySelector('[data-i18n="addCar.title"]');
        const saveBtn = document.querySelector('[data-i18n="addCar.save"]');

        if (pageTitle) pageTitle.textContent = 'تعديل السيارة';
        if (saveBtn) saveBtn.textContent = 'حفظ التعديلات';

        try {
            const carData = JSON.parse(sessionStorage.getItem('editCar') || '{}');

            if (carData.name) {
                const nameParts = carData.name.match(/^(.+?)\s+(\d{4})$/);

                const carNameInput = document.getElementById('carName');
                const carYearInput = document.getElementById('carYear');
                const carPriceInput = document.getElementById('carPrice');

                if (carNameInput) carNameInput.value = carData.name;
                if (carYearInput && nameParts && nameParts[2]) carYearInput.value = nameParts[2];
                if (carPriceInput && carData.price) carPriceInput.value = carData.price;

                if (nameParts && nameParts[1]) {
                    const brandGuess = nameParts[1].split(' ')[0].toLowerCase();
                    const brandSelect = document.getElementById('carBrand');
                    if (brandSelect) {
                        const option = brandSelect.querySelector(`option[value="${brandGuess}"]`);
                        if (option) brandSelect.value = brandGuess;
                    }
                }
            }
        } catch (err) {
            console.error('فشل تحميل بيانات التعديل:', err);
        }
    }


    // ============================================
    // 4. معاينة الصور
    // ============================================
    function setupImagePreview(inputId, previewId, placeholderId) {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        const placeholder = document.getElementById(placeholderId);

        if (!input || !preview || !placeholder) return;

        input.addEventListener('change', function () {
            const file = this.files[0];
            if (!file) return;

            if (file.size > 5 * 1024 * 1024) {
                showToast('❌ حجم الصورة يجب أن يكون أقل من 5MB', 'error');
                this.value = '';
                return;
            }

            const reader = new FileReader();

            reader.addEventListener('load', function () {
                preview.src = reader.result;
                preview.classList.add('visible');
                placeholder.style.display = 'none';
            });

            reader.readAsDataURL(file);
        });
    }

    setupImagePreview('imageFront', 'preview1', 'placeholder1');
    setupImagePreview('imageSide', 'preview2', 'placeholder2');
    setupImagePreview('imageRear', 'preview3', 'placeholder3');


    // ============================================
    // 5. إرسال النموذج
    // ============================================
    const carForm = document.getElementById('carForm');

    if (carForm) {
        carForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const features = [];
            document.querySelectorAll('input[name="features"]:checked').forEach(function (cb) {
                features.push(cb.value);
            });

            const hasFrontImage = document.getElementById('imageFront').files[0];
            const hasSideImage = document.getElementById('imageSide').files[0];
            const hasRearImage = document.getElementById('imageRear').files[0];

            const imagesCount = [hasFrontImage, hasSideImage, hasRearImage].filter(Boolean).length;

            if (imagesCount === 0 && !isEditMode) {
                showToast('⚠️ يُنصح برفع صورة واحدة على الأقل', 'error');
            }

            const carData = {
                name: document.getElementById('carName').value.trim(),
                brand: document.getElementById('carBrand').value,
                year: document.getElementById('carYear').value,
                category: document.getElementById('carCategory').value,
                seats: document.getElementById('carSeats').value,
                price: document.getElementById('carPrice').value,
                transmission: document.getElementById('carTransmission').value,
                fuel: document.getElementById('carFuel').value,
                location: document.getElementById('carLocation').value,
                description: document.getElementById('carDescription').value.trim(),
                features: features,
                imagesCount: imagesCount,
                updatedAt: new Date().toISOString()
            };

            if (isEditMode) {
                console.log('📝 حفظ التعديلات:', carData);
                showToast('✅ تم حفظ التعديلات!', 'success');
                sessionStorage.removeItem('editCar');
            } else {
                console.log('📋 إضافة سيارة جديدة:', carData);
                carData.addedAt = new Date().toISOString();
                showToast('✅ تم حفظ السيارة!', 'success');

                const cars = JSON.parse(localStorage.getItem('myCars') || '[]');
                cars.push(carData);
                localStorage.setItem('myCars', JSON.stringify(cars));
            }

            setTimeout(function () {
                window.location.href = 'manage-cars.html';
            }, 1500);
        });
    }


    // ============================================
    // 6. تسجيل الخروج (موحّد)
    // ============================================
    document.querySelectorAll('[data-logout]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    });

})();