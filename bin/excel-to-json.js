#!/usr/bin/env node

const commander = require('commander');
const { excel2json } = require('../lib/excel-to-json');
const package = require('../package.json');

const program = new commander.Command();

// 版本输出
program
  .version(package.version);

// 自定义命令参数
program
  .option('-i, --input <file>', '输入要导成json的xls、xlsx文件')
  .option('-r, --rule <key-col-num:key-col-interval>', '解析表格规制，key-col-num为语言包key列索引，key-col-interval为语言包数据范围（如：0:[4,15]表示第一列为key，第五列到第十九列为语言包数据），默认为0:[1]')
  .option('-a, --add', '增量导出数据，先获取原有数据')
  .option('-o, --output <path>', '输出文件路径及后缀配置，文件名以**代替，文件存储路径必须存在，默认为./**.ts');

// 默认没有命令参数时唤起帮助
program
  .command('help', { isDefault: true })
  .description('Print this help')
  .action(function() {
    program.outputHelp();
  });

program.parse(process.argv);

const options = program.opts();
// 当有文件输入时导出文件
if (options.input) excel2json(options);

// 获取非命令参数 program.args

