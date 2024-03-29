'use strict';

import * as express from 'express'
import * as vutil from './vutil';
import {FX, X} from "./vutil";
import * as fs from 'fs';
import * as cp from 'child_process';
import * as uuid from 'uuid';
import pt from 'prepend-transform';
import * as chalk from 'chalk';

const router = express.Router();

const vhandler = (id: string, f: (req: express.Request, res: express.Response, next: FX<X>) => any) => {
  return (req: express.Request, res: express.Response, next: FX<X>) => {
    try {
      const p = f(req, res, next);
      if (isPromise(p)) {
        p.catch((err: any) => {
          console.warn('caught by vhandler (promise catcher):', id, err);
          next(vutil.toErrorObj(err, id));
        });
      }
    } catch (err) {
      console.error("caught by vhandler1:", err);
      console.warn('caught by vhandler try/catch:', id, err);
      next(vutil.toErrorObj(err, id));
    }
  };
};


const isPromise = (x: any) => {
  return x && typeof x.then === 'function' && typeof x.catch === 'function';
}


interface Payload {
  sshKey?: string,
  dockerImage?: string
}


router.post('/addkey', /// middleware id for capture errors thrown within
  vhandler("9c7ad147eedf", async (req, res, next) => {

    const t = req.body as Payload;

    console.log({t});

    if (!(t && typeof t === 'object')) {
      next(vutil.toErrorObj('malformed req', "vid/174d26ae0c0e"));
      return;
    }

    if (!(t && typeof t.sshKey === 'string' && t.sshKey.length > 10)) {
      next(vutil.toErrorObj('malformed req:', "vid/536143ec08a9"));
      return;
    }

    if (!(t && typeof t.dockerImage === 'string' && t.dockerImage.length > 10)) {
      next(vutil.toErrorObj('malformed req:', "vid/c85d6f8beeca"));
      return;
    }

    const sshKey = String(t.sshKey).trim();
    const containerName = [uuid.v4().slice(-12),'-hyperbolic.xyz'].join('');

    const p1 = new Promise<number>((resolve, reject) => {
      const k = cp.spawn('bash');
      k.stdin.end(`

         mkdir -p "$HOME/.ssh";
         echo "${sshKey}" >> "$HOME/.ssh/authorized_keys";
         echo 'did the ssh thing - success';
         exit 0;

      `);
      k.stdout.pipe(pt(chalk.blue('ssh-rsa stdout: '))).pipe(process.stdout);
      k.stderr.pipe(pt(chalk.magenta('ssh-rsa stderr: '))).pipe(process.stderr);
      k.once('exit', code => code === 0 ? resolve(code) : reject(code));
      k.once('error', reject);

    });

    const imageName = t.dockerImage;

    if(!imageName){
      next(vutil.toErrorObj('malformed req:', "vid/5bc1ea47ca4b"));
      return;
    }

    const p2 = new Promise<number>((resolve, reject) => {
      const k = cp.spawn('bash');
      k.stdin.end(`

         mkdir -p "$HOME/.ssh";
         docker run -d --entrypoint tail --name '${containerName}' '${imageName}' -f /dev/null;
         echo 'did the ssh thing - success';
         docker ps;
         docker exec '${containerName}' echo "Ping";
         exit 0;

      `);
      k.stdout.pipe(pt(chalk.blue('docker stdout: '))).pipe(process.stdout);
      k.stderr.pipe(pt(chalk.magenta('docker stderr: '))).pipe(process.stderr);
      k.once('exit', code => code === 0 ? resolve(code) : reject(code));
      k.once('error', reject);

    });


    const results = await Promise.all([p1, p2]);


    res.status(202).json({
      results,
      containerName
    });

  }));


export {router};
