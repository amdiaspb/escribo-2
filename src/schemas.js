import joi from "joi";

const telefoneSchema = joi.object().keys({
  numero: joi.string().regex(/^[0-9]{9}$/).messages({
    "string.pattern.base": `"numero" must contain a number 9 characters long.`
  }).required(),
  ddd: joi.string().regex(/^[0-9]{2}$/).messages({
    "string.pattern.base": `"ddd" must contain a number 2 characters long.`
  }).required(),
});

export const signupSchema = joi.object({
  nome: joi.string().min(3).max(30).required(),
  email: joi.string().email().required(),
  senha: joi.string().min(6).max(30).required(),
  telefones: joi.array().length(1).items(telefoneSchema).required()
});

export const signinSchema = joi.object({
  email: joi.string().email().required(),
  senha: joi.string().min(6).max(30).required(),
});
