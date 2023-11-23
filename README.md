#  Escribo - Desafio Técnico 2
O objetivo do projeto foi desenvolver uma API RESTful para autenticação de usuários, que permita operações de cadastro (sign up),
autenticação (sign in) e recuperação de informações do usuário.

- **Framework:** Express. `npm start`
- **Segurança:** JWT, BCrypt, Joi.
- **Padronização:** ESLint. `npm run lint`
- **Testagem:** Jest, SuperTest. `npm run test`
- ***Persistência de dados:** Idealmente seria feita com um banco de dados na nuvem e conectado ao server com variáveis de ambiente, mas, como o tempo é curto e pela simplicidade, fiz um banco de dados em memória, onde as informações são mantidas apenas durante a execução da aplicação.*

*Nota: Logo logo irei disponibilizar e linkar nesse projeto uma simples web page utilizando desse backend (com o objetivo de fornecer uma testagem mais prática dos endpoints).*

## Estrutura do projeto
- :open_file_folder: src
  - :ledger: auth.js
  - :ledger: db.js
  - :ledger: schemas.js
  - :ledger: server.js
- :open_file_folder: tests
  - :ledger: server.test.js
- :green_book: .eslint.json
- :orange_book: .gitignore
- :green_book: jest.config.mjs
- :green_book: package-lock.json
- :green_book: package.json
- :blue_book: README.md

## Como usar
1. Clone ou baixe esse repositório.
2. Instale as dependências. `npm install`
3. Inicie a aplicação. `npm run dev` ou `npm start`
4. Utilize os endpoints listados na seção abaixo.
- Para iniciar a suíte de testes use `npm run test`.

***Alternativa:** Com alguma ferramenta que realize requisições HTTP, você também pode testar os endpoints no link de deploy abaixo.   
**Deploy:** https://estest-api-w1n4.onrender.com*

*Obs: Como é um deploy gratuito, a permanência dos dados na sessão não pode ser garantida. A aplicação é regularmente reiniciada e os dados resetados. Para melhor experiência siga os passos acima.*

## Endpoints

- :blue_book: **[POST]** &nbsp;`/signup`&nbsp; *Cadastro*

  - **Input** <br /><br />
  ```javascript
  {
    "nome": "string",
    "email": "string",
    "senha": "string",
    "telefones": [{ "numero": "123456789", "ddd": "12" }]
  }
  ```
  - **Output** <br /><br />
  ```javascript
  {
    "id": "number",
    "data_criacao": "date",
    "data_atualizacao": "date",
    "ultimo_login": "",
    "token": ""
  }
  ```
---
- :blue_book: **[POST]** &nbsp;`/signin`&nbsp; *Login*

  - **Input** <br /><br />
  ```javascript
  {
    "email": "string",
    "senha": "string"
  }
  ```
  - **Output** <br /><br />
  ```javascript
  {
    "id": "number",
    "data_criacao": "date",
    "data_atualizacao": "date",
    "ultimo_login": "date",
    "token": "string" // JWT Token
  }
  ```
---
- :ledger: **[GET]** &nbsp;`/user`&nbsp; *Dados*

  - **Header** <br /><br />
  ```javascript
  { "Authorization": "Bearer {token}" }
  ```
  - **Output** <br /><br />
  ```javascript
  {
    "nome": "string",
    "email": "string",
    "senha": "string", // Encrypted
    "telefones": [{ "numero": "123456789", "ddd": "12" }],
    "id": "number",
    "data_criacao": "date",
    "data_atualizacao": "date",
    "ultimo_login": "date",
    "token": "string" // JWT Token
  }
  ```
---