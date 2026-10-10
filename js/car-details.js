// ============================================
// Yalla Car — JavaScript صفحة تفاصيل السيارة
// ============================================


// ============================================
// 1. سنة الفوتر تلقائية
// ============================================
const yearElement = document.getElementById('year');
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


// ============================================
// 2. بيانات السيارات (مؤقتاً — حتى نبني الـ Backend)
// ============================================
const carsData = {
    '1': {
        name: 'Kia Picanto 2023',
        company: 'Ram Rentals',
        companyInitial: 'R',
        companySince: '2024',
        price: 22,
        seats: 5,
        year: 2023,
        images: [
            'images/kia-picanto-2023.jpg',
            'images/kia-picanto-2023-side.jpg',
            'images/kia-picanto-2023-rear.jpg'
        ]
    },
    '2': {
        name: 'Toyota Corolla 2023',
        company: 'Amman Rent',
        companyInitial: 'A',
        companySince: '2024',
        price: 28,
        seats: 5,
        year: 2023,
        images: [
            'images/toyota-corolla-2023.jpg',
            'images/toyota-corolla-2023-side.jpg',
            'images/toyota-corolla-2023-rear.jpg'
        ]
    },
    '3': {
        name: 'Hyundai Tucson 2024',
        company: 'Petra Car',
        companyInitial: 'P',
        companySince: '2023',
        price: 45,
        seats: 5,
        year: 2024,
        images: [
            'images/hyundai-tucson-2024.jpg',
            'images/hyundai-tucson-2024-side.jpg',
            'images/hyundai-tucson-2024-rear.jpg'
        ]
    },
    '4': {
        name: 'Mercedes C200',
        company: 'Nukhba Car',
        companyInitial: 'N',
        companySince: '2024',
        price: 85,
        seats: 5,
        year: 2024,
        images: [
            'images/mercedes-c200.jpg',
            'images/mercedes-c200-side.jpg',
            'images/mercedes-c200-rear.jpg'
        ]
    }
};


// ============================================
// 3. قراءة id السيارة من الرابط
// ============================================
const params = new URLSearchParams(window.location.search);
const carId = params.get('id') || '1';
const car = carsData[carId] || carsData['1'];


// ============================================
// 4. تعبئة بيانات السيارة في الصفحة
// ============================================
function fillCarData() {
    document.getElementById('carName').textContent = car.name;
    document.getElementById('breadcrumbName').textContent = car.name;
    document.getElementById('carCompany').textContent = car.company;
    document.getElementById('carPrice').textContent = car.price;
    document.getElementById('specSeats').textContent = car.seats;
    document.getElementById('specYear').textContent = car.year;
    document.getElementById('companyName').textContent = car.company;
    document.getElementById('companyAvatar').textContent = car.companyInitial;
    document.getElementById('companySince').textContent = car.companySince;

    // زر الحجز — يودّي لصفحة الحجز (لاحقاً)
    document.getElementById('bookBtn').href = 'booking.html?id=' + carId;

    // تحديث صور المعرض
    const mainImage = document.getElementById('mainImage');
    mainImage.src = car.images[0];

    const thumbs = document.querySelectorAll('.gallery-thumbs .thumb');
    thumbs.forEach(function (thumb, index) {
        if (car.images[index]) {
            thumb.src = car.images[index];
        }
    });
}

if (car) {
    fillCarData();
}


// ============================================
// 5. معرض الصور — التبديل بين الصور
// ============================================
const mainImage = document.getElementById('mainImage');
const thumbs = document.querySelectorAll('.gallery-thumbs .thumb');

if (mainImage && thumbs.length > 0) {
    thumbs.forEach(function (thumb) {
        thumb.addEventListener('click', function () {
            // تغيير الصورة الكبيرة
            mainImage.src = this.src;

            // تحديث الـ active
            thumbs.forEach(function (t) {
                t.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
}