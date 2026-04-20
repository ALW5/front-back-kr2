require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:3001', credentials: true }));

const PORT = process.env.PORT || 3000;

// ==================== Файл для хранения пользователей ====================
const USERS_FILE = path.join(__dirname, 'users.json');

// Функция загрузки пользователей из файла
function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Ошибка загрузки users.json:', err);
  }
  return []; // Если файла нет, возвращаем пустой массив
}

// Функция сохранения пользователей в файл
function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.error('Ошибка сохранения users.json:', err);
  }
}

// ==================== Загрузка данных ====================
let users = loadUsers();
let products = [];
let refreshTokens = new Set();

// ==================== Секреты ====================
const ACCESS_SECRET = process.env.ACCESS_SECRET || 'access_secret_key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_secret_key';

// ==================== Время жизни токенов ====================
const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

// ==================== Роли ====================
const ROLES = {
  GUEST: 'guest',
  USER: 'user',
  SELLER: 'seller',
  ADMIN: 'admin'
};

// ==================== Инициализация товаров (мебель) ====================
products = [
  {
    id: "1",
    name: "Диван Комфорт",
    price: 45990,
    category: "Диваны",
    description: "Мягкий диван с ортопедическим матрасом",
    material: "Ткань, дерево",
    dimensions: "200x90x80 см",
    color: "Бежевый",
    stock: 5,
    imageUrl: "https://main-cdn.sbermegamarket.ru/big2/hlr-system/514/799/346/491/840/100067456008b1.jpg"
  },
  {
    id: "2",
    name: "Кровать-лофт Дрим",
    price: 38990,
    category: "Кровати",
    description: "Двухъярусная кровать из массива сосны",
    material: "Массив сосны",
    dimensions: "190x90x180 см",
    color: "Натуральное дерево",
    stock: 3,
    imageUrl: "https://www.mebhome.ru/imgup/617821_164865976778805a221a988e79ef3f42d7c5bfd418.jpg"
  },
  {
    id: "3",
    name: "Стол письменный Бюро",
    price: 12990,
    category: "Столы",
    description: "Просторный стол с ящиками",
    material: "ЛДСП, металл",
    dimensions: "120x60x75 см",
    color: "Белый/Дуб",
    stock: 8,
    imageUrl: "https://static.baza.farpost.ru/v/1737643786439_bulletin"
  },
  {
    id: "4",
    name: "Стул офисный Эрго",
    price: 8990,
    category: "Стулья",
    description: "Эргономичное кресло с поддержкой спины",
    material: "Экокожа, пластик",
    dimensions: "65x65x110 см",
    color: "Черный",
    stock: 12,
    imageUrl: "https://avatars.mds.yandex.net/i?id=20844dad857084267a03d685a99cfe3677fe733e-5746458-images-thumbs&n=13"
  },
  {
    id: "5",
    name: "Шкаф-купе Гармония",
    price: 35990,
    category: "Шкафы",
    description: "Вместительный шкаф с зеркальными дверцами",
    material: "ЛДСП, зеркало",
    dimensions: "180x60x220 см",
    color: "Венге/Дуб",
    stock: 4,
    imageUrl: "https://avatars.mds.yandex.net/i?id=e8486236f46d6036e518b8cc5240bb2077d09a9e-12475925-images-thumbs&n=13"
  },
  {
    id: "6",
    name: "Тумба прикроватная Ночка",
    price: 4990,
    category: "Тумбы",
    description: "Компактная тумбочка с ящиком",
    material: "ЛДСП",
    dimensions: "40x40x50 см",
    color: "Белый",
    stock: 15,
    imageUrl: "https://avatars.mds.yandex.net/i?id=c5308ab551c4db4db16bcd807d8738634b58d20e-5233448-images-thumbs&n=13"
  },
  {
    id: "7",
    name: "Кресло-качалка Релакс",
    price: 15990,
    category: "Кресла",
    description: "Уютное кресло для отдыха",
    material: "Ротанг, подушка",
    dimensions: "70x85x100 см",
    color: "Натуральный",
    stock: 6,
    imageUrl: "https://avatars.mds.yandex.net/i?id=4ccc4c95164c841366a1af6ab883b5b841c20132-4900962-images-thumbs&n=13"
  },
  {
    id: "8",
    name: "Стеллаж Библиотека",
    price: 18990,
    category: "Стеллажи",
    description: "Открытый стеллаж для книг",
    material: "Металл, дерево",
    dimensions: "150x30x180 см",
    color: "Черный/Дуб",
    stock: 7,
    imageUrl: "https://avatars.mds.yandex.net/i?id=d50b3347b4326ae8c0c485f1989d925003caee10-4499935-images-thumbs&n=13"
  },
  {
    id: "9",
    name: "Обеденный стол Трапеза",
    price: 21990,
    category: "Столы",
    description: "Стол для большой семьи",
    material: "Массив дуба",
    dimensions: "160x80x75 см",
    color: "Дуб",
    stock: 5,
    imageUrl: "https://avatars.mds.yandex.net/i?id=103d9a3bfddae5524a014f99b2a7e307452d3597-5427576-images-thumbs&n=13"
  },
  {
    id: "10",
    name: "Комод Минималист",
    price: 14990,
    category: "Комоды",
    description: "Современный комод с 4 ящиками",
    material: "ЛДСП",
    dimensions: "80x40x90 см",
    color: "Серый",
    stock: 9,
    imageUrl: "https://avatars.mds.yandex.net/i?id=c6dbf7689be9cf104e678ab261f62afdf65298ac-5031050-images-thumbs&n=13"
  }
];

