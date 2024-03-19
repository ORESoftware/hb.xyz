#!/usr/bin/env node
'use strict';

import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as http from 'http';
import * as assert from 'assert';
import * as EE from 'events';
import * as strm from "stream";
import {ansi} from "chalk";
// import inquirer from "inquirer";


export async function main(inq: any) {

  const answers = await inq.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'What is your name?',
    },
  ]);

  console.log(`Hello, ${answers.name}!`);

  const meats = await inq.prompt([
    {
      type: 'checkbox',
      message: 'Select toppings',
      name: 'toppings',
      choices: [
        new inq.Separator(' = The Meats = '), // Used for grouping
        {
          name: 'Pepperoni',
        },
        {
          name: 'Ham',
        },
        {
          name: 'Ground Meat',
        },
        {
          name: 'Bacon',
        },
        new inq.Separator(' = The Cheeses = '), // Another grouping
        {
          name: 'Mozzarella',
          checked: true, // Default selected item
        },
        {
          name: 'Cheddar',
        },
        {
          name: 'Parmesan',
        },
        new inq.Separator(' = The usual ='), // Another grouping
        {
          name: 'Mushroom',
        },
        {
          name: 'Tomato',
        },
        new inq.Separator(' = The extras = '), // Another grouping
        {
          name: 'Pineapple',
        },
        {
          name: 'Olives',
          disabled: 'Temporarily unavailable', // Disable selection
        },
        {
          name: 'Extra cheese',
        }
      ],
      validate: function (answer: any) {
        if (answer.length < 1) {
          return 'You must choose at least one topping.';
        }
        return true;
      }
    }
  ]);

  console.log({meats});
}

// main().catch(console.error);
