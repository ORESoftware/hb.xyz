#!/usr/bin/env node
'use strict';

import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as uuid from 'uuid';
import * as chalk from "chalk";
import pt from "prepend-transform";
import axios from 'axios';


async function echoDmgFiles() {

  const r = await new Promise((resolve, reject) => {

    const k = cp.spawn('bash');
    k.stdin.end(`echo $HOME/Downloads/*.dmg | wc -l`);
    const result = {data: ''};
    k.stdout.on('data', d => {
      result.data += String(d || '');
    });

    k.stderr.pipe(pt(chalk.magenta('weather stderr:'))).pipe(process.stderr);

    k.once('exit', code => {
      code == 0 ? resolve(result.data) : reject({code});
    });

  });

  console.log('result count:', String(r || 0).trim());

}

async function getWeatherForecast() {

  const zipCode = await new Promise((resolve, reject) => {

    const k = cp.spawn('bash');
    k.stdin.end(`curl -s https://ipinfo.io/json | jq -r '.postal'`);
    const result = {
      data: ''
    };
    k.stdout.on('data', d => {
      result.data += String(d || '');
    });

    k.stderr.pipe(pt(chalk.magenta('weather stderr:'))).pipe(process.stderr);

    k.once('exit', code => {
      code == 0 ? resolve(result.data) : reject({code});
    });

  });


  const apiKey = '9cb326bd59cb035227398bf28a4cb309'
  const url = `http://api.openweathermap.org/data/2.5/forecast?zip=${zipCode},us&appid=${apiKey}`; // URL for Fahrenheit


  const res = await axios.get(url);
  const result = ([res && res.data && res.data.list].flat(Infinity).filter(Boolean))

  console.log(result[0] || 'sorry, no weather result');

}

async function getGithubRepos() {


  const apiKey = '9cb326bd59cb035227398bf28a4cb309'
  const url = `https://api.github.com/search/repositories?q=stars:>1&sort=stars&order=desc&per_page=20`; // URL for Fahrenheit


  const res = await axios.get(url);
  const result = ([res && res.data && res.data.items].flat(Infinity).filter(Boolean))

  if (result.length < 1) {
    console.log('sorry, not GH repos found.')
    return;
  }

  for (const v of result) {
    console.log('name:', v.full_name, '⭐ star count::', v.stargazers_count);
  }

  console.log('(done with results)');

}

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
        choices: [
          {name: 'Run container on remote machine', value: 'runContainer'},
          {name: 'Get weather forecast in your area.', value: 'getWeather'},
          {name: 'List all .dmg files in Downloads folder', value: 'listDmgFiles'},
          {name: 'Get top 20 most starred GH repos.', value: 'getGHRepos'},
        ],
        validate: function (answer: any) {
          console.log({answer});
          return true;
        }
      }
    ]);


    console.log(' > You have selected:', chalk.blue(action.choice), '...good choice!');

    if (action.choice === 'getWeather') {
      return getWeatherForecast();
    }

    if (action.choice === 'getGHRepos') {
      return getGithubRepos();
    }

    if (action.choice === 'listDmgFiles') {
      return echoDmgFiles();
    }

    const choices = [
      'ubuntu@52.12.110.141',
      'xubuntu@192.168.1.101',
      'nixos@172.16.32.123',
      'admin@10.0.45.67',
      'centos@35.183.156.72',
      'ec2-user@54.197.23.81'
    ];

    const sshTo2 = await inq.prompt([
      {
        type: 'autocomplete',
        name: 'choice',
        message: 'Loaded the pem key. Choose a remote machine to upload the key to:',
        source: (answersSoFar: any, input: string) => {
          input = input || '';
          return new Promise((resolve) => {
            const fuzzyResult = choices.filter((choice) => String(choice || '').toLowerCase().includes(input.toLowerCase()));
            resolve(fuzzyResult);
          });
        }
      }
    ]);

    console.log(sshTo2);

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
      console.error(chalk.magenta(' > user elected not to proceed. done.'));
      return;
    }

    try {
      // the N '' option is
      var k = cp.execSync(`ssh-keygen -t rsa -N '' -b 2048 -m PEM -f ${pemPath}.pem &&
      chmod 600 ${pemPath}.pem &&
      chmod 600 ${pemPath}.pem.pub
     `);

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
        choices: [
          'ubuntu@52.12.110.141',
          'xubuntu@192.168.1.101',
          'nixos@172.16.32.123',
          'admin@10.0.45.67',
          'centos@35.183.156.72',
          'ec2-user@54.197.23.81'
        ],
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
          'jupyter/datascience-notebook:latest',
          'nvidia/cuda:11.6.1-cudnn8-runtime-ubi8',
        ],
        validate: function (answer: any) {
          console.log({answer});
          return true;
        }
      }
    ]);

    const dockerImage = dockerImageToRun.choice;
    console.log(' > You have selected:', chalk.blue(dockerImage), '...good choice!');

    console.log('the user choices were:')
    console.log({action, sshTo, dockerImageToRun});
    console.log('here is the command to run:');

    const postUrl = 'http://52.12.110.141:3900/addkey'
    const response = await axios.post(postUrl, {
      sshKey: pem,
      dockerImage
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const containerName = response.data && response.data.containerName;

    if(!containerName){
      console.error('error: no "containerName" field in response.');
      process.nextTick(() => {
        main(inq);
      })
      return;
    }

    console.log('successful request:', response.data);
    console.log('to ssh into the new docker container, use:');
    console.log(`
    ssh -vvv -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i '${pemPath}' "ubuntu@52.12.110.141" \
     'docker exec -ti ${containerName} bash'
    `)

  } catch (err) {
    console.error(err);
    process.nextTick(() => {
      main(inq);
    })
  }
}

// main().catch(console.error);
