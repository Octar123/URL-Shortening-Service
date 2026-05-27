import { customAlphabet } from "nanoid";

const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const generateShortKey  = customAlphabet(alphabet, 7);