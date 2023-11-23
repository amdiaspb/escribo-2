import jwt from "jsonwebtoken";
import { db } from "./db.js";
export const PRIVATE_KEY = "15fcea10-fd1b-418e-8f4b-5268ee5787bd";

export function authenticateToken(req, res, next) {
  const authHeader = req.header("Authorization");
  const token = authHeader.split(" ")[1];

  /* Validação do token (não existe) - Error 401 | Unauthorized */
  let mensagem = "Não autorizado";
  if (!token) return res.status(401).json({ mensagem });

  try {
    const { uuid, userID } = jwt.verify(token, PRIVATE_KEY);

    /* Validação do token (não pertence ao banco de dados em memória atual) - Error 401 | Unauthorized */
    if (uuid !== db.uuid) return res.status(401).json({ mensagem });

    /* Validação do token (usuário não existe) - Error 401 | Unauthorized */
    if (db.findUserIndexByID(userID) === -1) return res.status(401).json({ mensagem });
    
    req.userID = userID;
    return next();

  } catch(error) {
    /* Validação do token (token inválido ou expirado) - Error 401 | Unauthorized */
    if (error.name === "TokenExpiredError") mensagem = "Sessão inválida";
    return res.status(401).send({ mensagem });
  }
}
