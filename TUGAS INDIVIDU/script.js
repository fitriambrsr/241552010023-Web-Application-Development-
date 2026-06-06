// ==========================================================================
// 1. LOGIKA REGISTRASI (Untuk Halaman register.html)
// ==========================================================================
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const emailError = document.getElementById('emailError');

        if (emailError) emailError.style.display = 'none';

        let users = JSON.parse(localStorage.getItem('users')) || [];
        const isEmailExist = users.some(user => user.email.toLowerCase() === email.toLowerCase());
        
        if (isEmailExist) {
            if (emailError) emailError.style.display = 'block';
            return;
        }

        users.push({ name, email, password });
        localStorage.setItem('users', JSON.stringify(users));

        window.location.href = 'success.html';
    });
}

// ==========================================================================
// 2. LOGIKA LOGIN (Untuk Halaman login.html)
// ==========================================================================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const globalError = document.getElementById('globalError');

        if (globalError) globalError.style.display = 'none';

        let users = JSON.parse(localStorage.getItem('users')) || [];
        const validUser = users.find(user => user.email.toLowerCase() === email.toLowerCase() && user.password === password);

        if (validUser) {
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('activeUser', validUser.name);
            
            alert('Login Berhasil! Selamat datang, ' + validUser.name);
            window.location.href = 'dashboard.html'; 
        } else {
            if (globalError) globalError.style.display = 'block';
        }
    });
}

// ==========================================================================
// 3. LOGIKA SHOW / HIDE PASSWORD (IKON MATA) - Berlaku di Kedua Halaman
// ==========================================================================
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        if (type === 'text') {
            this.classList.remove('fa-eye');
            this.classList.add('fa-eye-slash');
        } else {
            this.classList.remove('fa-eye-slash');
            this.classList.add('fa-eye');
        }
    });
}

// ==========================================================================
// 4. LOGIKA HALAMAN DASHBOARD (Fitur Utama, Filter Tab, & Komponen Baru)
// ==========================================================================
const usernameDisplay = document.getElementById('usernameDisplay');
const logoutBtn = document.getElementById('logoutBtn');
const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const noTaskMsg = document.getElementById('noTaskMsg');

// Elemen input form detail tugas
const taskTitle = document.getElementById('taskTitle');
const taskDate = document.getElementById('taskDate');
const taskGiver = document.getElementById('taskGiver');
const taskDeadline = document.getElementById('taskDeadline');
const taskDesc = document.getElementById('taskDesc');

// Variabel penampung data internal global browser
let tasks = [];
let taskKey = "";
let editModeIndex = null;
let currentFilter = "all"; 

