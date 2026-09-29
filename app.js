import { db, auth, collection, getDocs, onAuthStateChanged, signOut } from './firebase.js';

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
                        <p style="margin-bottom:15px;"><strong>المقاعد:</strong> ${data.available_slots} متاحة من أصل ${data.total_slots}</p>
                        <button class="btn btn-outline" style="width:100%;" onclick="alert('سيتم توجيهك لصفحة تفاصيل البطولة')">التفاصيل</button>
                    </div>
                `;
            });
        }
        
        homeList.innerHTML = html;
        if (allList) allList.innerHTML = html;
        
    } catch (error) {
        console.error("خطأ في جلب البطولات: ", error);
        homeList.innerHTML = '<p style="color:var(--danger-color);">حدث خطأ أثناء تحميل البيانات.</p>';
    }
}

// ==========================================
// 2. وظائف بوابة المستخدم (app.html) - بنظام الدخول السريع
// ==========================================

// دالة مساعدة لتحديث الواجهة بناءً على وجود إيميل
function updateUIForUser(email) {
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const userEmailSpan = document.getElementById('user-email');

    if (email) {
        if (loginSection) loginSection.classList.remove('active');
        if (dashboardSection) {
            dashboardSection.classList.add('active');
            userEmailSpan.innerText = email;
        }
    } else {
        if (dashboardSection) dashboardSection.classList.remove('active');
        if (loginSection) loginSection.classList.add('active');
    }
}

// الاستماع لحالة تسجيل الدخول (Firebase + LocalStorage لعدم التخريب)
onAuthStateChanged(auth, (user) => {
    // التحقق مما إذا كان هناك دخول مبدئي محفوظ في المتصفح
    const localUserEmail = localStorage.getItem('eliteCupUserEmail');
    
    if (user) {
        updateUIForUser(user.email); // دخول نظامي عبر Firebase (مثلاً للإدارة)
    } else if (localUserEmail) {
        updateUIForUser(localUserEmail); // دخول سريع بدون باسوورد للفرق
    } else {
        updateUIForUser(null); // غير مسجل
    }
});

// دالة تسجيل الدخول (مربوطة بنموذج app.html - بالايميل فقط)
window.loginUser = async function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    
    if (email) {
        // حفظ الإيميل في الجلسة المحلية كدخول سريع بدون باسوورد
        localStorage.setItem('eliteCupUserEmail', email);
        
        // تحديث الواجهة فوراً
        updateUIForUser(email);
    }
}

// دالة تسجيل الخروج
window.logoutUser = async function() {
    try {
        // مسح الجلسة المحلية المبدئية
        localStorage.removeItem('eliteCupUserEmail');
        
        // تسجيل الخروج من Firebase (لتنظيف أي جلسات أخرى)
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