// ============================================
// Yalla Car — JavaScript صفحة الحجز
// ============================================


// ============================================
// 1. سنة الفوتر تلقائية
// ============================================
const yearElement = document.getElementById('year');
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


// ============================================
// 2. بيانات السيارات (مؤقتاً — حتى الباك إند)
// ============================================
const carsData = {
    '1': { name: 'Kia Picanto 2023', company: 'Ram Rentals', price: 22, image: 'images/kia-picanto-2023.jpg' },
    '2': { name: 'Toyota Corolla 2023', company: 'Amman Rent', price: 28, image: 'images/toyota-corolla-2023.jpg' },
    '3': { name: 'Hyundai Tucson 2024', company: 'Petra Car', price: 45, image: 'images/hyundai-tucson-2024.jpg' },
    '4': { name: 'Mercedes C200', company: 'Nukhba Car', price: 85, image: 'images/mercedes-c200.jpg' }
};


// ============================================
// 3. قراءة id السيارة من الرابط
// ============================================
const params = new URLSearchParams(window.location.search);
const carId = params.get('id') || '1';
const car = carsData[carId] || carsData['1'];


// ============================================
// 4. Toast Notification
// ============================================
function showToast(message, type) {
    let toast = document.getElementById('bookingToast');

    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'bookingToast';
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
// 5. تحديث الملخص ببيانات السيارة
// ============================================
function updateSummary() {
    const summaryName = document.getElementById('summaryName');
    const summaryCompany = document.getElementById('summaryCompany');
    const summaryImage = document.getElementById('summaryImage');
    const summaryDailyPrice = document.getElementById('summaryDailyPrice');
    const summaryTotal = document.getElementById('summaryTotal');

    if (summaryName) summaryName.textContent = car.name;
    if (summaryCompany) summaryCompany.textContent = car.company;
    if (summaryImage) summaryImage.src = car.image;
    if (summaryDailyPrice) summaryDailyPrice.textContent = car.price;
    if (summaryTotal) summaryTotal.textContent = car.price;
}

updateSummary();


// ============================================
// 6. ✅ التواريخ — تعيين الحد الأدنى
// ============================================
const pickupInput = document.getElementById('pickupDate');
const returnInput = document.getElementById('returnDate');

const summaryPickup = document.getElementById('summaryPickup');
const summaryReturn = document.getElementById('summaryReturn');
const summaryDays = document.getElementById('summaryDays');
const summaryTotal = document.getElementById('summaryTotal');


// ✅ التاريخ بصيغة YYYY-MM-DD
function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
}

// ✅ التاريخ بعد يوم واحد من الاستلام
function getNextDayString(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
}

// ✅ تنسيق للعرض: 12 / 10 / 2026
function formatDate(dateString) {
    if (!dateString) return '— / — / —';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return day + ' / ' + month + ' / ' + year;
}

// ✅ تعيين الحد الأدنى لتاريخ الاستلام = اليوم
if (pickupInput) {
    pickupInput.min = getTodayString();
}

// ✅ تعيين الحد الأدنى لتاريخ الإرجاع = غداً
if (returnInput) {
    returnInput.min = getNextDayString(getTodayString());
}


// ============================================
// 7. ✅ تحديث الملخص + الحساب
// ============================================
function updateTotal() {
    const pickup = pickupInput ? pickupInput.value : '';
    const returnDate = returnInput ? returnInput.value : '';

    // تحديث التواريخ في الملخص
    if (summaryPickup) summaryPickup.textContent = formatDate(pickup);
    if (summaryReturn) summaryReturn.textContent = formatDate(returnDate);

    // ✅ لو في تاريخ استلام → عدّل الحد الأدنى للإرجاع
    if (pickup && returnInput) {
        const minReturn = getNextDayString(pickup);
        returnInput.min = minReturn;

        // لو تاريخ الإرجاع الحالي قبل الحد الأدنى → أعِد تعيينه
        if (returnDate && returnDate < minReturn) {
            returnInput.value = '';
            if (summaryReturn) summaryReturn.textContent = '— / — / —';
        }
    }

    // ✅ حساب الأيام
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
// 8. ✅ إرسال النموذج (مع تحقق شامل)
// ============================================
const bookingForm = document.getElementById('bookingForm');

if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // --- التحقق 1: التواريخ مطلوبة ---
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

        // --- التحقق 2: الإرجاع بعد الاستلام ---
        if (returnDate <= pickup) {
            showToast('❌ تاريخ الإرجاع يجب أن يكون بعد تاريخ الاستلام', 'error');
            if (returnInput) returnInput.focus();
            return;
        }

        // --- التحقق 3: الموافقة على الشروط ---
        const termsCheckbox = bookingForm.querySelector('.checkbox-terms input[type="checkbox"]');
        if (termsCheckbox && !termsCheckbox.checked) {
            showToast('❌ يجب الموافقة على الشروط والأحكام', 'error');
            return;
        }

        // --- التحقق 4: طريقة الدفع مختارة ---
        const paymentInput = document.querySelector('input[name="payment"]:checked');
        if (!paymentInput) {
            showToast('❌ يرجى اختيار طريقة الدفع', 'error');
            return;
        }

        // --- جمع البيانات ---
        const formData = {
            carId: carId,
            carName: car.name,
            carCompany: car.company,
            pickup: pickup,
            returnDate: returnDate,
            days: summaryDays ? summaryDays.textContent : '0',
            total: summaryTotal ? summaryTotal.textContent : '0',
            payment: paymentInput.value,
            createdAt: new Date().toISOString()
        };

        console.log('📋 بيانات الحجز:', formData);

        // --- حفظ مؤقت في localStorage ---
        const bookings = JSON.parse(localStorage.getItem('myBookings') || '[]');
        bookings.push(formData);
        localStorage.setItem('myBookings', JSON.stringify(bookings));

        // --- Toast + التوجيه ---
        showToast('✅ تم استلام الحجز! سيتم التأكيد عبر واتساب', 'success');

        setTimeout(function () {
            window.location.href = 'my-bookings.html';
        }, 2000);
    });
}