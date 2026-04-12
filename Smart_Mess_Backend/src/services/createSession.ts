import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { JWTLoadData } from '../Interface/interfaces';
import dotenv from 'dotenv';
dotenv.config();

export const createSession = (data: JWTLoadData) => {
  const token = jwt.sign(data, process.env.JWT_KEY as string, {
    expiresIn: '30d',
  });
  return token;
}
