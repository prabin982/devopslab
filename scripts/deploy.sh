#!/bin/bash

echo "🚀 Starting Deployment Process..."

# 1. Git Changes
if ! git diff-index --quiet HEAD --; then
    echo "📦 Committing changes..."
    git add .
    git commit -m "Deploy: $(date +'%Y-%m-%d %H:%M:%S')"
fi

echo "⬆️ Pushing to origin main..."
git push origin main

# 2. Docker Compose
echo "🔄 Restarting services..."
docker compose down
docker compose up -d --build

# 3. Health Checks
echo "⏳ Waiting for Application Health Check..."
max_retries=10
count=0
until $(curl --output /dev/null --silent --head --fail http://localhost:5000/api/health); do
    if [ $count -eq $max_retries ]; then
      echo "❌ App health check failed!"
      exit 1
    fi
    printf '.'
    sleep 5
    ((count++))
done
echo "✅ App is healthy!"

echo "⏳ Waiting for Elasticsearch..."
until $(curl --output /dev/null --silent --head --fail http://localhost:9200); do
    printf '.'
    sleep 5
done
echo "✅ Elasticsearch is ready!"

echo "------------------------------------------------"
echo "🎉 Deployment Complete!"
echo "🔗 Frontend: http://localhost:5000"
echo "📊 Kibana:   http://localhost:5601"
echo "------------------------------------------------"
