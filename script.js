// SIMULACIÓN DE PANTALLA DE CARGA
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('preloader').style.display = 'none';
        checkAuth(); // Verifica login después de cargar
    }, 1500); // 1.5 segundos de carga
});

let currentType = 'fabric';

function checkAuth() {
    if(localStorage.getItem('isLogged') === 'true') {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        renderFileList();
    } else {
        document.getElementById('login-screen').style.display = 'flex';
    }
}

function login() {
    const u = document.getElementById('user').value;
    const p = document.getElementById('pass').value;
    if(u === "admin" && p === "1234") {
        localStorage.setItem('isLogged', 'true');
        checkAuth();
    } else {
        document.getElementById('login-error').innerText = "Credenciales incorrectas";
    }
}

function logout() {
    localStorage.removeItem('isLogged');
    location.reload();
}

// CAMBIO DE PÁGINA CON LÓGICA DE "PRÓXIMAMENTE"
function showPage(type) {
    const wrapper = document.getElementById('content-wrapper');
    const soon = document.getElementById('coming-soon');
    const title = document.getElementById('page-title');
    
    currentType = type;
    title.innerText = `Modpacks: ${type.toUpperCase()}`;

    if (type === 'forge' || type === 'neoforge') {
        wrapper.style.display = 'none';
        soon.style.display = 'block';
    } else {
        wrapper.style.display = 'block';
        soon.style.display = 'none';
        document.getElementById('current-category').innerText = type.toUpperCase();
        renderFileList();
    }
}

function handleUpload() {
    const fileInput = document.getElementById('modFile');
    const file = fileInput.files[0];
    const status = document.getElementById('status');

    if (!file || !file.name.endsWith('.zip')) {
        status.innerText = "❌ Selecciona un archivo .zip válido.";
        status.style.color = "#ff4d4d";
        return;
    }

    const reader = new FileReader();
    status.innerText = "⏳ Guardando en memoria...";
    status.style.color = "#007bff";

    reader.onload = function(e) {
        const fileData = {
            name: file.name,
            content: e.target.result,
            date: new Date().toLocaleDateString()
        };

        let list = JSON.parse(localStorage.getItem(`modpacks_${currentType}`)) || [];
        list.push(fileData);
        
        try {
            localStorage.setItem(`modpacks_${currentType}`, JSON.stringify(list));
            status.innerText = "✅ ¡Archivo guardado!";
            status.style.color = "#28a745";
            renderFileList();
        } catch (err) {
            status.innerText = "❌ Error: Memoria llena (máx 5MB).";
        }
    };
    reader.readAsDataURL(file);
}

function renderFileList() {
    const listElement = document.getElementById('file-list');
    listElement.innerHTML = "";
    let list = JSON.parse(localStorage.getItem(`modpacks_${currentType}`)) || [];

    if (list.length === 0) {
        listElement.innerHTML = "<p class='fade-in' style='color: #888;'>No hay archivos en esta sección.</p>";
        return;
    }

    list.forEach((file, index) => {
        const li = document.createElement('li');
        li.className = "file-item";
        // Añadimos un pequeño retraso de animación para cada item
        li.style.animationDelay = `${index * 0.1}s`; 
        
        li.innerHTML = `
            <span>📦 ${file.name}</span>
            <div class="file-actions">
                <a href="${file.content}" download="${file.name}" class="button" style="background:#2575fc; text-decoration:none; padding: 8px 15px; border-radius: 5px;">Descargar</a>
                <button onclick="deleteFile(${index})" class="btn-delete" style="background:#ff4d4d; margin-left:10px;">Eliminar</button>
            </div>
        `;
        listElement.appendChild(li);
    });
}

function deleteFile(index) {
    let list = JSON.parse(localStorage.getItem(`modpacks_${currentType}`)) || [];
    list.splice(index, 1);
    localStorage.setItem(`modpacks_${currentType}`, JSON.stringify(list));
    renderFileList();
}