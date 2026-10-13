// ============================================
// Yalla Car — JavaScript صفحة "تواصل معنا"
// ============================================


// ============================================
// 1. سنة الفوتر تلقائية
// ============================================
const yearElement = document.getElementById('year');
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


// ============================================
// 2. Toast Notification
// ============================================
const toast = document.getElementById('contactToast');
const toastMsg = document.getElementById('contactToastMsg');
let toastTimeout = null;

function showToast(message, type) {
    if (!toast) return;

    toastMsg.textContent = message;
    toast.className = 'contact-toast show ' + (type || 'success');

    if (toastTimeout) clearTimeout(toastTimeout);

    toastTimeout = setTimeout(function () {
        toast.classList.remove('show');
    }, 3200);
}


// ============================================
// 3. إرسال النموذج
// ============================================
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('contactName').value,
            email: document.getElementById('contactEmail').value,
            phone: document.getElementById('contactPhone').value,
            subject: document.getElementById('contactSubject').value,
            message: document.getElementById('contactMessage').value
        };

        console.log('📨 رسالة جديدة:', formData);

        // إظهار رسالة نجاح
        showToast('✅ تم إرسال رسالتك! سنرد خلال 24 ساعة', 'success');

        // مسح النموذج
        contactForm.reset();
    });
}


// ============================================
// 4. FAQ — إغلاق الباقي عند فتح واحد
// ============================================
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
        if (item.open) {
            faqItems.forEach(function (other) {
                if (other !== item && other.open) {
                    other.open = false;
                }
            });
        }
    });
});