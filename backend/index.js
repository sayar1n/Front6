const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;


app.use(cors({
  origin: 'http://localhost:5500',
  credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  secret: 'secret-key-should-be-in-env',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

const users = {};

const cacheDir = path.join(__dirname, 'cache');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

function checkCache(req, res, next) {
  const cacheFile = path.join(cacheDir, 'data-cache.json');
  
  if (fs.existsSync(cacheFile)) {
    const fileStats = fs.statSync(cacheFile);
    const now = new Date();
    const fileAge = (now - fileStats.mtime) / 1000;
    
    if (fileAge < 60) {
      const cacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      return res.json({ data: cacheData, source: 'cache' });
    }
  }
  
  next();
}

function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ error: 'Не авторизован' });
}

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Логин и пароль обязательны' });
  }
  
  if (users[username]) {
    return res.status(400).json({ error: 'Пользователь уже существует' });
  }
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    users[username] = {
      password: hashedPassword,
      theme: 'light'
    };
    
    res.status(201).json({ message: 'Регистрация успешна' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Логин и пароль обязательны' });
  }
  
  const user = users[username];
  if (!user) {
    return res.status(401).json({ error: 'Неверные учетные данные' });
  }
  
  try {
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }
    
    req.session.userId = username;
    res.json({ message: 'Вход выполнен успешно', theme: user.theme });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/profile', isAuthenticated, (req, res) => {
  const user = users[req.session.userId];
  res.json({
    username: req.session.userId,
    theme: user.theme
  });
});

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Не удалось выйти из системы' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Выход выполнен успешно' });
  });
});

app.get('/data', checkCache, (req, res) => {
  const data = {
    timestamp: new Date().toISOString(),
    randomNumber: Math.floor(Math.random() * 1000),
    message: 'Это новые данные с сервера'
  };
  
  const cacheFile = path.join(cacheDir, 'data-cache.json');
  fs.writeFileSync(cacheFile, JSON.stringify(data));
  
  res.json({ data, source: 'server' });
});

app.post('/theme', isAuthenticated, (req, res) => {
  const { theme } = req.body;
  
  if (theme !== 'light' && theme !== 'dark') {
    return res.status(400).json({ error: 'Недопустимая тема' });
  }
  
  const user = users[req.session.userId];
  user.theme = theme;
  
  res.json({ message: 'Тема обновлена' });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
}); 