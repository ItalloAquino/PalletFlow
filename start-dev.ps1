$env:NODE_ENV = "development"
$env:DATABASE_URL = "postgres://postgres:admin123@localhost:5432/palletflow"
tsx server/index.ts 