// ==================== Вспомогательные функции ====================
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );
}

// ==================== Middleware ====================
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function roleMiddleware(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient rights' });
    }
    next();
  };
}

// ==================== Swagger ====================
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Мебель Shop API',
      version: '1.0.0',
      description: 'API для интернет-магазина мебели с авторизацией и RBAC'
    },
    servers: [{ url: `http://localhost:${PORT}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: [__filename]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ==================== МАРШРУТЫ АУТЕНТИФИКАЦИИ ====================

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - first_name
 *               - last_name
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@test.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *               first_name:
 *                 type: string
 *                 example: Иван
 *               last_name:
 *                 type: string
 *                 example: Петров
 *               role:
 *                 type: string
 *                 enum: [user, seller, admin]
 *                 default: user
 *     responses:
 *       201:
 *         description: Пользователь создан
 *       400:
 *         description: Ошибка валидации
 */
app.post('/api/auth/register', async (req, res) => {
  const { email, password, first_name, last_name, role = ROLES.USER } = req.body;
  
  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email уже существует' });
  }
  
  const hashedPassword = await hashPassword(password);
  const newUser = {
    id: nanoid(),
    email,
    first_name,
    last_name,
    passwordHash: hashedPassword,
    role: [ROLES.USER, ROLES.SELLER, ROLES.ADMIN].includes(role) ? role : ROLES.USER,
    isBlocked: false,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveUsers(users); // Сохраняем в файл
  
  const { passwordHash, ...userWithoutPassword } = newUser;
  res.status(201).json(userWithoutPassword);
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@test.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Успешный вход
 *       401:
 *         description: Неверные данные
 */
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }
  
  const user = users.find(u => u.email === email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Неверный email или пароль' });
  }
  
  if (user.isBlocked) {
    return res.status(403).json({ error: 'Пользователь заблокирован' });
  }
  
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  refreshTokens.add(refreshToken);
  
  res.json({ accessToken, refreshToken });
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Обновление токенов
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Новая пара токенов
 *       401:
 *         description: Невалидный токен
 */
app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken || !refreshTokens.has(refreshToken)) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
  
  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = users.find(u => u.id === payload.sub);
    
    if (!user || user.isBlocked) {
      return res.status(401).json({ error: 'User not found or blocked' });
    }
    
    refreshTokens.delete(refreshToken);
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    refreshTokens.add(newRefreshToken);
    
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить профиль текущего пользователя
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные пользователя
 */
app.get('/api/auth/me', authMiddleware, roleMiddleware([ROLES.USER, ROLES.SELLER, ROLES.ADMIN]), (req, res) => {
  const user = users.find(u => u.id === req.user.sub);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  const { passwordHash, ...safeUser } = user;
  res.json(safeUser);
});

// ==================== УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ (ADMIN) ====================

app.get('/api/users', authMiddleware, roleMiddleware([ROLES.ADMIN]), (req, res) => {
  const safeUsers = users.map(({ passwordHash, ...rest }) => rest);
  res.json(safeUsers);
});

app.get('/api/users/:id', authMiddleware, roleMiddleware([ROLES.ADMIN]), (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  const { passwordHash, ...safeUser } = user;
  res.json(safeUser);
});

app.put('/api/users/:id', authMiddleware, roleMiddleware([ROLES.ADMIN]), async (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  const { first_name, last_name, role, isBlocked } = req.body;
  if (first_name) user.first_name = first_name;
  if (last_name) user.last_name = last_name;
  if (role && [ROLES.USER, ROLES.SELLER, ROLES.ADMIN].includes(role)) user.role = role;
  if (typeof isBlocked === 'boolean') user.isBlocked = isBlocked;
  
  saveUsers(users); // Сохраняем изменения в файл
  
  const { passwordHash, ...safeUser } = user;
  res.json(safeUser);
});

app.delete('/api/users/:id', authMiddleware, roleMiddleware([ROLES.ADMIN]), (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });
  
  users[index].isBlocked = true;
  saveUsers(users); // Сохраняем изменения в файл
  
  res.json({ message: 'User blocked successfully' });
});

// ==================== ТОВАРЫ ====================

app.post('/api/products', authMiddleware, roleMiddleware([ROLES.SELLER, ROLES.ADMIN]), (req, res) => {
  const { name, price, category, description, material, dimensions, color, stock, imageUrl } = req.body;
  
  if (!name || !price || !category || !description) {
    return res.status(400).json({ error: 'Название, цена, категория и описание обязательны' });
  }
  
  const newProduct = {
    id: nanoid(),
    name,
    price: Number(price),
    category,
    description,
    material: material || '',
    dimensions: dimensions || '',
    color: color || '',
    stock: stock || 0,
    imageUrl: imageUrl || ''
  };
  
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.get('/api/products', authMiddleware, roleMiddleware([ROLES.USER, ROLES.SELLER, ROLES.ADMIN]), (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', authMiddleware, roleMiddleware([ROLES.USER, ROLES.SELLER, ROLES.ADMIN]), (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  
  res.json(product);
});

app.put('/api/products/:id', authMiddleware, roleMiddleware([ROLES.SELLER, ROLES.ADMIN]), (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  
  const { name, price, category, description, material, dimensions, color, stock, imageUrl } = req.body;
  
  if (name) product.name = name;
  if (price !== undefined) product.price = Number(price);
  if (category) product.category = category;
  if (description) product.description = description;
  if (material) product.material = material;
  if (dimensions) product.dimensions = dimensions;
  if (color) product.color = color;
  if (stock !== undefined) product.stock = Number(stock);
  if (imageUrl) product.imageUrl = imageUrl;
  
  res.json(product);
});

app.delete('/api/products/:id', authMiddleware, roleMiddleware([ROLES.ADMIN]), (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });
  
  products.splice(index, 1);
  res.json({ message: 'Product deleted successfully' });
});

// ==================== ЗАПУСК СЕРВЕРА ====================
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log(`📚 Swagger документация: http://localhost:${PORT}/api-docs`);
  console.log(`💾 Пользователи сохраняются в файл: ${USERS_FILE}`);
});