'use strict';

import helmet from 'helmet';
import cors from 'cors';
import express, {NextFunction, Request, Response} from 'express';
import * as bp from 'body-parser';
import * as routes from './routes';
import * as path from 'path';
import favicon from 'serve-favicon';

const app = express();

export const r2gSmokeTest = function () {
  return true;
};

app.use(cors());
app.use(favicon(path.resolve(process.cwd() + '/favicon.ico')));
app.use(helmet());
app.use(bp.urlencoded({extended: true}));
app.use(bp.json({}));

app.get('/healthz', (_req: Request, res: Response) => {
  res.status(200).json({status: 'ok'});
});

app.get('/readyz', (_req: Request, res: Response) => {
  res.status(200).json({status: 'ready'});
});

app.use(routes.router);

app.use((req: Request, res: Response, next: NextFunction) => {
  console.info('0a75b26a-10c6-4ca9-ada5-56e660f27d16', 'could not finding matching route.');
  res.status(500).json({error: 'malformed: ' + 'fc4aa3b6-91b6-46ed-8cbe-c941c34113d7'});
});

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
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
    console.warn('ending process due to SIGINT + subsequent Timeout.');
    process.exit(0);
  }, 3000);

  server.closeIdleConnections();
  server.closeAllConnections();
  server.close((err?: Error) => {
    if (err) {
      console.error(err);
    }
    console.warn('closed server, and now shutting down due to SIGINT.');
    process.exit(0);
  });
};

process.once('SIGTERM', () => {
  console.warn('got SIGTERM.');
  graceFulShutdown();
});

process.once('SIGINT', () => {
  console.warn('got SIGINT.');
  graceFulShutdown();
});
