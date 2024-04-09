pipeline {
    agent any

    post {
        failure {
            updateGitlabCommitStatus name: 'build', state: 'failed'
            mail bcc: '', body: "<b>Build Failed</b><br>Project: ${env.JOB_NAME} <br>Build Number: ${env.BUILD_NUMBER} <br> URL de build: ${env.BUILD_URL}", cc: '', charset: 'UTF-8', from: 'jenkins@stickybits.red', mimeType: 'text/html', replyTo: '', subject: "ERROR CI: Project name -> ${env.JOB_NAME}", to: "jenkins";  
        }
        success {
            updateGitlabCommitStatus name: 'build', state: 'success'
        }
    }
    options {
        gitLabConnection('Jenkins')
    }

    stages {
        stage('Prepare') {
            steps {
                updateGitlabCommitStatus name: 'build', state: 'running'
                sh 'rm -rf build/'
                sh 'npm i'
            }
        }
        stage('Build') {
            steps {
                sh 'npm run build'
                echo "[*] API has been built"
            }
        }
    }
}

