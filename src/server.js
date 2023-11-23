import express, { json } from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "./db.js";
import { PRIVATE_KEY, authenticateToken } from "./auth.js";
import { signinSchema, signupSchema } from "./schemas.js";

/* Express Config */
const app = express();
app.use(json());
app.use(cors());

/* Endpoints */

/* [GET] / */
app.get("/", (_req, res) => res.send());

/* [GET] /health */
app.get("/health", (_req, res) => res.send("OK!"));

/* [POST] /signup */
app.post("/signup", async (req, res) => {
  const { body } = req;

  /* Validação do corpo - Error 400 | Bad Request */
  const { error } = signupSchema.validate(body, { abortEarly: false });
  if (error) {
    const mensagem = error.details.map(d => d.message);
    return res.status(400).json({ mensagem });
  }

  /* Validação do email - Error 409 | Conflict */
  if (db.findUserIndexByEmail(body.email) !== -1) {
    const mensagem = "E-mail já existente";
    return res.status(409).json({ mensagem });
  }

  /* Usuário criado - Status 201 | Created */
  body.senha = await bcrypt.hash(body.senha, 12);
  const newUser = db.addUser(body);
  return res.status(201).json(newUser);
});

/* [POST] /signin */
app.post("/signin", async (req, res) => {
  const { body } = req;

  /* Validação do corpo - Error 400 | Bad Request */
  const { error } = signinSchema.validate(body, { abortEarly: false });
  if (error) {
    const mensagem = error.details.map(d => d.message);
    return res.status(400).json({ mensagem });
  }

  /* Validação do login (email/senha) */
  const userIndex = db.findUserIndexByEmail(body.email);
  const mensagem = "Usuário e/ou senha inválidos";

  /* Validação do email - Error 400 | Bad Request */
  if (userIndex === -1) return res.status(400).json({ mensagem });

  /* Validação da senha - Error 401 | Unauthorized */
  const user = db.users[userIndex];
  const isPasswordValid = await bcrypt.compare(body.senha, user.senha);
  if (!isPasswordValid) return res.status(401).json({ mensagem });

  /* Login realizado, sessão iniciada (token criado) - Status 200 | OK */
  const token = jwt.sign(
    { uuid: db.uuid, userID: user.id }, PRIVATE_KEY,
    { expiresIn: "30m" }
  );
  const metaData = db.updateUserLogin(user.id, token);
  return res.status(200).json(metaData);
});

/* Validação do token - Error 401 | Unauthorized */
app.use("*", authenticateToken);

/* [GET] /user */
app.get("/user", (req, res) => {
  /* Usuário autenticado - Status 200 | OK */
  const idx = db.findUserIndexByID(req.userID);
  const user = db.users[idx];
  return res.status(200).json(user);
});

/* Error Handler */
// eslint-disable-next-line
app.use((err, _req, res, _next) => {
  // console.error(err.stack);
  res.status(500).json({ mensagem: "Unknown Endpoint / Internal Error" });
})

/* Server Config */
const port = +process.env.PORT || 4000;
export const appServer = app.listen(port, () => {
  console.log(`Server running at port ${port}...`);
});
