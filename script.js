// 1. تهيئة Firebase - استبدل هذه القيم بمعلومات مشروعك
const firebaseConfig = {
  apiKey: "AIzaSyAubMRprii8FUwsXn9CARgsi7pe9L5zP0o",
  authDomain: "falcon-life.firebaseapp.com",
  projectId: "falcon-life",
  storageBucket: "falcon-life.firebasestorage.app",
  messagingSenderId: "243135246365",
  appId: "1:243135246365:web:50f367881e0842656d16f4" 
};

// 2. تشغيل Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 3. بيانات الدخول للمسؤول
const ADMIN = {
  username: "admin",
  password: "admin123" // غيرها لشيء أكثر أماناً
};

// 4. دوال إدارة الهويات
async function createIdentity() {
  // جمع البيانات من النموذج
  const identity = {
    name: document.getElementById('name').value,
    age: document.getElementById('age').value,
    job: document.getElementById('job').value,
    dob: document.getElementById('dob').value,
    country: document.getElementById('country').value,
    discordId: document.getElementById('discordId').value,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  // إرسال البيانات لـ Firebase
  await db.collection("identities").add(identity);
  alert("تم إنشاء الهوية بنجاح!");
  window.location.href = "identities.html";
}

// 5. عرض الهويات
async function loadIdentities() {
  const container = document.getElementById("identitiesContainer");
  const snapshot = await db.collection("identities").get();
  
  snapshot.forEach(doc => {
    const identity = doc.data();
    container.innerHTML += `
      <div class="identity-card">
        <h3>${identity.name}</h3>
        <p>العمر: ${identity.age}</p>
        <p>الوظيفة: ${identity.job}</p>
        <p>البلد: ${identity.country}</p>
      </div>
    `;
  });
}

// 6. تسجيل دخول المسؤول
function adminLogin() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === ADMIN.username && password === ADMIN.password) {
    localStorage.setItem("isAdmin", "true");
    window.location.href = "admin-panel.html";
  } else {
    alert("بيانات الدخول غير صحيحة!");
  }
}

