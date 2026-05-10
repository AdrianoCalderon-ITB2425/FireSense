pipeline {
    agent any

    environment {
        HARBOR = '93d92c4a-e3bf-4ea6-93c6.afab44153cac.isard.nuvulet.itb.cat'
        HARBOR_CREDS = credentials('harbor-credentials')
        DOCKER = '/tmp/docker'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'dev',
                    url: 'https://github.com/AdrianoCalderon-ITB2425/FireSense.git'
            }
        }

        stage('Install Docker CLI') {
            steps {
                sh '''
                    if [ ! -f /tmp/docker ]; then
                        curl -fsSL https://download.docker.com/linux/static/stable/x86_64/docker-27.3.1.tgz \
                            | tar -xz --strip-components=1 -C /tmp docker/docker
                        chmod +x /tmp/docker
                    fi
                    /tmp/docker --version
                '''
            }
        }

        stage('Build firesense-web') {
            steps {
                sh '''
                    cd backend-server/k8s-web-services/src-web
                    /tmp/docker build --no-cache \
                        -t ${HARBOR}/library/firesense-web:${BUILD_NUMBER} \
                        -t ${HARBOR}/library/firesense-web:latest .
                '''
            }
        }

        stage('Build auth-service') {
            steps {
                sh '''
                    cd backend-server/k8s-web-services/auth-service
                    /tmp/docker build --no-cache \
                        -t ${HARBOR}/library/auth-service:${BUILD_NUMBER} \
                        -t ${HARBOR}/library/auth-service:latest .
                '''
            }
        }

        stage('Push to Harbor') {
            steps {
                sh '''
                    echo ${HARBOR_CREDS_PSW} | /tmp/docker login ${HARBOR} \
                        -u ${HARBOR_CREDS_USR} --password-stdin
                    /tmp/docker push ${HARBOR}/library/firesense-web:${BUILD_NUMBER}
                    /tmp/docker push ${HARBOR}/library/firesense-web:latest
                    /tmp/docker push ${HARBOR}/library/auth-service:${BUILD_NUMBER}
                    /tmp/docker push ${HARBOR}/library/auth-service:latest
                '''
            }
        }

        stage('Deploy to K8s') {
            steps {
                sh '''
                    kubectl set image deployment/nginx-web \
                        nginx=${HARBOR}/library/firesense-web:${BUILD_NUMBER} \
                        -n firesense
                    kubectl set image deployment/auth-service \
                        auth-service=${HARBOR}/library/auth-service:${BUILD_NUMBER} \
                        -n firesense
                    kubectl rollout status deployment/nginx-web -n firesense
                    kubectl rollout status deployment/auth-service -n firesense
                '''
            }
        }
    }

    post {
        success {
            echo "Pipeline completat correctament - Build #${BUILD_NUMBER}"
        }
        failure {
            echo "Pipeline fallat - Build #${BUILD_NUMBER}"
        }
    }
}
