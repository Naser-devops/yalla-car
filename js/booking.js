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
// 2. بيانات السيارات (نفس car-details.js)
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
// 4. تحديث الملخص ببيانات السيارة
// ============================================
function updateSummary() {
    document.getElementById('summaryName').textContent = car.name;
    document.getElementById('summaryCompany').textContent = car.company;
    document.getElementById('summaryImage').src = car.image;
    document.getElementById('summaryDailyPrice').textContent = car.price;
    document.getElementById('summaryTotal').textContent = car.price;
}

updateSummary();


// ============================================
// 5. حساب المجموع عند تغيير التواريخ
// ============================================
const pickupInput = document.getElementById('pickupDate');
const returnInput = document.getElementById('returnDate');

const summaryPickup = document.getElementById('summaryPickup');
const summaryReturn = document.getElementById('summaryReturn');
const summaryDays = document.getElementById('summaryDays');
const summaryTotal = document.getElementById('summaryTotal');

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return day + ' / ' + month + ' / ' + year;
}

function updateTotal() {
    const pickup = pickupInput.value;
    const returnDate = returnInput.value;

    if (pickup) {
        summaryPickup.textContent = formatDate(pickup);
    }

    if (returnDate) {
        summaryReturn.textContent = formatDate(returnDate);
    }

    if (pickup && returnDate) {
        const pickupDate = new Date(pickup);
        const returnDateObj = new Date(returnDate);
        const diffTime = returnDateObj - pickupDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
            summaryDays.textContent = diffDays;
            summaryTotal.textContent = diffDays * car.price;
        } else {
            summaryDays.textContent = '0';
            summaryTotal.textContent = car.price;
        }
    }
}

if (pickupInput && returnInput) {
    pickupInput.addEventListener('change', updateTotal);
    returnInput.addEventListener('change', updateTotal);
}


// ============================================
// 6. معالجة إرسال النموذج
// ============================================
const bookingForm = document.getElementById('bookingForm');

if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // جمع البيانات
        const formData = {
            carId: carId,
            carName: car.name,
            pickup: pickupInput.value,
            returnDate: returnInput.value,
            days: summaryDays.textContent,
            total: summaryTotal.textContent,
            payment: document.querySelector('input[name="payment"]:checked').value
        };

        console.log('بيانات الحجز:', formData);

        // مؤقتاً — تنبيه
        alert(
            '✅ تم استلام الحجز!\n\n' +
            'السيارة: ' + formData.carName + '\n' +
            'المدة: ' + formData.days + ' أيام\n' +
            'المجموع: ' + formData.total + ' د.أ\n' +
            'الدفع: ' + formData.payment + '\n\n' +
            '(بانتظار ربط الـ Backend)'
        );
    });
}