// --- DYNAMIC UTILITY COMPONENT: POPUP NOTIFIKASI TOAST ---
// ==========================================================================
// --- DYNAMIC UTILITY COMPONENT: POPUP NOTIFIKASI TOAST (DI TENGAH ATAS) ---
// ==========================================================================
function showToastNotification(message, type = "success") {
    // Buat wadah toast jika belum eksis di halaman dashboard
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        
        // PERBAIKAN: Mengubah posisi wadah utama ke top: 20px dan left: 50% agar pas di tengah atas
        container.style.cssText = `
            position: fixed; 
            top: 20px; 
            left: 50%; 
            transform: translateX(-50%); 
            z-index: 9999; 
            display: flex; 
            flex-direction: column; 
            gap: 10px; 
            align-items: center;
        `;
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    const bgIcon = type === "success" ? "#2ecc71" : type === "danger" ? "#e53e3e" : "#3182ce";
    
    // PERBAIKAN: Mengubah animasi transisi muncul dari atas (translateY(-20px))
    toast.style.cssText = `
        background: ${bgIcon}; 
        color: white; 
        padding: 12px 24px; 
        border-radius: 8px; 
        font-size: 14px; 
        font-weight: 600; 
        box-shadow: 0 4px 15px rgba(0,0,0,0.15); 
        opacity: 0; 
        transform: translateY(-20px); 
        transition: all 0.3s ease; 
        display: flex; 
        align-items: center; 
        gap: 8px;
        white-space: nowrap;
    `;
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i> <span>${message}</span>`;
    
    container.appendChild(toast);
    
    // Animasi Masuk: Muncul turun sedikit dan memudar jelas
    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
    }, 50);
    
    // Animasi Keluar: Naik kembali ke atas setelah 3 detik lalu menghilang
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-20px)";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- DYNAMIC UTILITY COMPONENT: TASK COUNTER & PROGRESS BAR ---
function createProgressBarElements() {
    // Memasukkan progress bar secara otomatis di atas tab-navigation jika belum ada
    const listSection = document.querySelector('.task-list-section');
    if (listSection && !document.getElementById('progress-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.id = 'progress-wrapper';
        wrapper.style.cssText = "margin-bottom:20px; background:#fff; padding:15px; border-radius:10px; border:1px solid #e2e8f0;";
        
        wrapper.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:14px; font-weight:600; color:#4a5568;">
                <span id="progress-text">0 dari 0 tugas selesai — 0%</span>
            </div>
            <div style="width:100%; height:10px; background:#edf2f7; border-radius:5px; overflow:hidden;">
                <div id="progress-fill" style="width:0%; height:100%; background:linear-gradient(90deg, #319795, #3182ce); transition:width 0.4s ease-out; border-radius:5px;"></div>
            </div>
        `;
        listSection.insertBefore(wrapper, listSection.firstChild);
    }
}

function updateProgressBar() {
    const textEl = document.getElementById('progress-text');
    const fillEl = document.getElementById('progress-fill');
    if (!textEl || !fillEl) return;
    
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    textEl.textContent = `${completed} dari ${total} tugas selesai — ${percentage}%`;
    fillEl.style.width = `${percentage}%`;
}

// --- INISIALISASI UTAMA HALAMAN DASHBOARD ---
if (usernameDisplay) {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const activeUser = sessionStorage.getItem('activeUser');

    if (isLoggedIn !== 'true' || !activeUser) {
        alert('Akses ditolak! Silakan login terlebih dahulu.');
        window.location.href = 'login.html';
    } else {
        usernameDisplay.textContent = activeUser;
    }

    taskKey = `tasks_${activeUser}`;
    tasks = JSON.parse(localStorage.getItem(taskKey)) || [];

    // Tampilkan komponen indikator progress tugas di dashboard
    createProgressBarElements();

    // Fungsi Internal Render List Item Tugas Aktif
    function renderTasks() {
        if (!taskList) return;
        taskList.innerHTML = '';
        
        // Update kalkulasi progress bar berkala
        updateProgressBar();
        
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === "pending") return !task.completed;
            if (currentFilter === "completed") return task.completed;
            return true;
        });

        if (filteredTasks.length === 0) {
            if (noTaskMsg) noTaskMsg.style.display = 'block';
        } else {
            if (noTaskMsg) noTaskMsg.style.display = 'none';
            
            filteredTasks.forEach((task) => {
                const originalIndex = tasks.findIndex(t => t === task);

                const li = document.createElement('li');
                li.className = `task-item ${task.completed ? 'is-completed' : ''}`;
                li.innerHTML = `
                    <div class="task-left-content">
                        <input type="checkbox" class="task-checkbox" 
                               ${task.completed ? 'checked' : ''} 
                               onclick="toggleTaskStatus(${originalIndex})">
                        <span class="title-text">${task.title}</span>
                    </div>
                    <div class="task-actions">
                        <button class="btn-action btn-edit" onclick="editTask(${originalIndex})" title="Edit Tugas">
                            <i class="fa-solid fa-pencil"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteTask(${originalIndex})" title="Hapus Tugas">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                `;
                taskList.appendChild(li);
            });
        }
    }

    // Mengatur Event Handler Klik pada Tombol Tab Navigation Filter
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            currentFilter = this.getAttribute('data-filter');
            renderTasks();
        });
    });

    // Form Submit (Tambah Baru / Simpan Perubahan Objek)
    if (taskForm) {
        taskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const taskData = {
                title: taskTitle.value.trim(),
                date: taskDate.value,
                giver: taskGiver.value.trim(),
                deadline: taskDeadline.value,
                desc: taskDesc.value.trim(),
                completed: editModeIndex !== null ? tasks[editModeIndex].completed : false
            };

            const submitBtn = taskForm.querySelector('.btn-add-task');

            if (editModeIndex !== null) {
                // Eksekusi Simpan Perubahan Data (Edit)
                tasks[editModeIndex] = taskData;
                editModeIndex = null;
                if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-square-plus"></i> Tambah Tugas';
                showToastNotification("Tugas berhasil diperbarui!", "info");
            } else {
                // Eksekusi Tambah Data Baru
                tasks.push(taskData);
                showToastNotification("Tugas baru berhasil ditambahkan!", "success");
            }

            localStorage.setItem(taskKey, JSON.stringify(tasks));
            taskForm.reset();
            renderTasks();
        });
    }

    // Tombol Logout Sesi Keamanan
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Apakah Anda ingin keluar dari sistem?')) {
                sessionStorage.clear();
                window.location.href = 'login.html';
            }
        });
    }

    // Ekspos fungsi render internal ke objek window global
    window.refreshDashboardView = function() {
        renderTasks();
    };

    // Render tampilan perdana saat dashboard dibuka
    renderTasks();
}

