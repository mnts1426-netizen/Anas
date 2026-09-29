import { db, auth, collection, getDocs, onAuthStateChanged, signOut } from './firebase.js';

let globalTournaments = []; // متغير لتخزين بيانات البطولات لعمل الفلترة بدون إعادة التحميل

// ==========================================
// 1. وظائف الواجهة العامة والفلترة الديناميكية
// ==========================================
async function loadTournaments() {
    const homeList = document.getElementById('home-tournaments-list');
    if (!homeList) return; 

    try {
        const querySnapshot = await getDocs(collection(db, "tournaments"));
        globalTournaments = []; // تفريغ المصفوفة
        
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                globalTournaments.push({ id: doc.id, ...doc.data() });
            });
        }
        
        // عرض جميع البطولات كحالة افتراضية
        renderTournamentsList('all');
        
    } catch (error) {
        console.error("خطأ في جلب البطولات: ", error);
        if (homeList) homeList.innerHTML = '<p style="color:var(--danger-color); text-align:center;">حدث خطأ أثناء تحميل البيانات.</p>';
    }
}

// دالة لرسم البطاقات بناءً على الفلتر المختار
window.renderTournamentsList = function(filterSport) {
    const homeList = document.getElementById('home-tournaments-list');
    const allList = document.getElementById('all-tournaments-list');
    
    // فلترة المصفوفة
    let filteredData = globalTournaments;
    if (filterSport !== 'all') {
        filteredData = globalTournaments.filter(t => t.sport === filterSport);
    }

    let html = '';
    if (filteredData.length === 0) {
        html = '<p style="color:var(--gold-main); text-align:center; grid-column: 1 / -1;">لا توجد بطولات متاحة حالياً ضمن هذا التصنيف.</p>';
    } else {
        filteredData.forEach((data) => {
            let sportIcon = data.sport === 'بادل' ? 'fa-table-tennis' : 'fa-futbol';
            html += `
                <div class="elite-card" onclick="alert('سيتم توجيهك لصفحة تفاصيل البطولة')">
                    <div class="card-logo">
                        <img src="LOGO1.jpeg" alt="Logo">
                    </div>
                    <div class="card-content">
                        <i class="card-icon fas ${sportIcon}"></i>
                        <h3 class="card-title">${data.name}</h3>
                        <span class="card-subtitle">${data.date || 'قريباً'}</span>
                        <p style="color: var(--text-gray); font-size: 0.9rem; margin-top:8px; font-weight:bold;">المقاعد: <span style="color:var(--gold-light);">${data.available_slots} / ${data.total_slots}</span></p>
                        <div class="arrow-btn"><i class="fas fa-arrow-left"></i></div>
                    </div>
                </div>
            `;
        });
    }

    if (homeList && filterSport === 'all') homeList.innerHTML = html; // في الرئيسية نعرض الكل فقط
    if (allList) allList.innerHTML = html;
}

// دالة يتم استدعاؤها عند الضغط على (كرة القدم / البادل / البطولات)
window.filterTournaments = function(sport) {
    // تحديث البيانات
    window.renderTournamentsList(sport);
    
    // إخفاء كل الأقسام وإظهار قسم البطولات
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById('tournaments').classList.add('active');
    
    // تغيير العنوان الديناميكي
    const titleObj = document.getElementById('tournaments-title');
    if (titleObj) {
        if (sport === 'كرة قدم') titleObj.innerText = 'بطولات كرة القدم';
        else if (sport === 'بادل') titleObj.innerText = 'بطولات البادل';
        else titleObj.innerText = 'جميع البطولات';
    }
}

// ==========================================
// 2. وظائف بوابة المستخدم (بدون تخريب)
// ==========================================
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

onAuthStateChanged(auth, (user) => {
    const localUserEmail = localStorage.getItem('eliteCupUserEmail');
    if (user) {
        updateUIForUser(user.email); 
    } else if (localUserEmail) {
        updateUIForUser(localUserEmail); 
    } else {
        updateUIForUser(null); 
    }
});

window.loginUser = async function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    if (email) {
        localStorage.setItem('eliteCupUserEmail', email);
        updateUIForUser(email);
    }
}

window.logoutUser = async function() {
    try {
        localStorage.removeItem('eliteCupUserEmail');
        await signOut(auth);
        window.location.href = 'index.html'; 
    } catch (error) {
        console.error("خطأ في تسجيل الخروج: ", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadTournaments();
});