const API_URL = 'http://localhost:3000';
const TABS = document.querySelectorAll('.tab-btn');
const TAB_CONTENTS = document.querySelectorAll('.tab-content');
const LOGIN_FORM = document.getElementById('login-form');
const REGISTER_FORM = document.getElementById('register-form');
const LOGIN_MESSAGE = document.getElementById('login-message');
const REGISTER_MESSAGE = document.getElementById('register-message');

checkAuth();

TABS.forEach(tab => {
    tab.addEventListener('click', () => {
        TABS.forEach(t => t.classList.remove('active'));
        
        TAB_CONTENTS.forEach(content => {
            content.style.display = 'none';
        });
        
        tab.classList.add('active');
        
        const tabId = tab.getAttribute('data-tab');
        document.getElementById(tabId).style.display = 'block';
        
        clearMessages();
    });
});

LOGIN_FORM.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    if (!username || !password) {
        showMessage(LOGIN_MESSAGE, 'Пожалуйста, заполните все поля', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            showMessage(LOGIN_MESSAGE, data.error || 'Ошибка входа', 'error');
            return;
        }
        
        if (data.theme) {
            localStorage.setItem('theme', data.theme);
        }
        
        window.location.href = '/profile.html';
    } catch (error) {
        showMessage(LOGIN_MESSAGE, 'Ошибка соединения с сервером', 'error');
    }
});

REGISTER_FORM.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    
    if (!username || !password || !confirmPassword) {
        showMessage(REGISTER_MESSAGE, 'Пожалуйста, заполните все поля', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage(REGISTER_MESSAGE, 'Пароли не совпадают', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            showMessage(REGISTER_MESSAGE, data.error || 'Ошибка регистрации', 'error');
            return;
        }
        
        showMessage(REGISTER_MESSAGE, 'Регистрация успешна! Теперь вы можете войти.', 'success');
        setTimeout(() => {
            document.querySelector('[data-tab="login"]').click();
        }, 2000);
    } catch (error) {
        showMessage(REGISTER_MESSAGE, 'Ошибка соединения с сервером', 'error');
    }
});

function showMessage(element, message, type) {
    element.textContent = message;
    element.className = 'message';
    element.classList.add(type);
}

function clearMessages() {
    LOGIN_MESSAGE.textContent = '';
    LOGIN_MESSAGE.className = 'message';
    REGISTER_MESSAGE.textContent = '';
    REGISTER_MESSAGE.className = 'message';
}

async function checkAuth() {
    try {
        const response = await fetch(`${API_URL}/profile`, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            window.location.href = '/profile.html';
        }
    } catch (error) {
    }
} 