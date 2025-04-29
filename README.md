# Moxy - Agenda Pessoal

Uma aplicação web moderna para gerenciamento de tarefas e anotações pessoais, com tema galáctico e interface intuitiva.

## Funcionalidades

- Autenticação de usuários (registro e login)
- Calendário interativo
- Gerenciamento de tarefas com prioridades
- Sistema de anotações
- Interface responsiva com tema galáctico
- Persistência de dados com MongoDB

## Tecnologias Utilizadas

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)

### Backend
- Node.js
- Express
- MongoDB
- JWT para autenticação
- bcrypt para criptografia de senhas

## Instalação

1. Clone o repositório
2. Instale as dependências do backend:
```bash
npm install
```

3. Configure as variáveis de ambiente:
- Crie um arquivo `.env` na raiz do projeto
- Adicione as seguintes variáveis:
```
MONGODB_URI=mongodb://localhost:27017/moxy-agenda
JWT_SECRET=sua_chave_secreta_jwt
PORT=3000
```

4. Inicie o servidor MongoDB

5. Inicie o servidor backend:
```bash
npm start
```

6. Abra o arquivo `index.html` em seu navegador

## Estrutura do Projeto

```
moxy-agenda/
├── public/
│   ├── index.html
│   ├── agenda.html
│   ├── styles.css
│   ├── agenda.css
│   ├── script.js
│   └── agenda.js
├── models/
│   ├── User.js
│   ├── Task.js
│   └── Note.js
├── routes/
│   ├── auth.js
│   ├── tasks.js
│   └── notes.js
├── middleware/
│   └── auth.js
├── server.js
├── package.json
└── README.md
```

## API Endpoints

### Autenticação
- POST /api/auth/register - Registro de usuário
- POST /api/auth/login - Login de usuário

### Tarefas
- GET /api/tasks - Listar tarefas
- POST /api/tasks - Criar tarefa
- PATCH /api/tasks/:id - Atualizar tarefa
- DELETE /api/tasks/:id - Deletar tarefa

### Anotações
- GET /api/notes - Listar anotações
- POST /api/notes - Criar anotação
- DELETE /api/notes/:id - Deletar anotação

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes. 