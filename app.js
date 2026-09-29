import { db, auth, collection, getDocs, onAuthStateChanged, signInWithEmailAndPassword, signOut } from './firebase.js';

// ==========================================
// 1. وظائف الواجهة العامة (للزوار - index.html)
// ==========================================
async function loadTournaments() {
    const homeList = document.getElementById('home-tournaments-list');
    const allList = document.getElementById('all-tournaments-list');
    
    // التحقق من وجود العنصر (للتأكد أننا في صفحة index.html)
    if (!homeList) return; 

    try {
        const querySnapshot = await getDocs(collection(db, "tournaments"));
        let html = '';
        
        if (querySnapshot.empty) {
            html = '<p>لا توجد بطولات متاحة حالياً.</p>';
        } else {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                html += `
                    <div class="card">
                        <h3>${data.name}</h3>
                        <p><strong>الرياضة:</strong> ${data.sport}</p>
                        <p><strong>التاريخ:</strong> ${data.date || 'يحدد لاحقاً'}</p>
                        <p><strong>المقاعد:</strong> ${data.available_slots} متاحة من أصل ${data.total_slots}</p>
                        <hr style="margin: 10px 0; border: 0; border-top: 1px solid #eee;">
                        <button class="btn btn-primary" onclick="alert('سيتم توجيهك لصفحة تفاصيل البطولة')">التفاصيل</button>
                    </div>
                `;
            });
        }
        
        homeList.innerHTML = html;
        if (allList) allList.innerHTML = html;
        
    } catch (error) {
        console.error("خطأ في جلب البطولات: ", error);
        homeList.innerHTML = '<p>حدث خطأ أثناء تحميل البيانات.</p>';
    }
}

// ==========================================
// 2. وظائف بوابة المستخدم (app.html)
// ==========================================

// الاستماع لحالة تسجيل الدخول
onAuthStateChanged(auth, (user) => {
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const userEmailSpan = document.getElementById('user-email');

    if (user) {
        // المستخدم مسجل دخوله
        if (loginSection) loginSection.classList.remove('active');
        if (dashboardSection) {
            dashboardSection.classList.add('active');
            userEmailSpan.innerText = user.email;
        }
    } else {
        // المستخدم غير مسجل
        if (dashboardSection) dashboardSection.classList.remove('active');
        if (loginSection) loginSection.classList.add('active');
    }
});

// دالة تسجيل الدخول (مربوطة بنموذج app.html)
window.loginUser = async function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('login-error');
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        errorMessage.innerText = '';
        // سيتم تحويل الواجهة تلقائياً عبر onAuthStateChanged
    } catch (error) {
        errorMessage.innerText = 'خطأ في البريد الإلكتروني أو كلمة المرور';
        console.error(error);
    }
}

// دالة تسجيل الخروج
window.logoutUser = async function() {
    try {
        await signOut(auth);
        window.location.href = 'index.html'; // العودة للرئيسية
    } catch (error) {
        console.error("خطأ في تسجيل الخروج: ", error);
    }
}

// تشغيل الوظائف عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    loadTournaments();
});