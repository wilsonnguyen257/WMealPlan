# WMealPlan - Production Deployment Scripts

# Quick deploy to Vercel production
deploy-production:
	@echo "🚀 Starting production deployment..."
	@echo "📦 Installing dependencies..."
	npm install
	@echo "📦 Installing client dependencies..."
	cd client && npm install
	@echo "🏗️  Building client..."
	cd client && npm run build
	@echo "🚀 Deploying to Vercel..."
	vercel --prod
	@echo "✅ Deployment complete!"

# Deploy to preview environment
deploy-preview:
	@echo "🔍 Starting preview deployment..."
	npm install
	cd client && npm install && npm run build
	vercel
	@echo "✅ Preview deployment complete!"

# Build locally for testing
build:
	@echo "🏗️  Building project locally..."
	npm install
	cd client && npm install && npm run build
	@echo "✅ Build complete! Check client/build/"

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf client/build
	rm -rf node_modules
	rm -rf client/node_modules
	rm -rf .vercel
	@echo "✅ Clean complete!"

# Install dependencies only
install:
	@echo "📦 Installing all dependencies..."
	npm install
	cd client && npm install
	@echo "✅ Dependencies installed!"

# Run tests (when implemented)
test:
	@echo "🧪 Running tests..."
	npm test
	@echo "✅ Tests complete!"

# Check for security vulnerabilities
audit:
	@echo "🔒 Running security audit..."
	npm audit
	cd client && npm audit
	@echo "✅ Audit complete!"

# Update dependencies
update:
	@echo "⬆️  Updating dependencies..."
	npm update
	cd client && npm update
	@echo "✅ Dependencies updated!"

# Verify environment configuration
check-env:
	@echo "🔍 Checking environment variables..."
	@if [ ! -f .env ]; then echo "❌ .env file not found! Copy from .env.example"; exit 1; fi
	@if [ ! -f client/.env.local ]; then echo "⚠️  client/.env.local not found (optional)"; fi
	@echo "✅ Environment files present"

# Full health check
health-check:
	@echo "🏥 Running health check..."
	@curl -f http://localhost:3001/api/health || echo "❌ Server not running"
	@echo "✅ Health check complete"

# View logs from Vercel
logs:
	@echo "📜 Fetching Vercel logs..."
	vercel logs

# Rollback to previous deployment
rollback:
	@echo "⏮️  Rolling back to previous deployment..."
	@echo "Please select deployment from Vercel dashboard or use: vercel rollback <deployment-url>"

.PHONY: deploy-production deploy-preview build clean install test audit update check-env health-check logs rollback
