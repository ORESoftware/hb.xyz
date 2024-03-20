#!/usr/bin/env node

(async () => {
  const inquirer = await import('inquirer');
  const inqAutocomplete = await import('inquirer-autocomplete-prompt');
  inquirer.default.registerPrompt('autocomplete', inqAutocomplete.default);
  const mod = require('../dist/cli.js');
  mod.main(inquirer.default);
})();

