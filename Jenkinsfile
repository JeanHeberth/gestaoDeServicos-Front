pipeline {
  agent any

  parameters {
    string(name: 'DEPLOY_COMMAND', defaultValue: 'docker compose -f docker-compose.prod.yml up -d --build --remove-orphans', description: 'Comando de deploy Docker/Compose (executado apenas na main).')
    booleanParam(name: 'DRY_RUN', defaultValue: true, description: 'Quando true, não executa deploy; apenas mostra o comando.')
  }

  options {
    timestamps()
    disableConcurrentBuilds()
    skipStagesAfterUnstable()
    skipDefaultCheckout(true)
    timeout(time: 30, unit: 'MINUTES')
  }

  environment {
    CI = 'true'
    NODE_VERSION = '20.19.0'
    PATH = "${WORKSPACE}/.tools/node/bin:${PATH}"
  }

  stages {
    stage('Checkout') {
      steps {
        echo '[Checkout] Baixando código do repositório...'
        checkout scm
      }
    }

    stage('Setup Node') {
      steps {
        echo '[Setup Node] Instalando Node.js local no workspace...'
        sh '''
          set -e
          mkdir -p .tools

          OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
          ARCH_RAW="$(uname -m)"

          if [ "$ARCH_RAW" = "x86_64" ]; then
            ARCH="x64"
          elif [ "$ARCH_RAW" = "aarch64" ] || [ "$ARCH_RAW" = "arm64" ]; then
            ARCH="arm64"
          else
            echo "Arquitetura não suportada: $ARCH_RAW"
            exit 1
          fi

          DIST="node-v${NODE_VERSION}-${OS}-${ARCH}"
          URL="https://nodejs.org/dist/v${NODE_VERSION}/${DIST}.tar.gz"

          rm -rf .tools/node .tools/node.tar.gz .tools/${DIST}
          curl -fsSL "$URL" -o .tools/node.tar.gz
          tar -xzf .tools/node.tar.gz -C .tools
          mv ".tools/${DIST}" .tools/node

          node -v
          npm -v
        '''
      }
    }

    stage('Build') {
      steps {
        echo '[Build] Gerando build da aplicação...'
        sh 'npm ci'
        sh 'npm run build'
      }
    }

    stage('Test') {
      steps {
        echo '[Test] Executando testes unitários...'
        sh 'npm run test -- --watch=false'
      }
    }

    stage('Deploy') {
      when {
        branch 'main'
      }
      steps {
        script {
          if (!params.DEPLOY_COMMAND?.trim()) {
            echo '[Deploy] DEPLOY_COMMAND vazio. Pulando deploy.'
            return
          }

          echo "[Deploy] Comando configurado: ${params.DEPLOY_COMMAND}"

          if (params.DRY_RUN) {
            echo '[Deploy] DRY_RUN=true. Comando não executado.'
            return
          }

          sh '''
            set -e
            if ! command -v docker >/dev/null 2>&1; then
              echo 'Docker não encontrado no agente Jenkins. Instale Docker para executar deploy.'
              exit 1
            fi
            docker --version
            docker compose version
          '''

          sh params.DEPLOY_COMMAND
          echo '[Deploy] Deploy concluído com sucesso.'
        }
      }
    }
  }

  post {
    success {
      echo '[Pipeline] ✅ Execução concluída com sucesso.'
    }
    failure {
      echo '[Pipeline] ❌ Falha detectada. Verifique os logs do estágio com erro.'
    }
    always {
      echo '[Pipeline] Finalizando e limpando workspace...'
      archiveArtifacts artifacts: 'dist/**', allowEmptyArchive: true
      cleanWs(deleteDirs: true, disableDeferredWipeout: true)
    }
  }
}
