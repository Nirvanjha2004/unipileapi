# Backend Installation Instructions

1. Create and navigate to the backend directory:
```bash
mkdir -p backend
cd backend
```

2. Initialize a new Node.js project:
```bash
npm init -y
```

3. Install core dependencies:
```bash
npm install express cors dotenv unipile-node-sdk
```

4. Install development dependencies:
```bash
npm install --save-dev typescript ts-node ts-node-dev @types/node @types/express @types/cors
```

5. Initialize TypeScript configuration:
```bash
npx tsc --init
```

6. Create a .env file:
```bash
touch .env
```

7. Add the following to your .env file:
