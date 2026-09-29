import { db, auth, collection, addDoc, updateDoc, doc, onAuthStateChanged, signOut } from './firebase.js';

// 1. التحقق من الصلاحيات (يجب أن يكون المستخدم Admin)
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'app.html'; // توجيه لصفحة الدخول إذا لم يسجل
    } else {
        // في مشروع حقيقي، نستعلم عن جدول users للتحقق من أن role === 'admin'
        // إذا لم يكن أدمن: alert('لا تملك صلاحية') ثم توجيه لـ index.html
        console.log("مدير مسجل الدخول:", user.email);
        logActivity("تسجيل دخول", `قام المدير ${user.email} بتسجيل الدخول`);
    }
});

// 2. دالة تسجيل العمليات (Activity Logs) كما طلبت في الوثيقة
async function logActivity(action, details) {
    try {
        await addDoc(collection(db, "activity_logs"), {
            admin_email: auth.currentUser?.email || 'Unknown',
            action: action,
            details: details,
            timestamp: new Date().toISOString()
        });
        console.log("تم تسجيل النشاط");
    } catch (e) {
        console.error("خطأ في تسجيل النشاط: ", e);
    }
}

// 3. إضافة بطولة جديدة
window.addTournament = async function(event) {
    event.preventDefault();
    const name = document.getElementById('t-name').value;
    const sport = document.getElementById('t-sport').value;
    const slots = parseInt(document.getElementById('t-slots').value);

    try {
        await addDoc(collection(db, "tournaments"), {
            name: name,
            sport: sport,
            total_slots: slots,
            available_slots: slots,
            status: "active",
            created_at: new Date().toISOString()
        });
        
        alert("تم إنشاء البطولة بنجاح!");
        document.getElementById('t-name').value = '';
        
        // تسجيل العملية في السجل
        logActivity("إنشاء بطولة", `تم إنشاء بطولة جديدة باسم: ${name}`);
        
    } catch (e) {
        console.error("خطأ: ", e);
        alert("حدث خطأ أثناء الإنشاء");
    }
}

// 4. اعتماد التسجيل وتغيير حالة الدفع (الإجراء اليدوي)
window.approveRegistration = async function(registrationId) {
    const confirmAction = confirm("هل أنت متأكد من استلام المبلغ واعتماد هذا الفريق؟");
    if (!confirmAction) return;

    try {
        const regRef = doc(db, "registrations", registrationId);
        
        // تحديث قاعدة البيانات: الدفع مكتمل، والتسجيل معتمد
        await updateDoc(regRef, {
            payment_status: "مكتمل",
            registration_status: "معتمد",
            approved_by: auth.currentUser.email
        });

        alert("تم اعتماد الفريق وتحديث حالة الدفع بنجاح.");
        logActivity("تحديث حالة الدفع والتسجيل", `تم اعتماد الطلب رقم: ${registrationId}`);
        // هنا يمكنك استدعاء دالة تحديث الجدول (Refresh Table)
        
    } catch (e) {
        console.error("خطأ في تحديث البيانات: ", e);
    }
}

// 5. تسجيل الخروج للإدارة
window.logoutAdmin = async function() {
    await signOut(auth);
    window.location.href = 'index.html';
}