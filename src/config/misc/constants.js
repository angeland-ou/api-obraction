if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: ".env.local" });
}

const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_NAME = process.env.DATABASE_URL;
const CORS_ORIGIN=process.env.CORS_ORIGIN;
const JWT_SECRET=process.env.JWT_SECRET;
const JWT_EXPIRES_IN=process.env.JWT_EXPIRES_IN;
const JWT_REFRESH_EXPIRES_IN=process.env.JWT_REFRESH_EXPIRES_IN;
const SUPABASE_URL=process.env.SUPABASE_URL;
const SUPABASE_KEY=process.env.SUPABASE_KEY;
const STORAGE_PROVIDER=process.env.STORAGE_PROVIDER;
const COOKIE_DOMAIN=process.env.COOKIE_DOMAIN;
const RESEND_API_KEY=process.env.RESEND_API_KEY;
const FRONTEND_URL=process.env.FRONTEND_URL;
const RESEND_TEST_TO_EMAIL=process.env.RESEND_TEST_TO_EMAIL;
const RESEND_FROM_EMAIL=process.env.RESEND_FROM_EMAIL

const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

module.exports = {
    PORT,
    DATABASE_URL,
    DATABASE_NAME,
    CORS_ORIGIN,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN,
    SUPABASE_URL,
    SUPABASE_KEY,
    STORAGE_PROVIDER,
    COOKIE_DOMAIN,
    BCRYPT_SALT_ROUNDS,
    RESEND_API_KEY,
    FRONTEND_URL,
    RESEND_TEST_TO_EMAIL,
    RESEND_FROM_EMAIL
}