// 7. عند تحميل الصفحة
window.onload = function() {
  if (document.getElementById("identitiesContainer")) {
    loadIdentities();
  }
};
// وظيفة إنشاء هوية جديدة - التعديل هنا فقط
function createIdentity() {
    const name = document.getElementById('name').value.trim();
    const age = document.getElementById('age').value.trim();
    const job = document.getElementById('job').value.trim();
    const dob = document.getElementById('dob').value.trim();
    const country = document.getElementById('country').value;
    const discordId = document.getElementById('discordId').value.trim();
    
    if (!name || !age || !job || !dob || !country || !discordId) {
        alert('يرجى ملء جميع الحقول المطلوبة');
        return;
    }
    
    const userIdentities = identitiesDB.filter(id => id.userId === (currentUser?.id || 'guest'));
    if (userIdentities.length >= 2) {
        alert('لقد وصلت إلى الحد الأقصى لإنشاء الهويات (2 هويات)');
        return;
    }
    
    const newIdentity = {
        id: Date.now().toString(),
        userId: currentUser?.id || 'guest',
        name,
        age,
        job,
        dob,
        country,
        discordId,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    identitiesDB.push(newIdentity);
    localStorage.setItem('sharedDB', JSON.stringify(identitiesDB));
    
    sendIdentityNotification(newIdentity);
    document.getElementById('identityForm').reset();
    alert('تم إرسال طلب الهوية بنجاح، سيتم مراجعته من قبل المسؤولين');
    window.location.href = 'identities.html';
}

// وظيفة إرسال إشعار الهوية
function sendIdentityNotification(identity) {
    console.log('إرسال إشعار الهوية إلى المسؤولين:', identity);
}

// وظيفة تحميل الهويات للمستخدم العادي
function loadIdentities() {
    const container = document.getElementById('identitiesContainer');
    if (!container) return;
    
    const acceptedIdentities = identitiesDB.filter(id => id.status === 'accepted');
    
    if (acceptedIdentities.length === 0) {
        container.innerHTML = '<p>لا توجد هويات متاحة حالياً</p>';
        return;
    }
    
    container.innerHTML = '';
    acceptedIdentities.forEach(identity => {
        const card = createIdentityCard(identity);
        container.appendChild(card);
    });
}

// وظيفة تحديث عدد الهويات المتبقية
function updateRemainingIdentities() {
    const element = document.getElementById('remainingIdentities');
    if (!element) return;
    
    const userIdentities = identitiesDB.filter(id => id.userId === (currentUser?.id || 'guest'));
    const remaining = 2 - userIdentities.length;
    element.textContent = remaining > 0 ? remaining : 0;
}

// وظيفة إنشاء بطاقة هوية
function createIdentityCard(identity) {
    const card = document.createElement('div');
    card.className = 'identity-card';
    
    const statusClass = identity.status === 'accepted' ? 'accepted' : 
                       identity.status === 'rejected' ? 'rejected' : 'pending';
    
    card.innerHTML = `
        <h3>${identity.name}</h3>
        <p><strong>العمر:</strong> ${identity.age}</p>
        <p><strong>الوظيفة:</strong> ${identity.job}</p>
        <p><strong>تاريخ الميلاد:</strong> ${identity.dob}</p>
        <p><strong>البلد:</strong> ${identity.country}</p>
        <p><strong>Discord ID:</strong> ${identity.discordId}</p>
        <span class="status ${statusClass}">${getStatusText(identity.status)}</span>
    `;
    
    return card;
}

// وظيفة تحويل حالة الهوية إلى نص
function getStatusText(status) {
    switch(status) {
        case 'accepted': return 'مقبولة';
        case 'rejected': return 'مرفوضة';
        case 'pending': return 'قيد المراجعة';
        default: return status;
    }
}

// وظيفة تسجيل دخول المسؤولين
function adminLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        currentUser = { id: 'admin', isAdmin: true };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        window.location.href = 'admin-panel.html';
    } else {
        alert('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
}

// وظيفة تسجيل خروج المسؤولين
function adminLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// وظيفة تحميل الهويات للمسؤولين - التعديل هنا
function loadAdminIdentities() {
    const acceptedIdentities = identitiesDB.filter(id => id.status === 'accepted');
    const pendingIdentities = identitiesDB.filter(id => id.status === 'pending');
    const rejectedIdentities = identitiesDB.filter(id => id.status === 'rejected');
    
    // تحميل الهويات المقبولة
    const acceptedContainer = document.getElementById('acceptedIdentities');
    acceptedContainer.innerHTML = '';
    if (acceptedIdentities.length === 0) {
        acceptedContainer.innerHTML = '<p>لا توجد هويات مقبولة</p>';
    } else {
        acceptedIdentities.forEach(identity => {
            const card = createAdminIdentityCard(identity);
            acceptedContainer.appendChild(card);
        });
    }
    
    // تحميل الهويات المعلقة
    const pendingContainer = document.getElementById('pendingIdentities');
    pendingContainer.innerHTML = '';
    if (pendingIdentities.length === 0) {
        pendingContainer.innerHTML = '<p>لا توجد هويات قيد المراجعة</p>';
    } else {
        pendingIdentities.forEach(identity => {
            const card = createAdminIdentityCard(identity);
            pendingContainer.appendChild(card);
        });
    }
    
    // تحميل الهويات المرفوضة
    const rejectedContainer = document.getElementById('rejectedIdentities');
    rejectedContainer.innerHTML = '';
    if (rejectedIdentities.length === 0) {
        rejectedContainer.innerHTML = '<p>لا توجد هويات مرفوضة</p>';
    } else {
        rejectedIdentities.forEach(identity => {
            const card = createAdminIdentityCard(identity);
            rejectedContainer.appendChild(card);
        });
    }
}

// وظيفة إنشاء بطاقة هوية للمسؤولين
function createAdminIdentityCard(identity) {
    const card = document.createElement('div');
    card.className = 'identity-card';
    
    const statusClass = identity.status === 'accepted' ? 'accepted' : 
                       identity.status === 'rejected' ? 'rejected' : 'pending';
    
    card.innerHTML = `
        <h3>${identity.name}</h3>
        <p><strong>العمر:</strong> ${identity.age}</p>
        <p><strong>الوظيفة:</strong> ${identity.job}</p>
        <p><strong>تاريخ الميلاد:</strong> ${identity.dob}</p>
        <p><strong>البلد:</strong> ${identity.country}</p>
        <p><strong>Discord ID:</strong> ${identity.discordId}</p>
        <p><strong>تاريخ الإنشاء:</strong> ${new Date(identity.createdAt).toLocaleString()}</p>
        <span class="status ${statusClass}">${getStatusText(identity.status)}</span>
        <div class="identity-actions" data-id="${identity.id}">
            ${identity.status !== 'accepted' ? '<button class="accept-btn">قبول</button>' : ''}
            ${identity.status !== 'rejected' ? '<button class="reject-btn">رفض</button>' : ''}
            <button class="delete-btn">حذف</button>
            ${identity.status === 'accepted' ? 
              '<button class="suspend-btn">إيقاف الخدمات</button>' : 
              identity.status === 'pending' ? 
              '<button class="restore-btn">استعادة</button>' : ''}
        </div>
    `;
    
    return card;
}

// وظيفة تغيير حالة الهوية - التعديل هنا
function changeIdentityStatus(id, status) {
    const identityIndex = identitiesDB.findIndex(identity => identity.id === id);
    if (identityIndex === -1) return;
    
    identitiesDB[identityIndex].status = status;
    localStorage.setItem('sharedDB', JSON.stringify(identitiesDB));
    
    // إعادة تحميل جميع الهويات
    loadAdminIdentities();
    
    alert(`تم تغيير حالة الهوية إلى "${getStatusText(status)}" بنجاح`);
}

// وظيفة حذف الهوية - التعديل هنا
function deleteIdentity(id) {
    if (!confirm('هل أنت متأكد من حذف هذه الهوية؟ لا يمكن التراجع عن هذا الإجراء.')) {
        return;
    }
    
    identitiesDB = identitiesDB.filter(identity => identity.id !== id);
    localStorage.setItem('sharedDB', JSON.stringify(identitiesDB));
    
    // إعادة تحميل جميع الهويات
    loadAdminIdentities();
    
    alert('تم حذف الهوية بنجاح');
}

// وظيفة تبديل التبويبات
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        }
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        if (content.id === tabId + '-tab') {
            content.classList.add('active');
        }
    });
}

