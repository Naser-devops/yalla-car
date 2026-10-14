// ============================================
// Yalla Car — JavaScript صفحة الحجز
// ============================================

(function () {
    'use strict';

    // ============================================
    // 0. 🛡️ Auth Guard — يجب تسجيل الدخول
    // ============================================
    (function checkBookingAuth() {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            if (!user.loggedIn) {
                console.warn('🚫 يجب تسجيل الدخول للحجز');
                sessionStorage.setItem('redirectAfterLogin', window.location.href);
                window.location.href = 'login.html';
                return;
            }

            console.log('✅ مرحباً', user.email, '— يمكنك الحجز');
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
    // 2. بيانات السيارات
    // ============================================
    const carsData = {
        '1': { name: 'Kia Picanto 2023', company: 'Ram Rentals', price: 22, image: 'images/kia-picanto-2023.jpg' },
        '2': { name: 'Toyota Corolla 2023', company: 'Amman Rent', price: 28, image: 'images/toyota-corolla-2023.jpg' },
        '3': { name: 'Hyundai Tucson 2024', company: 'Petra Car', price: 45, image: 'images/hyundai-tucson-2024.jpg' },
        '4': { name: 'Mercedes C200', company: 'Nukhba Car', price: 85, image: 'images/mercedes-c200.jpg' }
    };

    const params = new URLSearchParams(window.location.search);
    const carId = params.get('id') || '1';
    const car = carsData[carId] || carsData['1'];


    // ============================================
    // 3. Toast Notification (تحت)
    // ============================================
    function showToast(message, type) {
        let toast = document.getElementById('bookingToast');

        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'bookingToast';
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
    // 4. تحديث الملخص
    // ============================================
    function updateSummary() {
        const summaryName = document.getElementById('summaryName');
        const summaryCompany = document.getElementById('summaryCompany');
        const summaryImage = document.getElementById('summaryImage');
        const summaryDailyPrice = document.getElementById('summaryDailyPrice');
        const summaryTotal = document.getElementById('summaryTotal');

        if (summaryName) summaryName.textContent = car.name;
        if (summaryCompany) summaryCompany.textContent = car.company;

        const IMG_BASE = (window.location.pathname.indexOf('/pages/') !== -1) ? '../' : '';
        if (summaryImage) summaryImage.src = IMG_BASE + car.image;
        if (summaryDailyPrice) summaryDailyPrice.textContent = car.price;
        if (summaryTotal) summaryTotal.textContent = car.price;
    }

    updateSummary();


    // ============================================
    // 5. التواريخ
    // ============================================
    const pickupInput = document.getElementById('pickupDate');
    const returnInput = document.getElementById('returnDate');

    const summaryPickup = document.getElementById('summaryPickup');
    const summaryReturn = document.getElementById('summaryReturn');
    const summaryDays = document.getElementById('summaryDays');
    const summaryTotal = document.getElementById('summaryTotal');

    function getTodayString() {
        const today = new Date();
        return today.getFullYear() + '-' +
            String(today.getMonth() + 1).padStart(2, '0') + '-' +
            String(today.getDate()).padStart(2, '0');
    }

    function getNextDayString(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        date.setDate(date.getDate() + 1);
        return date.getFullYear() + '-' +
            String(date.getMonth() + 1).padStart(2, '0') + '-' +
            String(date.getDate()).padStart(2, '0');
    }

    function formatDate(dateString) {
        if (!dateString) return '— / — / —';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return day + ' / ' + month + ' / ' + year;
    }

    if (pickupInput) pickupInput.min = getTodayString();
    if (returnInput) returnInput.min = getNextDayString(getTodayString());


    // ============================================
    // 6. تحديث الملخص + الحساب
    // ============================================
    function updateTotal() {
        const pickup = pickupInput ? pickupInput.value : '';
        const returnDate = returnInput ? returnInput.value : '';

        if (summaryPickup) summaryPickup.textContent = formatDate(pickup);
        if (summaryReturn) summaryReturn.textContent = formatDate(returnDate);

        if (pickup && returnInput) {
            const minReturn = getNextDayString(pickup);
            returnInput.min = minReturn;

            if (returnDate && returnDate < minReturn) {
                returnInput.value = '';
                if (summaryReturn) summaryReturn.textContent = '— / — / —';
            }
        }

        if (pickup && returnInput && returnInput.value) {
            const pickupDate = new Date(pickup);
            const returnDateObj = new Date(returnInput.value);
            const diffTime = returnDateObj - pickupDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 0) {
                if (summaryDays) summaryDays.textContent = diffDays;
                if (summaryTotal) summaryTotal.textContent = diffDays * car.price;
            } else {
                if (summaryDays) summaryDays.textContent = '0';
                if (summaryTotal) summaryTotal.textContent = car.price;
            }
        } else {
            if (summaryDays) summaryDays.textContent = '0';
            if (summaryTotal) summaryTotal.textContent = car.price;
        }
    }

    if (pickupInput) pickupInput.addEventListener('change', updateTotal);
    if (returnInput) returnInput.addEventListener('change', updateTotal);


    // ============================================
    // 7. إرسال النموذج
    // ============================================
    const bookingForm = document.getElementById('bookingForm');

    if (bookingForm) {
        bookingForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const pickup = pickupInput ? pickupInput.value : '';
            const returnDate = returnInput ? returnInput.value : '';

            if (!pickup) {
                showToast('❌ يرجى اختيار تاريخ الاستلام', 'error');
                if (pickupInput) pickupInput.focus();
                return;
            }

            if (!returnDate) {
                showToast('❌ يرجى اختيار تاريخ الإرجاع', 'error');
                if (returnInput) returnInput.focus();
                return;
            }

            if (returnDate <= pickup) {
                showToast('❌ تاريخ الإرجاع يجب أن يكون بعد تاريخ الاستلام', 'error');
                if (returnInput) returnInput.focus();
                return;
            }

            const termsCheckbox = document.getElementById('termsAgree');
            if (termsCheckbox && !termsCheckbox.checked) {
                showToast('❌ يجب الموافقة على الشروط والأحكام', 'error');
                return;
            }

            const paymentInput = document.querySelector('input[name="payment"]:checked');
            if (!paymentInput) {
                showToast('❌ يرجى اختيار طريقة الدفع', 'error');
                return;
            }

            const driverName = document.getElementById('driverName') ? document.getElementById('driverName').value.trim() : '';
            const driverPhone = document.getElementById('driverPhone') ? document.getElementById('driverPhone').value.trim() : '';
            const driverEmail = document.getElementById('driverEmail') ? document.getElementById('driverEmail').value.trim() : '';
            const driverLicense = document.getElementById('driverLicense') ? document.getElementById('driverLicense').value.trim() : '';
            const pickupCitySelect = document.getElementById('pickupCitySelect');
            const pickupCity = pickupCitySelect ? pickupCitySelect.value : 'amman';

            if (!driverName || !driverPhone || !driverEmail || !driverLicense) {
                showToast('❌ يرجى تعبئة جميع بيانات السائق', 'error');
                return;
            }

            const pickupDate = new Date(pickup);
            const returnDateObj = new Date(returnDate);
            const diffTime = returnDateObj - pickupDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const totalPrice = diffDays * car.price;

            const bookingId = 'BK-' + Date.now().toString().slice(-6);

            const user = JSON.parse(localStorage.getItem('user') || '{}');

            const bookingData = {
                bookingId: bookingId,
                userEmail: user.email || '',
                carId: carId,
                carName: car.name,
                carCompany: car.company,
                carImage: car.image,
                customerName: driverName,
                customerPhone: driverPhone,
                customerEmail: driverEmail,
                customerLicense: driverLicense,
                pickupCity: pickupCity,
                pickup: pickup,
                returnDate: returnDate,
                pickupFormatted: formatDate(pickup),
                returnFormatted: formatDate(returnDate),
                days: diffDays,
                total: totalPrice,
                dailyPrice: car.price,
                payment: paymentInput.value,
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            console.log('📋 بيانات الحجز:', bookingData);

            try {
                const bookings = JSON.parse(localStorage.getItem('myBookings') || '[]');
                bookings.push(bookingData);
                localStorage.setItem('myBookings', JSON.stringify(bookings));
                console.log('✅ تم حفظ الحجز في localStorage');

                if (window.YallaNotifications && typeof window.YallaNotifications.add === 'function') {
                    window.YallaNotifications.add({
                        type: 'booking_pending',
                        title: 'طلب حجز جديد',
                        message: 'طلبك لحجز ' + car.name + ' قيد المراجعة',
                        link: 'my-bookings.html'
                    });
                }
            } catch (err) {
                console.error('خطأ في حفظ الحجز:', err);
            }

            showToast('✅ تم استلام الحجز! سيتم التأكيد عبر واتساب', 'success');

            setTimeout(function () {
                window.location.href = 'my-bookings.html';
            }, 2000);
        });
    }

})();