# Vercel Deployment Guide

## Pre-Deployment Checklist

### 1. Security Implementation ✅

- [x] Server-only code created in `src/server/`
- [x] Validation layer added for API endpoints
- [x] Security headers configured in API route
- [x] `server-only` package installed

### 2. Environment Variables (Optional)

If you want to add API key authentication:

1. Go to your Vercel Dashboard
2. Navigate to your project → Settings → Environment Variables
3. Add: `REPORT_API_SECRET` = `your-secret-key-here`
4. Uncomment authentication code in [src/pages/api/generate-report.ts](src/pages/api/generate-report.ts)

### 3. Build Verification

Before pushing to Vercel, test locally:

```bash
npm run build
npm start
```

Test the endpoint:

```bash
curl -X POST http://localhost:3000/api/generate-report \
  -H "Content-Type: application/json" \
  -d '{"result":{"task2":[{"score":15}],"task3":{"correct":10,"errors":2,"time":"30.5s"},"task4":{"correct":20,"errors":1},"task5":{"rounds":[{"correct":5,"steps":3}]}}}'
```

## Deployment Steps

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Option 2: Deploy via Git Integration

1. **Push to GitHub/GitLab/Bitbucket:**

   ```bash
   git add .
   git commit -m "Secured API routes and report generation"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Vercel will auto-detect Next.js configuration
   - Click "Deploy"

### Option 3: Manual Deployment

```bash
# Build the project
npm run build

# Deploy using Vercel CLI
vercel --prod
```

## Post-Deployment Verification

### 1. Test the API Endpoint

```bash
# Replace YOUR_DOMAIN with your Vercel deployment URL
curl -X POST https://YOUR_DOMAIN.vercel.app/api/generate-report \
  -H "Content-Type: application/json" \
  -d '{
    "result": {
      "task2": [{"score": 18}],
      "task3": {"correct": 12, "errors": 1, "time": "25.3s"},
      "task4": {"correct": 15, "errors": 0},
      "task5": {"rounds": [{"correct": 8, "steps": 5}]}
    }
  }'
```

Expected response:

```json
{
  "shortReport": { ... },
  "fullReport": { ... },
  "generatedAt": "2026-02-06T..."
}
```

### 2. Verify Security

1. **Check client bundle:**
   - Open your deployed site
   - Open DevTools → Network tab
   - Find JavaScript bundles
   - Search for "SCORE_STATS" or "calculatePercentile"
   - ✅ Should NOT be found in any client-side JavaScript

2. **Test validation:**

   ```bash
   # Test with invalid data (should return 400 error)
   curl -X POST https://YOUR_DOMAIN.vercel.app/api/generate-report \
     -H "Content-Type: application/json" \
     -d '{"result":{"task2":[{"score":999}]}}'
   ```

3. **Check security headers:**

   ```bash
   curl -I https://YOUR_DOMAIN.vercel.app/api/generate-report
   ```

   Should include:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `X-XSS-Protection: 1; mode=block`

### 3. Monitor Logs

In Vercel Dashboard:

1. Go to your project
2. Click "Logs" tab
3. Monitor for:
   - Validation errors (possible tampering attempts)
   - Server errors
   - Unusual traffic patterns

## Vercel Configuration

Vercel automatically handles:

- ✅ Server-side code isolation
- ✅ API route deployment as serverless functions
- ✅ Static asset optimization
- ✅ Environment variable encryption
- ✅ Automatic HTTPS

No additional configuration needed!

## Performance Optimization

### Edge Functions (Optional)

For faster global response times, consider using Vercel Edge Functions:

1. Rename `generate-report.ts` to `generate-report.edge.ts`
2. Add export config:
   ```typescript
   export const config = {
     runtime: "edge",
   };
   ```

⚠️ Note: Edge Functions have some limitations. Test thoroughly.

## Rollback Plan

If issues arise:

1. **In Vercel Dashboard:**
   - Go to Deployments
   - Find previous working deployment
   - Click "..." → "Promote to Production"

2. **Via Git:**
   ```bash
   git revert HEAD
   git push origin main
   ```

## Monitoring & Alerts

### Set up monitoring:

1. Vercel Dashboard → Settings → Integrations
2. Add monitoring services (Sentry, LogRocket, etc.)

### Key metrics to track:

- API response times
- Error rates
- Validation failure rates
- Unusual request patterns

## Troubleshooting

### Build Fails

**Error: "Cannot find module 'server-only'"**

```bash
npm install
git add package.json package-lock.json
git commit -m "Add server-only package"
git push
```

**Error: "Module not found: Can't resolve 'src/server/report'"**

- Check file paths are correct
- Ensure TypeScript paths are configured in `tsconfig.json`

### Runtime Errors

**500 Error on API route:**

- Check Vercel logs for details
- Verify environment variables are set
- Test validation with various inputs

**API returns null reports:**

- Check input data format
- Verify all required tasks have data
- Review validation rules

## Security Best Practices

1. ✅ Never commit sensitive data to Git
2. ✅ Use environment variables for secrets
3. ✅ Monitor API usage for anomalies
4. ⚠️ Consider adding rate limiting
5. ⚠️ Consider adding authentication
6. ⚠️ Set up logging and alerting

## Next Steps

After successful deployment:

1. **Clean up old files:**

   ```bash
   rm src/utils/report.ts
   rm src/data/report_data.json
   git add -A
   git commit -m "Remove old insecure files"
   git push
   ```

2. **Document the API:**
   - Create API documentation
   - Share endpoint details with team
   - Document expected request/response formats

3. **Monitor and iterate:**
   - Watch for errors
   - Collect user feedback
   - Optimize performance

---

**Deployment Checklist:**

- [ ] Run `npm run build` locally
- [ ] Verify no errors in console
- [ ] Test API endpoint locally
- [ ] Push to Git repository
- [ ] Deploy to Vercel
- [ ] Test production endpoint
- [ ] Verify security headers
- [ ] Check client bundle for sensitive code
- [ ] Monitor logs for first 24 hours
- [ ] Remove old insecure files

**Need Help?**

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Project Security Guide: See [SECURITY.md](SECURITY.md)
