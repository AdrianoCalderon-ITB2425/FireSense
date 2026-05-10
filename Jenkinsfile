pipeline {
    agent any

    environment {
        HARBOR = '93d92c4a-e3bf-4ea6-93c6.afab44153cac.isard.nuvulet.itb.cat'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'dev',
                    url: 'https://github.com/AdrianoCalderon-ITB2425/FireSense.git'
            }
        }

        stage('Build & Push firesense-web') {
            steps {
                sh '''
                    kubectl run kaniko-web-${BUILD_NUMBER} \
                        --image=gcr.io/kaniko-project/executor:latest \
                        --restart=Never \
                        --namespace=jenkins \
                        --overrides='{
                            "spec": {
                                "containers": [{
                                    "name": "kaniko",
                                    "image": "gcr.io/kaniko-project/executor:latest",
                                    "args": [
                                        "--context=git://github.com/AdrianoCalderon-ITB2425/FireSense.git#refs/heads/dev",
                                        "--context-sub-path=backend-server/k8s-web-services/src-web",
                                        "--destination=93d92c4a-e3bf-4ea6-93c6.afab44153cac.isard.nuvulet.itb.cat/library/firesense-web:'"${BUILD_NUMBER}"'",
                                        "--destination=93d92c4a-e3bf-4ea6-93c6.afab44153cac.isard.nuvulet.itb.cat/library/firesense-web:latest",
                                        "--insecure"
                                    ]
                                }]
                            }
                        }'
                    kubectl wait --for=condition=complete \
                        pod/kaniko-web-${BUILD_NUMBER} -n jenkins --timeout=300s || \
                    kubectl wait --for=jsonpath=.status.phase=Failed \
                        pod/kaniko-web-${BUILD_NUMBER} -n jenkins --timeout=300s
                    kubectl logs kaniko-web-${BUILD_NUMBER} -n jenkins
                    kubectl delete pod kaniko-web-${BUILD_NUMBER} -n jenkins
                '''
            }
        }

        stage('Build & Push auth-service') {
            steps {
                sh '''
                    kubectl run kaniko-auth-${BUILD_NUMBER} \
                        --image=gcr.io/kaniko-project/executor:latest \
                        --restart=Never \
                        --namespace=jenkins \
                        --overrides='{
                            "spec": {
                                "containers": [{
                                    "name": "kaniko",
                                    "image": "gcr.io/kaniko-project/executor:latest",
                                    "args": [
                                        "--context=git://github.com/AdrianoCalderon-ITB2425/FireSense.git#refs/heads/dev",
                                        "--context-sub-path=backend-server/k8s-web-services/auth-service",
                                        "--destination=93d92c4a-e3bf-4ea6-93c6.afab44153cac.isard.nuvulet.itb.cat/library/auth-service:'"${BUILD_NUMBER}"'",
                                        "--destination=93d92c4a-e3bf-4ea6-93c6.afab44153cac.isard.nuvulet.itb.cat/library/auth-service:latest",
                                        "--insecure"
                                    ]
                                }]
                            }
                        }'
                    kubectl wait --for=condition=complete \
                        pod/kaniko-auth-${BUILD_NUMBER} -n jenkins --timeout=300s || \
                    kubectl wait --for=jsonpath=.status.phase=Failed \
                        pod/kaniko-auth-${BUILD_NUMBER} -n jenkins --timeout=300s
                    kubectl logs kaniko-auth-${BUILD_NUMBER} -n jenkins
                    kubectl delete pod kaniko-auth-${BUILD_NUMBER} -n jenkins
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
