const API_URL = 'http://localhost:3000';
const USERNAME_ELEMENT = document.getElementById('username');
const LOGOUT_BTN = document.getElementById('logout-btn');
const THEME_TOGGLE = document.getElementById('theme-toggle');
const REFRESH_DATA_BTN = document.getElementById('refresh-data');
const DATA_DISPLAY = document.getElementById('data-display');
const DATA_SOURCE = document.getElementById('data-source');
const DATA_TIME = document.getElementById('data-time');

document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    
    applyTheme();
});

LOGOUT_BTN.addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_URL}/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        window.location.href = '/index.html';
    } catch (error) {
        console.error('Ошибка при выходе:', error);
        window.location.href = '/index.html';
    }
});

THEME_TOGGLE.addEventListener('click', () => {
    const currentTheme = localStorage.getItem('theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    localStorage.setItem('theme', newTheme);
    
    applyTheme();
    
    updateThemeOnServer(newTheme);
});

REFRESH_DATA_BTN.addEventListener('click', () => {
    loadData();
});

async function loadProfile() {
    try {
        const response = await fetch(`${API_URL}/profile`, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (!response.ok) {
            window.location.href = '/index.html';
            return;
        }
        
        const data = await response.json();
        
        USERNAME_ELEMENT.textContent = data.username;
        
        if (data.theme) {
            localStorage.setItem('theme', data.theme);
            applyTheme();
        }
        
        loadData();
    } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        window.location.href = '/index.html';
    }
}

async function loadData() {
    try {
        DATA_DISPLAY.innerHTML = '<p>Загрузка данных...</p>';
        
        const response = await fetch(`${API_URL}/data`, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (!response.ok) {
            DATA_DISPLAY.innerHTML = '<p>Ошибка загрузки данных</p>';
            return;
        }
        
        const result = await response.json();
        const data = result.data;
        
        DATA_DISPLAY.innerHTML = `
            <p>Случайное число: ${data.randomNumber}</p>
            <p>Сообщение: ${data.message}</p>
        `;
        
        DATA_SOURCE.textContent = `Источник: ${result.source === 'cache' ? 'Кэш' : 'Сервер'}`;
        DATA_TIME.textContent = `Время: ${new Date(data.timestamp).toLocaleString()}`;
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        DATA_DISPLAY.innerHTML = '<p>Ошибка соединения с сервером</p>';
    }
}

function applyTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        THEME_TOGGLE.textContent = 'Светлая тема';
    } else {
        document.body.classList.remove('dark-theme');
        THEME_TOGGLE.textContent = 'Темная тема';
    }
}

async function updateThemeOnServer(theme) {
    try {
        await fetch(`${API_URL}/theme`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ theme }),
            credentials: 'include'
        });
    } catch (error) {
        console.error('Ошибка обновления темы на сервере:', error);
    }
} 