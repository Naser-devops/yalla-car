// ============================================
// Yalla Car — JavaScript صفحة تسجيل الشركة
// ============================================


// ============================================
// 1. Toast Notification
// ============================================
const toast = document.getElementById('registerToast');
const toastMsg = document.getElementById('registerToastMsg');
let toastTimeout = null;

function showToast(message, type) {
    if (!toast) return;

    toastMsg.textContent = message;
    toast.className = 'auth-toast show ' + (type || 'success');

    if (toastTimeout) clearTimeout(toastTimeout);

    toastTimeout = setTimeout(function () {
        toast.classList.remove('show');
    }, 3200);
}


// ============================================
// 2. رفع الوثائق
// ============================================
function setupDocUpload(inputId, placeholderId, successId, nameId) {
    const input = document.getElementById(inputId);
    const placeholder = document.getElementById(placeholderId);
    const success = document.getElementById(successId);
    const nameEl = document.getElementById(nameId);

    if (!input || !placeholder || !success) return;

    input.addEventListener('change', function () {
        const file = this.files[0];
        if (!file) return;

        // إظهار حالة النجاح
        placeholder.style.display = 'none';
        success.classList.add('visible');

        if (nameEl) {
            const shortName = file.name.length > 25
                ? file.name.substring(0, 22) + '...'
                : file.name;
            nameEl.textContent = shortName;
        }
    });
}

setupDocUpload('docCR', 'docCRPlaceholder', 'docCRSuccess', 'docCRName');
setupDocUpload('docTax', 'docTaxPlaceholder', 'docTaxSuccess', 'docTaxName');


// ============================================
// 3. إرسال النموذج
// ============================================
const companyForm = document.getElementById('companyForm');

if (companyForm) {
    companyForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const password = document.getElementById('companyPassword').value;
        const passwordConfirm = document.getElementById('companyPasswordConfirm').value;

        // التحقق من تطابق كلمات المرور
        if (password !== passwordConfirm) {
            showToast('❌ كلمتا المرور غير متطابقتين', 'error');
            return;
        }

        // جمع البيانات
        const formData = {
            companyName: document.getElementById('companyName').value,
            crNumber: document.getElementById('crNumber').value,
            yearFounded: document.getElementById('yearFounded').value,
            carsCount: document.getElementById('carsCount').value,
            email: document.getElementById('companyEmail').value,
            phone: document.getElementById('companyPhone').value,
            city: document.getElementById('companyCity').value,
            address: document.getElementById('companyAddress').value,
            hasCRDoc: !!document.getElementById('docCR').files[0],
            hasTaxDoc: !!document.getElementById('docTax').files[0]
        };

        console.log('📋 طلب تسجيل شركة جديد:', formData);

        // إظهار رسالة نجاح
        showToast('✅ تم إرسال طلبك بنجاح! جاري المراجعة...', 'success');

        // حفظ بيانات الطلب مؤقتاً
        localStorage.setItem('companyRequest', JSON.stringify({
            ...formData,
            status: 'pending',
            submittedAt: new Date().toISOString()
        }));

        // التوجيه لصفحة "قيد المراجعة"
        setTimeout(function () {
            window.location.href = 'pending-approval.html';
        }, 1800);
    });
}


// ============================================
// 4. تفاعلات الحقول (إظهار الأخطاء)
// ============================================
document.querySelectorAll('.form-field input, .form-field select').forEach(function (field) {
    field.addEventListener('invalid', function () {
        this.style.borderColor = 'var(--color-error)';
    });

    field.addEventListener('input', function () {
        this.style.borderColor = '';
    });
});