// أحداث النقر على الأزرار في لوحة المسؤولين
document.addEventListener('click', function(e) {
    const actionsDiv = e.target.closest('.identity-actions');
    if (!actionsDiv) return;
    
    const id = actionsDiv.getAttribute('data-id');
    
    if (e.target.classList.contains('accept-btn')) {
        changeIdentityStatus(id, 'accepted');
    }
    
    if (e.target.classList.contains('reject-btn')) {
        changeIdentityStatus(id, 'rejected');
    }
    
    if (e.target.classList.contains('delete-btn')) {
        deleteIdentity(id);
    }
    
    if (e.target.classList.contains('suspend-btn')) {
        changeIdentityStatus(id, 'pending');
    }
    
    if (e.target.classList.contains('restore-btn')) {
        changeIdentityStatus(id, 'accepted');
    }
});

// حماية الصفحات الإدارية
function protectAdminPages() {
    const isAdminPage = window.location.pathname.includes('admin');
    
    if (isAdminPage && (!currentUser || !currentUser.isAdmin)) {
        window.location.href = 'admin-login.html';
    }
}

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    protectAdminPages();
    
    if (currentUser?.isAdmin) {
        document.querySelectorAll('.admin-link').forEach(link => {
            link.textContent = 'لوحة المسؤولين';
            link.href = 'admin-panel.html';
        });
    }
    
    if (document.getElementById('identitiesContainer')) {
        loadIdentities();
        updateRemainingIdentities();
    }
    
    if (document.querySelector('.tab-btn.active')) {
        const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
        loadAdminIdentities();
    }
});
