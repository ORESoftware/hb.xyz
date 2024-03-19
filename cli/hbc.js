#!/usr/bin/env node

(async () => {
  const inquirer = await import('inquirer');
  const mod = require('../dist/cli.js');
  mod.main(inquirer.default);
})();

