#!/usr/bin/env node

const commander = require('commander');
const xlsx = require('node-xlsx');
const program = new commander.Command();

program
  .option('-i, --input <file>', 'input xlsx file')
  .option('-o, --output <path>', 'output json file');

program.parse(process.argv);

const options = program.opts();
if (options.input) {
  console.log(options);
  const workSheetsFromFile = xlsx.parse(options.input);
  workSheetsFromFile.forEach(item => {
    console.log(item.name, item.data)
  })
}
if (options.output) console.log(options.output);


// 获取非命令参数 console.log(program.args)

