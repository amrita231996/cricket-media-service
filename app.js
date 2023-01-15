const dotenv = require('dotenv');

const enviroment = process.argv[2] || 'development';
dotenv.config({
  path: `${__dirname}/config/.env.${enviroment}`,
  node_env: process.argv[2] || 'development',
});
const express = require('express');
const { urlencoded, json } = require('body-parser');
const cors = require('cors');
const path = require('path');
const { promisifyAll } = require('bluebird');
const mongoose = require('mongoose');
const http = require('http');
require('./auth/admin');
const upload = require('./helper/upload');
const authHelper = require('./helper/auth');
const createsocket = require('./socket-server');
const logger = require('./config/logger');
const authRouter = require('./auth/route');
const feedRouter = require('./feed/route');

global.socketInstance = null;
  const { PORT } = process.env;
  const dbOptions = {
    useNewUrlParser: true,
    connectTimeoutMS: 45000, // Give up initial connection after 45 seconds
    socketTimeoutMS: 60000, // Close sockets after 60 seconds of inactivity
    family: 4, // Use IPv4, skip trying IPv6
    useUnifiedTopology: true,
    keepAlive: true,
    keepAliveInitialDelay: 300000,
    maxPoolSize: 200,
  };
  promisifyAll(mongoose);
  mongoose.connect(process.env.DB_HOST, dbOptions);
  mongoose.connection.on('error', (err) => {
    if (process.argv[2]) {
      logger.saveError('mongodb', err);
    } else {
      logger.saveErrorInLocalSystem('mongodb', err);
    }
  });
  mongoose.connection.on('MongoNetworkError', (err) => {
    if (process.argv[2]) {
      logger.saveError('mongodb', err);
    } else {
      logger.saveErrorInLocalSystem('mongodb', err);
    }
  });

  const app = express();
  const httpServer = http.createServer(app);

  app.use(cors());
  app.use(urlencoded({ extended: true }));
  app.use(json());
  app.use(express.static(path.join(__dirname, 'public')));
  createsocket(httpServer);
  app.get('/', (req, res, next) => res.status(200).json({ root: 'ok' }));
  // ..will create microservice for this and will remove from here
  app.post('/save-error', (req, res, next) => {   
      logger.saveErrorInLocalSystem(req.body.logFolderName, req.body.message);
  });

  app.post(
    '/upload-file',
    authHelper.validateToken,
    upload.saveImage,
    (req, res, next) => res.status(200).json(req.files)
  );

  app.use((req, res, next) => {
    req.headers.callingurl = process.env.serverAddress;
    next();
  });
  app.use('/auth', authRouter);
  app.use('/feed', feedRouter);

  if (enviroment === 'production') {
    // console.log('jjjj', enviroment);
    process.on('unhandledRejection', (err) => {
      // console.log('unhandle expection', err);
      logger.saveError(err);
    });
  }

  app.use((err, req, res, next) => {
    if (process.argv[2]) {
      logger.saveError('serviceLog', err.stack);
    } else {
      logger.saveErrorInLocalSystem('serviceLog', err.stack);
    }

    return res.status(err.status || err.statusCode || 500).send(err.message);
    // // console.log("expection", err.message);
    // return res.status(500).send({status:500,message:err.message});
  });

  // console.log(`Worker ${process.pid} started`);
  httpServer.listen(PORT, '0.0.0.0', () => {
    // eslint-disable-next-line no-console
    console.info(`App listening on port ${PORT}`);
  });
