// --- VARIABLES GLOBALES ---
let captchaAnswer;
let isLoginMode = true;
let currentType = 'fabric';

// --- 1. INICIALIZACIÓN Y CARGA ---
window.addEventListener('load', () => {
    generateCaptcha();
    // Simulación de carga profesional
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        preloader.classList.add('animate__animated', 'animate__fadeOut');
        setTimeout(() => {
            preloader.style.display = 'none';
            checkAuth();
        }, 500);
    }, 1500);
});

// --- 2. SISTEMA DE NOTIFICACIONES (TOASTS) ---
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast animate__animated animate__fadeInRight`;
    
    // Color según tipo
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle';
    toast.style.borderLeft = `5px solid ${type === 'success' ? '#2ed573' : '#ff4757'}`;
    
    toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    container.appendChild(toast);

    // Auto-eliminar
    setTimeout(() => {
        toast.classList.replace('animate__fadeInRight', 'animate__fadeOutRight');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// --- 3. SISTEMA DE CAPTCHA ---
function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    captchaAnswer = num1 + num2;
    const questionEl = document.getElementById('captcha-question');
    if(questionEl) questionEl.innerText = `${num1} + ${num2}`;
}

// --- 4. AUTENTICACIÓN (LOGIN / REGISTRO) ---
function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? "Identificación" : "Nueva Cuenta";
    document.getElementById('btn-text').innerText = isLoginMode ? "Verificar y Entrar" : "Crear Mi Cuenta";
    document.getElementById('auth-toggle').innerText = isLoginMode ? "¿No tienes acceso? Crea una cuenta aquí" : "¿Ya tienes cuenta? Inicia sesión";
    generateCaptcha(); // Reset captcha al cambiar
}

function handleAuth() {
    const user = document.getElementById('user').value.trim();
    const pass = document.getElementById('pass').value.trim();
    const captchaInput = parseInt(document.getElementById('captcha-input').value);

    if (!user || !pass) {
        showToast("Por favor, rellena todos los campos", "error");
        return;
    }

    if (captchaInput !== captchaAnswer) {
        showToast("Captcha incorrecto. Inténtalo de nuevo.", "error");
        generateCaptcha();
        document.getElementById('captcha-input').value = "";
        return;
    }

    let users = JSON.parse(localStorage.getItem('modpack_users')) || {};

    if (isLoginMode) {
        if (users[user] && users[user] === pass) {
            localStorage.setItem('currentUser', user);
            showToast(`¡Bienvenido de nuevo, ${user}!`, "success");
            checkAuth();
        } else {
            showToast("Usuario o contraseña incorrectos", "error");
        }
    } else {
        if (users[user]) {
            showToast("Este nombre de usuario ya está pillado", "error");
        } else {
            users[user] = pass;
            localStorage.setItem('modpack_users', JSON.stringify(users));
            showToast("Cuenta creada con éxito. ¡Ya puedes entrar!", "success");
            toggleAuthMode();
        }
    }
}

function checkAuth() {
    const loggedUser = localStorage.getItem('currentUser');
    if (loggedUser) {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        document.getElementById('user-display').innerText = loggedUser;
        renderFileList();
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    location.reload();
}

// --- 5. GESTIÓN DE PÁGINAS ---
function showPage(type) {
    currentType = type;
    const wrapper = document.getElementById('content-wrapper');
    const soon = document.getElementById('coming-soon');
    const title = document.getElementById('page-title');
    
    // Actualizar UI
    title.innerHTML = `<i class="fas fa-folder-open"></i> Gestor ${type.toUpperCase()}`;
    
    if (type !== 'fabric') {
        wrapper.style.display = 'none';
        soon.style.display = 'block';
    } else {
        wrapper.style.display = 'block';
        soon.style.display = 'none';
        renderFileList();
    }
}

// --- 6. SUBIDA Y DESCARGA DE ARCHIVOS ---
function updateFileLabel() {
    const input = document.getElementById('modFile');
    const label = document.getElementById('file-label');
    if (input.files.length > 0) {
        label.innerHTML = `Listo para subir: <b style="color:var(--primary)">${input.files[0].name}</b>`;
    }
}

function handleUpload() {
    const input = document.getElementById('modFile');
    const file = input.files[0];

    if (!file) {
        showToast("Selecciona un archivo .zip primero", "error");
        return;
    }

    if (!file.name.endsWith('.zip')) {
        showToast("Solo se permiten archivos comprimidos (.zip)", "error");
        return;
    }

    const reader = new FileReader();
    showToast("Procesando modpack...", "success");

    reader.onload = (e) => {
        try {
            const newFile = {
                name: file.name,
                content: e.target.result,
                date: new Date().toLocaleDateString(),
                owner: localStorage.getItem('currentUser')
            };

            let files = JSON.parse(localStorage.getItem(`mods_${currentType}`)) || [];
            files.push(newFile);
            localStorage.setItem(`mods_${currentType}`, JSON.stringify(files));
            
            showToast("¡Modpack subido correctamente!", "success");
            input.value = "";
            document.getElementById('file-label').innerHTML = "Suelte el archivo modpack <b>.zip</b> aquí";
            renderFileList();
        } catch (err) {
            showToast("Error: El archivo es demasiado pesado para el navegador.", "error");
        }
    };
    reader.readAsDataURL(file);
}

function renderFileList() {
    const listElement = document.getElementById('file-list');
    listElement.innerHTML = "";
    let files = JSON.parse(localStorage.getItem(`mods_${currentType}`)) || [];

    if (files.length === 0) {
        listElement.innerHTML = `<p style="opacity:0.5; margin-top:20px;">No hay archivos en esta categoría.</p>`;
        return;
    }

    files.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = "file-item animate__animated animate__fadeInUp";
        item.style.animationDelay = `${index * 0.1}s`;
        
        item.innerHTML = `
            <div>
                <i class="fas fa-file-zipper" style="color:#f1c40f; margin-right:10px;"></i>
                <strong>${file.name}</strong>
                <small style="display:block; font-size:10px; opacity:0.6;">Por: ${file.owner} - ${file.date}</small>
            </div>
            <div>
                <a href="${file.content}" download="${file.name}" style="color:var(--primary); font-size:1.2rem; margin-right:15px;">
                    <i class="fas fa-cloud-arrow-down"></i>
                </a>
                <i class="fas fa-trash btn-delete-icon" onclick="deleteFile(${index})" style="color:#ff4757; cursor:pointer;"></i>
            </div>
        `;
        listElement.appendChild(item);
    });
}

function deleteFile(index) {
    if (confirm("¿Seguro que quieres borrar este modpack?")) {
        let files = JSON.parse(localStorage.getItem(`mods_${currentType}`)) || [];
        files.splice(index, 1);
        localStorage.setItem(`mods_${currentType}`, JSON.stringify(files));
        showToast("Archivo eliminado", "success");
        renderFileList();
    }
}
