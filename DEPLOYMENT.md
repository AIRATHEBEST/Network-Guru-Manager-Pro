# Network Guru Manager - Deployment Guide

This guide provides comprehensive instructions for deploying the Network Guru Manager application to various hosting platforms.

## Prerequisites

Before deploying, ensure you have:

- Node.js 18+ installed
- npm or yarn package manager
- Git for version control
- Docker and Docker Compose (for containerized deployment)
- GitHub account with repository access
- Vercel, Heroku, or AWS account for hosting

## Local Development Setup

### Using Docker Compose

The easiest way to set up a complete development environment locally:

```bash
docker-compose up -d
```

This will start:
- MySQL database (port 3306)
- Redis cache (port 6379)
- Backend server (port 3000)

### Manual Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Initialize database:**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## Deployment Options

### Option 1: Vercel Deployment (Recommended for Web)

Vercel provides seamless integration with GitHub and automatic deployments.

**Steps:**

1. **Connect GitHub repository:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository
   - Import the project

2. **Configure environment variables:**
   - In Vercel dashboard, go to Settings > Environment Variables
   - Add all variables from `.env.example`:
     - `DATABASE_URL`
     - `JWT_SECRET`
     - `SESSION_SECRET`
     - `EXPO_PUSH_TOKEN_URL`

3. **Deploy:**
   - Vercel automatically deploys on every push to main branch
   - View deployment at your custom domain

### Option 2: Docker Deployment (Recommended for Backend)

Deploy using Docker containers on any cloud provider.

**Build Docker image:**
```bash
docker build -t network-guru-manager:latest .
```

**Push to Docker registry:**
```bash
docker tag network-guru-manager:latest your-registry/network-guru-manager:latest
docker push your-registry/network-guru-manager:latest
```

**Deploy on cloud platforms:**

**AWS ECS:**
```bash
# Create ECS cluster and task definition
aws ecs create-cluster --cluster-name network-guru
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

**Google Cloud Run:**
```bash
gcloud run deploy network-guru-manager \
  --image gcr.io/your-project/network-guru-manager:latest \
  --platform managed \
  --region us-central1
```

**DigitalOcean App Platform:**
- Connect GitHub repository
- Select Dockerfile
- Configure environment variables
- Deploy

### Option 3: Heroku Deployment

**Steps:**

1. **Install Heroku CLI:**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create Heroku app:**
   ```bash
   heroku create network-guru-manager
   ```

3. **Add environment variables:**
   ```bash
   heroku config:set DATABASE_URL=your-database-url
   heroku config:set JWT_SECRET=your-secret-key
   heroku config:set SESSION_SECRET=your-session-secret
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

### Option 4: AWS Elastic Beanstalk

**Steps:**

1. **Install EB CLI:**
   ```bash
   pip install awsebcli --upgrade --user
   ```

2. **Initialize EB application:**
   ```bash
   eb init -p node.js-20 network-guru-manager
   ```

3. **Create environment:**
   ```bash
   eb create production
   ```

4. **Deploy:**
   ```bash
   eb deploy
   ```

## Mobile App Deployment

### Android APK Build

**Using Expo:**
```bash
npx expo build:android -t apk
```

**Using EAS (Recommended):**
```bash
npm install -g eas-cli
eas build --platform android
```

The APK will be available for download from EAS dashboard.

### iOS Build

**Using Expo:**
```bash
npx expo build:ios
```

**Using EAS:**
```bash
eas build --platform ios
```

### Publishing to App Stores

**Google Play Store:**
1. Create Google Play Developer account
2. Generate signing key
3. Upload APK to Play Console
4. Configure store listing and pricing
5. Submit for review

**Apple App Store:**
1. Create Apple Developer account
2. Generate provisioning profiles
3. Build and sign IPA
4. Upload to App Store Connect
5. Configure app information
6. Submit for review

## Database Migration

### Initial Setup

```bash
npm run db:migrate
npm run db:seed
```

### Production Migration

```bash
npm run db:migrate:prod
```

## Monitoring and Maintenance

### Health Checks

The application includes health check endpoint at `/health`:

```bash
curl http://localhost:3000/health
```

### Logging

Configure logging level in environment:
```bash
LOG_LEVEL=debug  # development
LOG_LEVEL=info   # production
```

### Database Backups

**MySQL Backup:**
```bash
mysqldump -u user -p database_name > backup.sql
```

**Restore:**
```bash
mysql -u user -p database_name < backup.sql
```

## Scaling Considerations

### Horizontal Scaling

- Use load balancer (AWS ALB, Nginx)
- Deploy multiple backend instances
- Use Redis for session management
- Configure database connection pooling

### Performance Optimization

- Enable caching headers
- Compress responses (gzip)
- Optimize database queries
- Use CDN for static assets
- Implement rate limiting

## Security Checklist

- [ ] Set strong JWT and session secrets
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Enable database encryption
- [ ] Configure backup retention
- [ ] Set up monitoring and alerts
- [ ] Enable audit logging
- [ ] Implement rate limiting
- [ ] Keep dependencies updated

## Troubleshooting

### Common Issues

**Database connection failed:**
- Verify DATABASE_URL is correct
- Check database server is running
- Verify network connectivity

**Out of memory:**
- Increase container memory limits
- Optimize database queries
- Implement caching

**High latency:**
- Check database performance
- Review API response times
- Optimize frontend bundle size

## Support and Resources

- GitHub Issues: [Report bugs](https://github.com/AIRATHEBEST/Network-Guru-Manager-Pro/issues)
- Documentation: See `/docs` directory
- API Documentation: See `docs/IMPLEMENTATION_GUIDE.md`

## Next Steps

After deployment:

1. Configure monitoring and alerting
2. Set up automated backups
3. Implement CI/CD pipeline
4. Configure custom domain
5. Set up SSL certificates
6. Enable analytics
7. Configure error tracking (Sentry)
8. Set up performance monitoring

---

For more information, see the main [README.md](./README.md) and other documentation files in the `/docs` directory.
