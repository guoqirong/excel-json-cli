#!/usr/bin/env node

import { excel2json } from "../utils/excel-to-json";
import { Command } from 'commander';

const packageDataE2J = require('../../package.json');

const program = new Command();

// 版本输出
program
  .version(packageDataE2J.version, '-v, --version', '查看工具版本')
  .usage('<command> | [options]');

// 自定义选项参数
program
  .option('-i, --input <file>', '必填，输入要导成json的xls、xlsx文件，可带路径')
  .option('-r, --rule <key-col-num:key-col-interval>', '选填，解析表格规制，key-col-num为数据key列索引，key-col-interval为数据范围（如：0:[4,15]表示第一列为key，第五列到第十九列为数据），默认为0:[1]', '0:[1]')
  .option('-a, --add', '选填，增量导出数据，先获取原有数据')
  .option('-o, --output <path>', '选填，输出文件路径及后缀配置，文件名以**代替，文件存储路径必须存在，默认为./**.ts', './**.ts')
  .helpOption('-h, --help', '查看命令帮助文档');

// 报错时提示通过 -h 或 --help 查看命令帮助文档
program.showHelpAfterError('通过 -h 或 --help 查看命令帮助文档');

// 未知命令是唤起帮助
program
  .command('help', { isDefault: true })
  .description('查看命令帮助文档')
  .action(() => {
    if (program.args.includes('help') || program.args.length > 0) {
      program.outputHelp();
    }
  });

  program.parse(process.argv);

// 默认没有命令参数时唤起帮助
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

const options = program.opts();
// 当有文件输J入时导出文件
if (options.input) excel2json(options);

// 获取非命令参数 program.args
