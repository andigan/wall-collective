// NOTE: deploy won't work due to secret files in the gitignore file.

module.exports = shipit => {
  // Load shipit-deploy tasks
  require('shipit-deploy')(shipit);

  // from repo
  shipit.initConfig({
    default: {
      deployTo: process.env.DEPLOY_TO,
      repositoryUrl: process.env.REPO,
    },
    production: {
      servers: `root@${process.env.HOST}`,
      branch: 'master',
      workspace: './'
    },
  });

  /*
    npm run deploy-local
    1. Copy local directory to server in local directory
    2. pm2 delete and start app.js
  */

  shipit.task('deploy-local', async () => {

    console.log('\nCopy files from local directory to server.\n');
    await shipit.copyToRemote(
      './',
      `${process.env.DEPLOY_TO}/local`,
    );

    console.log('\nCheck if a fork is already running.\n');

    let commands = [
      'source ~/.nvm/nvm.sh',
      'nvm use 8.0.0',
      'pm2 ls'
    ];

    const appIsAlreadyRunning = await shipit
      .remote(commands.join(' && '))
      .then((response) => {
        return response[0].stdout.includes('online');
      }
      )
      .catch(({ stderr }) => console.error(stderr));

    console.log('\nappIsAlreadyRunning: ', appIsAlreadyRunning, '\n');

    if (appIsAlreadyRunning) {
      console.log('\nDelete app and start new one.\n');
      let commands = [
        'source ~/.nvm/nvm.sh',
        'nvm use 8.0.0',
        'pm2 delete app',
        `pm2 start ${process.env.DEPLOY_TO}/local/app.js`
      ];

      await shipit.remote(commands.join(' && '));
    } else {
      console.log('\nStart app.\n');
      let commands = [
        'source ~/.nvm/nvm.sh',
        'nvm use 8.0.0',
        `pm2 start ${process.env.DEPLOY_TO}/local/app.js`
      ];

      await shipit.remote(commands.join(' && '));
    }

  });

  /*
    npm run restart-server-current
    1. npm install
    2. pm2 delete and start app.js
  */
  shipit.task('restart-server-current', async () => {
    console.log('\nCopy secret files to server.\n');
    await shipit.copyToRemote(
      './config/secrets.js',
      `${process.env.DEPLOY_TO}/current/config`,
    );

    console.log('\nCheck if a fork is already running.\n');

    let commands = [
      'source ~/.nvm/nvm.sh',
      'nvm use 8.0.0',
      'pm2 ls'
    ];

    const appIsAlreadyRunning = await shipit
      .remote(commands.join(' && '))
      .then((response) => {
        return response[0].stdout.includes('online');
      }
      )
      .catch(({ stderr }) => console.error(stderr));

    console.log('\nappIsAlreadyRunning: ', appIsAlreadyRunning, '\n');

    console.log('\nnpm install.\n');
    commands = [
      'source ~/.nvm/nvm.sh',
      'nvm use 8.0.0',
      `cd ..${process.env.DEPLOY_TO}/current`,
      'npm install'
    ];

    await shipit.remote(commands.join(' && '));

    if (appIsAlreadyRunning) {
      console.log('\nDelete app and start new one.\n');
      let commands = [
        'source ~/.nvm/nvm.sh',
        'nvm use 8.0.0',
        'pm2 delete app',
        `pm2 start ${process.env.DEPLOY_TO}/current/app.js`
      ];

      await shipit.remote(commands.join(' && '));
    } else {
      console.log('\nStart app.\n');
      let commands = [
        'source ~/.nvm/nvm.sh',
        'nvm use 8.0.0',
        `pm2 start ${process.env.DEPLOY_TO}/current/app.js`
      ];

      await shipit.remote(commands.join(' && '));
    }
  });


};
