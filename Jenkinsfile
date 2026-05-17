pipeline {
    agent any

    environment {
        APP_NAME = "ecommerce-portal"
        DOCKER_IMAGE = "${APP_NAME}:${env.GIT_COMMIT}"
        LATEST_IMAGE = "${APP_NAME}:latest"
    }

    stages {
        stage('Lint & Test') {
            steps {
                dir('backend') {
                    sh 'npm install'
                    sh 'node --check server.js'
                }
                script {
                    // Start app in background for basic health check test
                    sh "cd backend && PORT=5001 node server.js & sleep 5"
                    sh "curl -f http://localhost:5001/api/health || exit 1"
                    // Find and kill the process
                    sh "lsof -t -i:5001 | xargs kill -9 || true"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE} ."
                sh "docker build -t ${LATEST_IMAGE} ."
                
                // Test the built image
                script {
                    sh "docker run -d --name temp-test -p 5002:5000 ${DOCKER_IMAGE}"
                    sh "sleep 5"
                    sh "curl -f http://localhost:5002/api/health || (docker logs temp-test && docker rm -f temp-test && exit 1)"
                    sh "docker rm -f temp-test"
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh "docker compose config"
                sh "docker compose down"
                sh "docker compose up -d --build"
                
                script {
                    echo "Waiting for app to be ready..."
                    sh "sleep 15"
                    sh "curl -f http://localhost:5000/api/health"
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline finished successfully!"
        }
        failure {
            echo "Pipeline failed! Checking logs..."
            sh "docker compose logs --tail=50"
        }
    }
}
