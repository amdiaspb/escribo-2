import supertest from "supertest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PRIVATE_KEY } from "../src/auth.js";
import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";
import { appServer } from "../src/server";
import { db } from "../src/db";

const server = supertest(appServer);
afterAll(() => appServer.close());

const generateUserBody = () => ({
  nome: faker.person.fullName(),
  email: faker.internet.email(),
  senha: faker.internet.password(6),
  telefones: [{ 
    numero: faker.string.numeric(9),
    ddd: faker.string.numeric(2)
  }]
});

const createUser = async (user) => {
  const encryptedPassword = await bcrypt.hash(user.senha, 12);
  return db.addUser({ ...user, senha: encryptedPassword });
}

describe("GET /health", () => {
  it("should respond with status 200 and 'OK!' text", async () => {
    const res = await server.get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("OK!");
  });
});

describe("POST /signup", () => {
  it("should respond with status 400 when body is not given", async () => {
    const res = await server.post("/signup");
    expect(res.statusCode).toBe(400);
  });

  it("should respond with status 400 when body is not valid", async () => {
    const invalidBody = { [faker.lorem.word()]: faker.lorem.word() };
    const res = await server.post("/signup").send(invalidBody);
    expect(res.statusCode).toBe(400);
  });

  it("should respond with status 409 when email already exists", async () => {
    const user = generateUserBody();
    await createUser(user);

    const res = await server.post("/signup").send(user);
    expect(res.statusCode).toBe(409);
    expect(res.body.mensagem).toBe("E-mail já existente");
  });

  it("should respond with status 201 and create user", async () => {
    const user = generateUserBody();

    const res = await server.post("/signup").send(user);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      id: expect.any(Number),
      data_criacao: expect.any(String),
      data_atualizacao: expect.any(String),
      ultimo_login: "",
      token: ""
    });
  });
});

const generateLoginBody = () => ({
  email: faker.internet.email(),
  senha: faker.internet.password(6),
});

describe("POST /signin", () => {
  it("should respond with status 400 when body is not given", async () => {
    const res = await server.post("/signin");
    expect(res.statusCode).toBe(400);
  });

  it("should respond with status 400 when body is not valid", async () => {
    const invalidBody = { [faker.lorem.word()]: faker.lorem.word() };
    const res = await server.post("/signin").send(invalidBody);
    expect(res.statusCode).toBe(400);
  });

  it("should respond with status 400 when email is not registered", async () => {
    const login = generateLoginBody();

    const res = await server.post("/signin").send(login);
    expect(res.statusCode).toBe(400);
    expect(res.body.mensagem).toBe("Usuário e/ou senha inválidos");
  });

  it("should respond with status 401 when password is incorrect", async () => {
    const user = generateUserBody();
    await createUser(user);

    const wrongPassword = faker.internet.password(6);
    const login = { email: user.email, senha: wrongPassword };

    const res = await server.post("/signin").send(login);
    expect(res.statusCode).toBe(401);
    expect(res.body.mensagem).toBe("Usuário e/ou senha inválidos");
  });

  it("should respond with status 200 and create token", async () => {
    const user = generateUserBody();
    await createUser(user);

    const login = { email: user.email, senha: user.senha };
    const res = await server.post("/signin").send(login);

    expect(res.statusCode).toBe(200);
    expect(res.body.token).not.toBe("");
  });
});

const generateToken = (uuid, userID, expiresIn = "30m") => {
  return jwt.sign(
    { uuid, userID }, PRIVATE_KEY,
    { expiresIn }
  );
}

describe("GET /user", () => {
  it("should respond with status 401 when token is not provided", async () => {
    const res = await server.get("/user");
    expect(res.status).toBe(401);
    expect(res.body.mensagem).toBe("Não autorizado");
  });

  it("should respond with status 401 when token is not valid", async () => {
    const token = faker.lorem.word();
    const res = await server.get("/user").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(401);
    expect(res.body.mensagem).toBe("Não autorizado");
  });

  it("should respond with status 401 when token doesnt belong to the current database uuid", async () => {
    const token = generateToken(uuidv4(), faker.lorem.word());
    const res = await server.get("/user").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(401);
    expect(res.body.mensagem).toBe("Não autorizado");
  });

  it("should respond with status 401 when token user doesnt exist", async () => {
    const token = generateToken(db.uuid, faker.lorem.word());
    const res = await server.get("/user").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(401);
    expect(res.body.mensagem).toBe("Não autorizado");
  });

  it("should respond with status 401 when token expired", async () => {
    const token = generateToken(uuidv4(), faker.lorem.word(), "-5m");
    const res = await server.get("/user").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(401);
    expect(res.body.mensagem).toBe("Sessão inválida");
  });

  it("should respond with status 200 and user info", async () => {
    const user = generateUserBody();
    const data = await createUser(user);
    const token = generateToken(db.uuid, data.id);
    
    const res = await server.get("/user").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(data.id);
  });
});
