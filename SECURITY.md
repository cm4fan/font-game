# 🛡️ Безопасность и секретные данные

## Как работать с конфиденциальными данными

### ✅ Правильно: Использование .env файлов

Все секретные данные должны храниться в `.env` файлах, которые исключены из репозитория через `.gitignore`.

**Пример `.env` файла:**
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Другие секреты (примеры)
VITE_API_KEY=your-secret-api-key
VITE_AUTH_TOKEN=your-auth-token
```

### 📝 Как создать .env файл

1. Скопируйте `.env.example` в `.env`:
   ```bash
   cp .env.example .env
   ```

2. Откройте `.env` и добавьте свои реальные значения вместо заглушек

3. В коде используйте переменные окружения:
   ```javascript
   import.meta.env.VITE_SUPABASE_URL
   import.meta.env.VITE_SUPABASE_ANON_KEY
   ```

### ❌ Неправильно: Что НЕЛЬЗЯ делать

❌ **Никогда не коммитить** `.env` файл с реальными секретами
❌ **Не писать** секреты прямо в коде
```javascript
// ПЛОХО! ❌
const supabaseUrl = "https://xxxxxxxx.supabase.co"
const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

❌ **Не добавлять** секреты в `.env.example`
```bash
# ПЛОХО! ❌ .env.example
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co  # РЕАЛЬНЫЙ СЕКРЕТ!
```

### ✅ Правильно: Что ДЕЛАТЬ

✅ Хранить только примеры в `.env.example`
```bash
# ХОРОШО! ✅ .env.example
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

✅ Использовать переменные окружения в коде
```javascript
// ХОРОШО! ✅
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```

✅ Добавлять файлы с секретами в `.gitignore`
```gitignore
.env
.env.local
*.key
secrets/
```

### 🔒 Проверка безопасности

Перед коммитом проверьте, что нет секретов:

```bash
# Проверить, есть ли .env в git
git status

# Если случайно добавили секрет, удалить из истории:
git rm --cached .env
git commit --amend
```

### 🚀 Развертывание

Для продакшена используйте настройки вашей хостинг-платформы:

**Vercel:**
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

**Netlify:**
```bash
netlify env:set VITE_SUPABASE_URL "your-url"
netlify env:set VITE_SUPABASE_ANON_KEY "your-key"
```

**GitHub Actions:**
Settings → Secrets and variables → Actions → New repository secret

### 📚 Дополнительные ресурсы

- [Vite Env Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Git .gitignore Best Practices](https://github.com/github/gitignore)
