#!/usr/bin/env node
'use strict';

import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as uuid from 'uuid';
import * as chalk from "chalk";

export async function main(inq: any) {

  // const inquirer = await import('inquirer');
  // const inq = inquirer.default;

  // const answers = await inq.prompt([
  //   {
  //     type: 'input',
  //     name: 'name',
  //     message: 'What is your name?',
  //   },
  // ]);
  //
  // console.log(`Hello, ${answers.name}!`);

  try {

    const action = await inq.prompt([
      {
        type: 'list',
        name: 'choice',
        message: 'Choose one option from the list:',
        choices: ['Run container on remote machine'],
        validate: function (answer: any) {
          console.log({answer});
          return true;
        }
      }
    ]);

    console.log({action});

    const pemPath = uuid.v4().slice(-12);

    const election = await inq.prompt([
      {
        type: 'confirm',
        name: 'confirmChoice',
        message: `I will generate a new ssh key using: "ssh-keygen -t rsa -b 2048 -m PEM -f '${pemPath}.pem'"`,
        default: false, // Optional: sets the default answer (yes in this case)
        validate: function (answer: any) {
          console.log({answer});
          return true;
        }
      }
    ]);

    if (!election.confirmChoice) {
      console.error('error: user elected not to proceed.');
      process.nextTick(() => {
        main(inq);
      })
      return;
    }


    try {
      var k = cp.execSync(`ssh-keygen -t rsa -N '' -b 2048 -m PEM -f ${pemPath}.pem`);
    } catch (err) {
      console.error('had trouble generating pem file:', err);
      process.nextTick(() => {
        main(inq);
      })
      return;
    }

    const pem = String(fs.readFileSync(`${pemPath}.pem.pub`) || "").trim();

    if (pem.length < 1) {
      console.error('error: empty pem file.');
      process.nextTick(() => {
        main(inq);
      })
      return;
    }

    const sshTo = await inq.prompt([
      {
        type: 'list',
        name: 'choice',
        message: 'Loaded the pem key. Choose a remote machine to upload the key to:',
        choices: ['ubuntu@52.12.110.141', 'xubuntu@62.12.400.141', 'nixos@52.12.110.141'],
        validate: function (answer: any) {
          console.log({answer});
          return true;
        }
      }
    ]);

    console.log(' > You have selected:', chalk.blue(sshTo.choice), '...good choice!');

    const dockerImageToRun = await inq.prompt([
      {
        type: 'list',
        name: 'choice',
        message: 'Choose a docker image to run on the remote server:',
        choices: [
          'pytorch/pytorch:latest',
          'tensorflow/tensorflow:latest-gpu',
          'jupyter/datascience-notebook:3.5',
          'nvidia/cuda:latest',
        ],
        validate: function (answer: any) {
          console.log({answer});
          return true;
        }
      }
    ]);

    console.log(' > You have selected:', chalk.blue(dockerImageToRun.choice), '...good choice!');

    console.log('the user choices were:')
    console.log({sshTo, dockerImageToRun});
    console.log('here is the command to run:');

  } catch(err){
    console.error(err);
    process.nextTick(() => {
      main(inq);
    })
  }
}

// main().catch(console.error);
