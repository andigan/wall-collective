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

  shipit.task('deploy-local', async () => {
    await shipit.copyToRemote(
      './',
      '/var/www/theupto/local',
    );

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

    console.log('appIsAlreadyRunning: ', appIsAlreadyRunning);

    if (appIsAlreadyRunning) {
      let commands = [
        'source ~/.nvm/nvm.sh',
        'nvm use 8.0.0',
        'pm2 delete app',
        'pm2 start /var/www/theupto/local/app.js'
      ];

      await shipit.remote(commands.join(' && '));
    } else {
      let commands = [
        'source ~/.nvm/nvm.sh',
        'nvm use 8.0.0',
        'pm2 delete app',
        'pm2 start /var/www/theupto/local/app.js'
      ];

      await shipit.remote(commands.join(' && '));
    }
  });

  shipit.task('restart-server-current', async () => {
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

    console.log('appIsAlreadyRunning: ', appIsAlreadyRunning);

    if (appIsAlreadyRunning) {
      let commands = [
        'source ~/.nvm/nvm.sh',
        'nvm use 8.0.0',
        'pm2 delete app',
        'pm2 start /var/www/theupto/current/app.js'
      ];

      await shipit.remote(commands.join(' && '));
    } else {
      let commands = [
        'source ~/.nvm/nvm.sh',
        'nvm use 8.0.0',
        'pm2 delete app',
        'pm2 start /var/www/theupto/current/app.js'
      ];

      await shipit.remote(commands.join(' && '));
    }
  });


};
