# 🔐 Secure Environment Setup Guide

## ⚠️ IMPORTANT SECURITY NOTICE

**NEVER commit `.env` files to git!** All environment files have been removed from version control and added to `.gitignore`.

## 🛠️ Environment Configuration

### For Local Development:

1. **Backend Setup:**
   ```bash
   cd household-planet-backend
   cp .env.example .env
   # Edit .env with your local values
   ```

2. **Frontend Setup:**
   ```bash
   cd household-planet-frontend
   cp .env.example .env.local
   # Edit .env.local with your local values
   ```

### For Dokploy Production:

**Use Dokploy's built-in secrets management instead of .env files:**

1. **Database Variables:**
   - `POSTGRES_USER` = `household_user`
   - `POSTGRES_PASSWORD` = `[GENERATE STRONG PASSWORD]`
   - `DATABASE_URL` = `postgresql://household_user:[PASSWORD]@postgres:5432/household_planet`

2. **Security Variables:**
   - `JWT_SECRET` = `[GENERATE 64-CHAR RANDOM STRING]`
   - `SESSION_SECRET` = `[GENERATE 64-CHAR RANDOM STRING]`

3. **External Service Variables:**
   - `MPESA_CONSUMER_KEY` = `[FROM SAFARICOM]`
   - `MPESA_CONSUMER_SECRET` = `[FROM SAFARICOM]`
   - `WHATSAPP_WEBHOOK_SECRET` = `[FROM META]`

## 🔑 How to Generate Secure Secrets

```bash
# Generate JWT secret (64 characters)
openssl rand -base64 48

# Generate session secret
openssl rand -hex 32

# Generate strong password
openssl rand -base64 24
```

## 🚀 Deployment Checklist

- [ ] All secrets configured in Dokploy (not .env files)
- [ ] Database credentials are strong and unique
- [ ] JWT/Session secrets are randomly generated
- [ ] External API keys are from official sources
- [ ] CORS origins match your domain exactly
- [ ] No hardcoded secrets in code

## 🆘 Emergency Recovery

If secrets are compromised:
1. Rotate all JWT/Session secrets immediately
2. Change database passwords
3. Regenerate API keys from providers
4. Force logout all users
5. Review access logs

## 📖 Reference

- **Domain**: `householdplanetkenya.co.ke`
- **API**: Served via Next.js proxy at `/api/*`
- **Database**: PostgreSQL with persistent volumes
- **SSL**: Managed by Traefik + Let's Encrypt