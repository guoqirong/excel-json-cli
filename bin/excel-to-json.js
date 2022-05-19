#!/usr/bin/env node

const commander = require('commander');
const { excel2json } = require('../lib/excel-to-json');
const program = new commander.Command();

program
  .option('-i, --input <file>', '输入要导成json的xls、xlsx文件')
  .option('-r, --rule <key-col-num:key-col-interval>', '解析表格规制，key-col-num为语言包key列索引，key-col-interval为语言包数据范围（如：0:[4,15]表示第一列为key，第五列到第十九列为语言包数据）')
  .option('-o, --output <path>', '输出文件路径及后缀配置');

program.parse(process.argv);

const options = program.opts();
excel2json(options)
if (options.rule) console.log(options);
if (options.output) console.log(options.output);


// 获取非命令参数 console.log(program.args) /[a-z]+-[A-Z]+/g

