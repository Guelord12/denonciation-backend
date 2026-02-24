const envalid = require('envalid');
const { str, port } = envalid;

const env = envalid.cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'production'] }),
  PORT: port(),
  DB_HOST: str(),
  DB_PORT: port(),
  DB_NAME: str(),
  DB_USER: str(),
  DB_PASSWORD: str(),
  DB_SSL: str({ default: 'false' }),
  JWT_SECRET: str(),
  JWT_EXPIRES_IN: str(),
  CLOUDINARY_CLOUD_NAME: str(),
  CLOUDINARY_API_KEY: str(),
  CLOUDINARY_API_SECRET: str(),
  NEWS_API_KEY: str(),
  RTMP_SERVER_PORT: port({ default: 1935 }),
  HTTP_SERVER_PORT: port({ default: 8000 }),
  GOOGLE_APPLICATION_CREDENTIALS: str({ default: './config/google-vision.json' }),
  EMAIL_USER: str(),
  EMAIL_PASSWORD: str()
});

module.exports = env;