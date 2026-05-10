pipeline {
    agent any

    environment {
        HARBOR = '93d92c4a-e3bf-4ea6-93c6.afab44153cac.isard.nuvulet.itb.cat'
        HARBOR_CREDS = credentials('harbor-credentials')
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'dev',
                    url: 'https://github.com/AdrianoCalderon-ITB2425/FireSense.git'
            }
        }

        stage('Build firesense-web') {
            steps {
                sh '''
                    cd backend-server/k8s-web-services/src-web
                    docker build --no-cache \
                        -t ${HARBOR}/library/firesense-web:${BUILD_NUMBER} \
                        -t ${HARBOR}/library/firesense-web:latest .
                '''
            }
        }

        stage('Build auth-service') {
            steps {
                sh '''
                    cd backend-server/k8s-web-services/auth-service
                    docker build --no-cache \
                        -t ${HARBOR}/library/auth-service:${BUILD_NUMBER} \
                        -t ${HARBOR}/library/auth-service:latest .
                '''
            }
        }

        stage('Trivy Scan') {
            steps {
                sh '''
                    trivy image --exit-code 0 --severity HIGH,CRITICAL \
                        ${HARBOR}/library/firesense-web:${BUILD_NUMBER}
                    trivy image --exit-code 0 --severity HIGH,CRITICAL \
                        ${HARBOR}/library/auth-service:${BUILD_NUMBER}
                '''
            }
        }

        stage('Push to Harbor') {
            steps {
                sh '''
                    echo ${HARBOR_CREDS_PSW} | docker login ${HARBOR} \
                        -u ${HARBOR_CREDS_USR} --password-stdin
                    docker push ${HARBOR}/library/firesense-web:${BUILD_NUMBER}
                    docker push ${HARBOR}/library/firesense-web:latest
                    docker push ${HARBOR}/library/auth-service:${BUILD_NUMBER}
                    docker push ${HARBOR}/library/auth-service:latest
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
