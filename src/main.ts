'use strict';

import helmet from "helmet";
import * as cors from 'cors';
import * as express from 'express';
import * as bp from 'body-parser';
import * as routes from './routes';
import {NextFunction, Request, Response} from "express";
import * as path from "path";
import * as favicon from 'serve-favicon';
import * as http from "http";

const app = express();

export const r2gSmokeTest = function () {
  // r2g command line app uses this exported function
  return true;
};

app.use(cors());

app.use(favicon(path.resolve(process.cwd() + '/favicon.ico')));
app.use(helmet());

app.use(bp.urlencoded({extended: true}));
app.use(bp.json({}));

app.use(routes.router);

app.use((req, res, next) => {
  console.info("0a75b26a-10c6-4ca9-ada5-56e660f27d16", 'could not finding matching route.')
  res.status(500).json({error: 'malformed: ' + "fc4aa3b6-91b6-46ed-8cbe-c941c34113d7"})
});

// @ts-ignore
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(500);
  res.json({error: err});
});

const [port, host] = [3900, '0.0.0.0'];

const server = app.listen(port, host, () => {
  console.warn('listening on:', host, port);
});


let startedShutdown = false;

const graceFulShutdown = () => {

  if (startedShutdown) {
    return;
  }
  startedShutdown = true;

  setTimeout(() => {
    console.warn('ending process due to SIGINT + subsequent Timeout.')
    process.exit(0);
  }, 3000);

  server.closeIdleConnections();
  server.closeAllConnections();
  server.close(err => {
    if (err) {
      console.error(err);
    }
    console.warn('closed server, and now shutting down due to SIGINT.')
    process.exit(0);
  });
}

process.once('SIGTERM', () => {
  console.warn('got SIGTERM.')
  graceFulShutdown();
});

process.once('SIGINT', () => {
  console.warn('got SIGINT.')
  graceFulShutdown();
});





