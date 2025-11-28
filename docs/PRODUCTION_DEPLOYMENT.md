# Deployment Guide for WMealPlan

## Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] All environment variables set in production
- [ ] Firebase credentials configured
- [ ] Gemini API key verified and has quota
- [ ] Database connection string configured
- [ ] CORS origins properly set
- [ ] Session secrets are strong and unique

### 2. Security Review
- [ ] All sensitive data in .env files (not committed)
- [ ] .gitignore includes all sensitive files
- [ ] HTTPS enforced
- [ ] Security headers implemented
- [ ] Rate limiting configured
- [ ] Input sanitization active
- [ ] SQL injection protection verified

### 3. Performance Optimization
- [ ] Frontend build optimized (production mode)
- [ ] Static assets minified
- [ ] Images optimized
- [ ] Database indexes created
- [ ] Caching strategy implemented
- [ ] CDN configured (if applicable)

### 4. Testing
- [ ] All features tested in staging
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility checked
- [ ] API endpoints tested
- [ ] Error handling verified
- [ ] Edge cases covered

### 5. Documentation
- [ ] README updated
- [ ] API documentation complete
- [ ] Environment variables documented
- [ ] Deployment steps documented
- [ ] Rollback procedure defined

## Vercel Deployment Steps

### Initial Setup

1. **Install Vercel CLI** (if not already installed)
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Link Project**
```bash
vercel link
```

### Environment Variables Setup

Set all required environment variables in Vercel:

```bash
# Production environment variables
vercel env add GEMINI_API_KEY production
vercel env add FIREBASE_PROJECT_ID production
vercel env add FIREBASE_CLIENT_EMAIL production
vercel env add FIREBASE_PRIVATE_KEY production
vercel env add CLIENT_URL production
vercel env add NODE_ENV production
vercel env add RATE_LIMIT_WINDOW_MS production
vercel env add RATE_LIMIT_MAX_REQUESTS production
```

Or use Vercel Dashboard:
1. Go to Project Settings > Environment Variables
2. Add each variable for Production, Preview, and Development as needed

### Database Setup

1. **Create Postgres Database** in Vercel Dashboard:
   - Go to Storage > Create Database
   - Select Postgres
   - Choose region closest to users
   - Copy connection strings

2. **Database will auto-initialize** on first server start
   - Tables created automatically
   - Indexes added automatically

### Deploy to Production

#### Option 1: Git Integration (Recommended)
1. Push to main branch:
```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

2. Vercel automatically deploys from GitHub

#### Option 2: Manual Deployment
```bash
# Deploy to production
vercel --prod

# Or build and deploy
npm run deploy
```

### Post-Deployment Verification

1. **Check Health Endpoint**
```bash
curl https://your-domain.com/api/health
```

2. **Verify Features**
- [ ] User registration works
- [ ] User login works
- [ ] Meal plan generation works
- [ ] Recipe search works
- [ ] Grocery list works
- [ ] Save/load meal plans works

3. **Monitor Logs**
```bash
vercel logs
```

4. **Check Analytics**
- Visit Vercel Analytics dashboard
- Monitor error rates
- Check performance metrics

## Rollback Procedure

### Instant Rollback
1. Go to Vercel Dashboard > Deployments
2. Find previous working deployment
3. Click "Promote to Production"

### CLI Rollback
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>
```

## Custom Domain Setup

1. **Add Domain in Vercel**
   - Go to Project Settings > Domains
   - Add your custom domain

2. **Configure DNS**
   - Add CNAME record: `CNAME www your-vercel-domain.vercel.app`
   - Add A record for root domain (provided by Vercel)

3. **SSL Certificate**
   - Automatically provisioned by Vercel
   - No manual configuration needed

## Monitoring and Maintenance

### Log Monitoring
```bash
# Real-time logs
vercel logs --follow

# Filter by type
vercel logs --filter error
```

### Performance Monitoring
- Use Vercel Analytics (already integrated)
- Monitor Core Web Vitals
- Track API response times
- Watch for errors and timeouts

### Database Maintenance
```bash
# Connect to database
vercel env pull
# Use connection string from .env

# Regular maintenance
- Monitor database size
- Review slow queries
- Archive old meal plans if needed
- Backup database regularly
```

### Scheduled Tasks
Set up cron jobs for:
- Database cleanup (optional)
- Analytics aggregation
- User inactivity notifications
- System health reports

## Scaling Considerations

### Traffic Scaling
- Vercel auto-scales serverless functions
- Monitor function execution time
- Watch for cold starts
- Consider function memory allocation

### Database Scaling
- Monitor database connections
- Add read replicas if needed
- Implement connection pooling
- Consider caching layer (Redis)

### API Rate Limiting
- Current: In-memory rate limiting
- Scale: Use Redis or Vercel KV
- Monitor quota usage
- Implement user tiers if needed

## Troubleshooting

### Common Issues

**Build Failures**
```bash
# Clear cache and rebuild
vercel --force

# Check build logs
vercel logs --build
```

**Environment Variable Issues**
```bash
# Verify variables are set
vercel env ls

# Pull variables locally for testing
vercel env pull .env.local
```

**Database Connection Issues**
- Check Postgres connection string
- Verify environment variables
- Check database region vs function region
- Review connection limits

**API Quota Exceeded**
- Monitor Gemini API usage
- Implement better caching
- Consider paid API tier
- Add graceful degradation

## Security Best Practices

### Regular Security Tasks
- [ ] Rotate secrets quarterly
- [ ] Update dependencies monthly
- [ ] Review access logs weekly
- [ ] Monitor for suspicious activity
- [ ] Keep privacy policy updated
- [ ] Review CORS settings
- [ ] Check for security advisories

### Incident Response
1. Identify and contain issue
2. Rollback if necessary
3. Fix vulnerability
4. Deploy hotfix
5. Post-mortem analysis
6. Update documentation

## Backup Strategy

### Database Backups
- Vercel Postgres: Automated daily backups
- Manual backup before major changes
- Test restore procedure quarterly

### Code Backups
- Git repository is source of truth
- Tag releases: `git tag v1.0.0`
- Archive production builds

## Contact and Support

### Internal Team
- Development: [dev@wmeal.com]
- Operations: [ops@wmeal.com]
- Security: [security@wmeal.com]

### External Services
- Vercel Support: https://vercel.com/support
- Firebase Support: https://firebase.google.com/support
- Gemini API Support: https://ai.google.dev/support

---

**Last Updated:** November 28, 2025
**Version:** 1.0.0
