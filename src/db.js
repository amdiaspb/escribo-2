import { v4 as uuidv4 } from "uuid";

/* In-memory Database */
export const db = { 
  uuid: uuidv4(),
  index: 1,
  users: [],
  addUser: (data) => {
    const now = new Date();
    const metaData = {
      id: db.index,
      data_criacao: now,
      data_atualizacao: now,
      ultimo_login: "",
      token: ""
    };
    db.users.push({ ...data, ...metaData });
    db.index++;

    return metaData;
  },
  findUserIndexByID: (id) => db.users.findIndex(user => user.id === id),
  findUserIndexByEmail: (email) => db.users.findIndex(user => user.email === email),
  updateUserLogin: (id, token) => {
    const user = db.users[db.findUserIndexByID(id)];
    const now = new Date();
    user.token = token;
    user.ultimo_login = now;
    user.data_atualizacao = now;

    const metaData = {
      id: user.id,
      data_criacao: user.data_criacao,
      data_atualizacao: now,
      ultimo_login: now,
      token
    };
    return metaData;
  },
};
