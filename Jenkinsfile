pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '30'))
  }

  environment {
    REGISTRY = 'registry.pdas.am'
    TAG = "${env.GIT_COMMIT ? env.GIT_COMMIT.take(8) : 'dev'}"
    TURBO_TELEMETRY_DISABLED = '1'
    NEXT_TELEMETRY_DISABLED = '1'
  }

  stages {
    stage('Install') {
      steps {
        sh 'corepack enable && pnpm install --frozen-lockfile'
      }
    }

    stage('Quality') {
      steps {
        sh 'pnpm turbo run lint typecheck test'
      }
    }

    stage('Docker images') {
      when { branch 'main' }
      steps {
        withCredentials([usernamePassword(credentialsId: 'docker-registry', usernameVariable: 'REG_USER', passwordVariable: 'REG_PASS')]) {
          sh 'echo "$REG_PASS" | docker login "$REGISTRY" -u "$REG_USER" --password-stdin'
        }
        sh '''
          docker build -f infrastructure/docker/api.Dockerfile -t $REGISTRY/pdas-api:$TAG -t $REGISTRY/pdas-api:latest .
          docker build -f infrastructure/docker/nextjs.Dockerfile --build-arg APP=web -t $REGISTRY/pdas-web:$TAG -t $REGISTRY/pdas-web:latest .
          docker build -f infrastructure/docker/nextjs.Dockerfile --build-arg APP=admin -t $REGISTRY/pdas-admin:$TAG -t $REGISTRY/pdas-admin:latest .
          for img in api web admin; do
            docker push $REGISTRY/pdas-$img:$TAG
            docker push $REGISTRY/pdas-$img:latest
          done
        '''
      }
    }

    stage('Deploy') {
      when { branch 'main' }
      steps {
        sshagent(credentials: ['deploy-ssh']) {
          sh 'bash scripts/deploy.sh "$TAG"'
        }
      }
    }
  }
}
