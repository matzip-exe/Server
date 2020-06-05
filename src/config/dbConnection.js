const dotenv = require("dotenv");
const { Client } = require("pg");

//load env variables.
dotenv.config();
const DB_USER = process.env.DB_USER || undefined;
const DB_HOST = process.env.DB_HOST || undefined;
const DB_NAME = process.env.DB_NAME || undefined;
const DB_PW = process.env.DB_PW || undefined;
const DB_PORT = Number(process.env.DB_PORT) || undefined;

const dbConfig = {
    user : DB_USER,
    host : DB_HOST,
    database : DB_NAME,
    password : DB_PW,
    port : DB_PORT
};

module.exports = new Client(dbConfig);