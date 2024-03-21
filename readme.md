
<div align="right">

CircleCI build status:
[![CircleCI](https://circleci.com/gh/ORESoftware/typescript-library-skeleton/tree/master.svg?style=svg)](https://circleci.com/gh/ORESoftware/typescript-library-skeleton/tree/master)

</div>

##  hb.xyz :zap:

#### Steps

1. choose a task - choose "run container"
3. pick an image to deploy as container
4. pick a server to run the image
5. generate a new ssh key
4. ssh into docker container, using provided command

### Work done for this repo:

1. install docker on ubuntu machine
2. download pytorch images, download tensorflow, etc, onto machine
3. on ubuntu remote - install nodejs
4. on ubuntu remote - install typescript
5. on ubuntu remote - git clone project from github
3. start a docker container with name x, and then echo x to user
4. `docker run -ti --entrypoint bash pytorch/pytorch:latest`
5. Create CLI tool to interact with remote


## Launching

do this on remote:

1. git clone <this repo>
2. install node  - via nvm is easiest, `nvm install 20`
3. install ts - `npm i -g typescript`
4. run `tsc -p tsconfig.json`
5. do this `npm i -g .` now hbc is available at command line
6. and `node .` - to run server on port 3900

<br>

## Improvements

1. put ssh-server (openssh) in the container (by using multi-stage docker build, etc)
2. launch container
3. write user's ssh key into authorized_keys in the container - not the host
4. user will ssh into the container, instead of into the host machine
5. user never gets access to host machine, just the container


## Demo

1. ssh into box
2. list running containers - docker ps
3. docker kill $(docker ps -q)
4. docker ps
5. run node server
6. back to local - start cli tool
7. get CLI command
8. back to remote, show new container
9. ssh into container using local command



<br>
<br>
<br>

<img src="assets/img_1.png">


