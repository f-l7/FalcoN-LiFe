// بيانات المسؤولين (يجب تغييرها في الإنتاج)
const ADMIN_CREDENTIALS = {
    username: "admin",
    password: "FalcoN@1234"
};

// محاكاة قاعدة البيانات - التعديل هنا فقط
let identitiesDB = JSON.parse(localStorage.getItem('sharedDB')) || [];

// بقية الأكواد كما هي بدون تعديل
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

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
    // التعديل هنا فقط - تغيير اسم المفتاح
    localStorage.setItem('sharedDB', JSON.stringify(identitiesDB));
    
    sendIdentityNotification(newIdentity);
    document.getElementById('identityForm').reset();
    alert('تم إرسال طلب الهوية بنجاح، سيتم مراجعته من قبل المسؤولين');
    window.location.href = 'identities.html';
}

// باقي الدوال تبقى كما هي بدون تعديل
function sendIdentityNotification(identity) {
    console.log('إرسال إشعار الهوية إلى المسؤولين:', identity);
}

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

function updateRemainingIdentities() {
    const element = document.getElementById('remainingIdentities');
    if (!element) return;
    
    const userIdentities = identitiesDB.filter(id => id.userId === (currentUser?.id || 'guest'));
    const remaining = 2 - userIdentities.length;
    element.textContent = remaining > 0 ? remaining : 0;
}

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

function getStatusText(status) {
    switch(status) {
        case 'accepted': return 'مقبولة';
        case 'rejected': return 'مرفوضة';
        case 'pending': return 'قيد المراجعة';
        default: return status;
    }
}

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

function adminLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

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

function changeIdentityStatus(id, status) {
    const identityIndex = identitiesDB.findIndex(identity => identity.id === id);
    if (identityIndex === -1) return;
    
    identitiesDB[identityIndex].status = status;
    localStorage.setItem('sharedDB', JSON.stringify(identitiesDB));
    alert(`تم تغيير حالة الهوية إلى "${getStatusText(status)}" بنجاح`);
    
    const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
    loadAdminIdentities(activeTab);
}

function deleteIdentity(id) {
    if (!confirm('هل أنت متأكد من حذف هذه الهوية؟ لا يمكن التراجع عن هذا الإجراء.')) {
        return;
    }
    
    identitiesDB = identitiesDB.filter(identity => identity.id !== id);
    localStorage.setItem('sharedDB', JSON.stringify(identitiesDB));
    alert('تم حذف الهوية بنجاح');
    
    const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
    loadAdminIdentities(activeTab);
}

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

function protectAdminPages() {
    const isAdminPage = window.location.pathname.includes('admin');
    
    if (isAdminPage && (!currentUser || !currentUser.isAdmin)) {
        window.location.href = 'admin-login.html';
    }
}

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
        loadAdminIdentities(activeTab);
    }
});
