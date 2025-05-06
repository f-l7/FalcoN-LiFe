// بيانات المسؤولين (يجب تغييرها في الإنتاج)
const ADMIN_CREDENTIALS = {
    username: "admin",
    password: "FalcoN@1234"
};

// محاكاة قاعدة البيانات
let identitiesDB = JSON.parse(localStorage.getItem('identitiesDB')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// وظيفة إنشاء هوية جديدة
function createIdentity() {
    const name = document.getElementById('name').value.trim();
    const age = document.getElementById('age').value.trim();
    const job = document.getElementById('job').value.trim();
    const dob = document.getElementById('dob').value.trim();
    const country = document.getElementById('country').value;
    const discordId = document.getElementById('discordId').value.trim();
    
    // التحقق من الحقول المطلوبة
    if (!name || !age || !job || !dob || !country || !discordId) {
        alert('يرجى ملء جميع الحقول المطلوبة');
        return;
    }
    
    // التحقق من عدد الهويات المسموح بها
    const userIdentities = identitiesDB.filter(id => id.userId === (currentUser?.id || 'guest'));
    if (userIdentities.length >= 2) {
        alert('لقد وصلت إلى الحد الأقصى لإنشاء الهويات (2 هويات)');
        return;
    }
    
    // إنشاء هوية جديدة
    const newIdentity = {
        id: Date.now().toString(),
        userId: currentUser?.id || 'guest',
        name,
        age,
        job,
        dob,
        country,
        discordId,
        status: 'pending', // pending, accepted, rejected
        createdAt: new Date().toISOString()
    };
    
    // إضافة الهوية إلى قاعدة البيانات
    identitiesDB.push(newIdentity);
    localStorage.setItem('identitiesDB', JSON.stringify(identitiesDB));
    
    // إرسال إشعار (في الواقع سيكون هذا إلى Webhook)
    sendIdentityNotification(newIdentity);
    
    // إعادة تعيين النموذج
    document.getElementById('identityForm').reset();
    
    // توجيه المستخدم إلى صفحة الهويات
    alert('تم إرسال طلب الهوية بنجاح، سيتم مراجعته من قبل المسؤولين');
    window.location.href = 'identities.html';
}

// وظيفة إرسال إشعار الهوية (محاكاة لإرسال إلى Discord)
function sendIdentityNotification(identity) {
    console.log('إرسال إشعار الهوية إلى المسؤولين:', identity);
    // في الواقع: هنا سيتم إرسال طلب إلى Webhook Discord
}

// وظيفة تحميل الهويات
function loadIdentities() {
    const container = document.getElementById('identitiesContainer');
    if (!container) return;
    
    // تصفية الهويات المقبولة فقط
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

// وظيفة تحميل الهويات للمسؤولين
function loadAdminIdentities(status) {
    let containerId, identities;
    
    switch(status) {
        case 'accepted':
            containerId = 'acceptedIdentities';
            identities = identitiesDB.filter(id => id.status === 'accepted');
            break;
        case 'pending':
            containerId = 'pendingIdentities';
            identities = identitiesDB.filter(id => id.status === 'pending');
            break;
        case 'rejected':
            containerId = 'rejectedIdentities';
            identities = identitiesDB.filter(id => id.status === 'rejected');
            break;
        default:
            return;
    }
    
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (identities.length === 0) {
        container.innerHTML = '<p>لا توجد هويات في هذا القسم</p>';
        return;
    }
    
    identities.forEach(identity => {
        const card = createAdminIdentityCard(identity);
        container.appendChild(card);
    });
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
        <div class="identity-actions">
            ${identity.status !== 'accepted' ? '<button class="accept-btn" data-id="' + identity.id + '">قبول</button>' : ''}
            ${identity.status !== 'rejected' ? '<button class="reject-btn" data-id="' + identity.id + '">رفض</button>' : ''}
            <button class="delete-btn" data-id="${identity.id}">حذف</button>
            ${identity.status === 'accepted' ? 
              '<button class="suspend-btn" data-id="' + identity.id + '">إيقاف الخدمات</button>' : 
              identity.status === 'pending' ? 
              '<button class="restore-btn" data-id="' + identity.id + '">استعادة</button>' : ''}
        </div>
    `;
    
    return card;
}

// وظيفة تغيير حالة الهوية
function changeIdentityStatus(id, status) {
    const identityIndex = identitiesDB.findIndex(id => id.id === id);
    if (identityIndex === -1) return;
    
    identitiesDB[identityIndex].status = status;
    localStorage.setItem('identitiesDB', JSON.stringify(identitiesDB));
    
    // إعادة تحميل الهويات
    const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
    loadAdminIdentities(activeTab);
}

// وظيفة حذف الهوية
function deleteIdentity(id) {
    if (!confirm('هل أنت متأكد من حذف هذه الهوية؟ لا يمكن التراجع عن هذا الإجراء.')) {
        return;
    }
    
    identitiesDB = identitiesDB.filter(identity => identity.id !== id);
    localStorage.setItem('identitiesDB', JSON.stringify(identitiesDB));
    
    // إعادة تحميل الهويات
    const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
    loadAdminIdentities(activeTab);
}

// وظيفة تبديل التبويبات
function switchTab(tabId) {
    // تحديث أزرار التبويب
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        }
    });
    
    // تحديث محتوى التبويب
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        if (content.id === tabId + '-tab') {
            content.classList.add('active');
        }
    });
}

// أحداث النقر على الأزرار في لوحة المسؤولين
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('accept-btn')) {
        const id = e.target.getAttribute('data-id');
        changeIdentityStatus(id, 'accepted');
    }
    
    if (e.target.classList.contains('reject-btn')) {
        const id = e.target.getAttribute('data-id');
        changeIdentityStatus(id, 'rejected');
    }
    
    if (e.target.classList.contains('delete-btn')) {
        const id = e.target.getAttribute('data-id');
        deleteIdentity(id);
    }
    
    if (e.target.classList.contains('suspend-btn')) {
        const id = e.target.getAttribute('data-id');
        changeIdentityStatus(id, 'pending');
    }
    
    if (e.target.classList.contains('restore-btn')) {
        const id = e.target.getAttribute('data-id');
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
    
    // إذا كان المستخدم مسؤولاً، قم بتحديث رابط تسجيل الدخول
    if (currentUser?.isAdmin) {
        document.querySelectorAll('.admin-link').forEach(link => {
            link.textContent = 'لوحة المسؤولين';
            link.href = 'admin-panel.html';
        });
    }
});
