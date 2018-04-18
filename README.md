expedia-build-stats-web
======================

Expressjs based Node web app sample

#### Running the application

To run the app in dev environment, execute

```
$ ./bin/www
```

or

```
$ node server.js
```

To start the app in any other environment, set NODE_ENV environment valiable to one of ```test```, ```int``` or ```prod```

#### Files

##### build.sh

```build.sh``` file will be used for bundling the application when the build runs. Prime build-deploy pipeline expects a versioned artifact to be deployed on the servers, which is produced by this script. Make changes to the script to include all files that needs to be deployed on the server.

##### install.sh

```install.sh``` file will be executed on the server to setup the project. For example, running ```npm install``` or ```bower install``` should be done here. E3 prime will make sure the instance that runs a node app has ```node, npm and bower```. 