// ==========================================================================
// GLOBALLY ACCESSIBLE FUNCTIONS (Dipanggil langsung dari atribut HTML)
// ==========================================================================

// Fungsi 1: Mengubah Status Penyelesaian Tugas (Berhadiah Animasi Konfeti)
window.toggleTaskStatus = function(index) {
    if (index === undefined || !tasks[index]) return;
    
    // Balik status kelayakan tugas
    tasks[index].completed = !tasks[index].completed;
    localStorage.setItem(taskKey, JSON.stringify(tasks));
    
    // UX REWARD: Jika dicentang menjadi TRUE, luncurkan efek animasi konfeti semburan ganda
    if (tasks[index].completed && typeof confetti === "function") {
        confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.8 }
        });
    }
    
    if (typeof refreshDashboardView === "function") {
        refreshDashboardView();
    }
};

// Fungsi 2: Memuat Ulang Data Tugas ke Form Pengisian (Mode Perubahan Data)
window.editTask = function(index) {
    if (index === undefined || !tasks[index]) return;
    const selectedTask = tasks[index];
    
    taskTitle.value = selectedTask.title;
    taskDate.value = selectedTask.date;
    taskGiver.value = selectedTask.giver;
    taskDeadline.value = selectedTask.deadline;
    taskDesc.value = selectedTask.desc;
    
    editModeIndex = index;
    const submitBtn = document.querySelector('#taskForm .btn-add-task');
    if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Simpan Perubahan';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Fungsi 3: Menghapus Data Tugas dari LocalStorage secara Permanen
window.deleteTask = function(index) {
    if (index === undefined || !tasks) return;
    
    if (confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
        tasks.splice(index, 1);
        localStorage.setItem(taskKey, JSON.stringify(tasks));
        
        // Reset form input jika kebetulan data yang sedang aktif diedit dihapus paksa
        if (editModeIndex === index) {
            editModeIndex = null;
            if (taskForm) taskForm.reset();
            const submitBtn = document.querySelector('#taskForm .btn-add-task');
            if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-square-plus"></i> Tambah Tugas';
        }
        
        // Picu pembaruan UI dashboard dan munculkan popup hapus
        if (typeof refreshDashboardView === "function") {
            refreshDashboardView();
        }
        showToastNotification("Tugas telah berhasil dihapus.", "danger");
    }
};