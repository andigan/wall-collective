// shipitfile.js
module.exports = shipit => {
  // Load shipit-deploy tasks
  require('shipit-deploy')(shipit);

  // from repo
  shipit.initConfig({
    default: {
      deployTo: '/var/www/theupto',
      repositoryUrl: 'https://github.com/andigan/theupto',
    },
    production: {
      servers: 'root@theupto.com',
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
      '/var/www/theupto/local',
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
        'pm2 start /var/www/theupto/local/app.js'
      ];

      await shipit.remote(commands.join(' && '));
    } else {
      console.log('\nStart app.\n');
      let commands = [
        'source ~/.nvm/nvm.sh',
        'nvm use 8.0.0',
        'pm2 start /var/www/theupto/local/app.js'
      ];

      await shipit.remote(commands.join(' && '));
    }

  });

  /*
    npm run restart-server-current
    1. pm2 delete and start app.js
  */
  shipit.task('restart-server-current', async () => {
    console.log('\nCopy secret files to server.\n');
    await shipit.copyToRemote(
      './config/secrets.js',
      '/var/www/theupto/current/config',
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
      'cd ../var/www/theupto/current',
      'npm install'
    ];

    await shipit.remote(commands.join(' && '));

    if (appIsAlreadyRunning) {
      console.log('\nDelete app and start new one.\n');
      let commands = [
        'source ~/.nvm/nvm.sh',
        'nvm use 8.0.0',
        'pm2 delete app',
        'pm2 start /var/www/theupto/current/app.js'
      ];

      await shipit.remote(commands.join(' && '));
    } else {
      console.log('\nStart app.\n');
      let commands = [
        'source ~/.nvm/nvm.sh',
        'nvm use 8.0.0',
        'pm2 start /var/www/theupto/current/app.js'
      ];

      await shipit.remote(commands.join(' && '));
    }
  });


};
