# Configurar variáveis de ambiente
$env:DATABASE_URL = "postgres://postgres:admin123@localhost:5432/palletflow"
$env:NODE_ENV = "development"

# Instalar dependências
npm install

# Criar banco de dados e aplicar migrações
npm run db:push

# Iniciar o servidor
npx tsx server/index.ts 