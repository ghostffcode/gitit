#!/usr/bin/env node
const co = require('co');
const prompt = require('co-prompt');
const program = require('commander');
const cmd = require('node-cmd');
const chalk = require('chalk');

const github = 'https://api.github.com/user/repos';

let data = {};

function addData (key, value) {
  if (value !== "undefined" && (value.length > 0 || (typeof value === "boolean"))) {
    data[key] = value;
  }
  return;
}

program
  .arguments('<name>')
  .action(function(name) {
    co(function *() {
      addData('name', name);
      var user = (yield prompt('username: ')).trim();
      var pass = (yield prompt.password('password: ')).trim();
      addData('description', (yield prompt('description: ')).trim());
      addData('private', (yield prompt('private (y/n)? ', 'n')).toLowerCase().trim() === 'y');
      addData('auto_init', (yield prompt('Create README.md (y/n)? ')).toLowerCase().trim() === 'y');
      addData('gitignore_template', (yield prompt('gitignore (Example: Node): ')).trim());
      addData('license_template', (yield prompt('license (none): ')).trim());
      var ssh = ((yield prompt('ssh(s) / https(h): ')).toLowerCase().trim() === 's');
      command = `curl --data '${JSON.stringify(data)}' -X POST -u ${user}:${pass} ${github}`;
      cmd.get(command, function (data) {
        data = JSON.parse(data);
        if (data.id) {
          console.log(chalk.bold.cyan("Repo successfully created"), data.html_url);
          let link = (ssh) ? data.ssh_url : data.clone_url;
          cmd.get(`git init`, function (data) {
            console.log(data);
            cmd.get(`git remote add origin `+ link, function () {
              console.log(chalk.bold.cyan("remote origin added!"));
              process.exit(0);
            });
          });
        } else {
          console.log(chalk.red(data.message));
          process.exit(1);
        }
      });
    });
  })
  .parse(process.argv);
