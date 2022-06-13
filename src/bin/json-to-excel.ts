#!/usr/bin/env node

const commanderJ2E = require('commander');
const { json2excel } = require('../utils/json-to-excel');
const packageDataJ2E = require('../../package.json');

const programJ2E = new commanderJ2E.Command();

// 版本输出
programJ2E
  .version(packageDataJ2E.version, '-v, --version', '查看工具版本')
  .usage('<command> | [optionsJ2E]');

// 自定义选项参数
programJ2E
  .option('-i, --input <path>', '必填，输入文件路径及后缀配置，文件名以**代替，文件支持ts、js和json文件，如：./**.ts')
  .option('-o, --output <file>', '选填，输出要导成的xls、xlsx文件，可带路径，默认为local.xls', 'local.xls')
  .helpOption('-h, --help', '查看命令帮助文档');

// 报错时提示通过 -h 或 --help 查看命令帮助文档
programJ2E.showHelpAfterError('通过 -h 或 --help 查看命令帮助文档');

// 未知命令是唤起帮助
programJ2E
  .command('help', { isDefault: true })
  .description('查看命令帮助文档')
  .action(() => {
    if (programJ2E.args.includes('help') || programJ2E.args.length > 0) {
      programJ2E.outputHelp();
    }
  });

programJ2E.parse(process.argv);

// 默认没有命令参数时唤起帮助
if (!process.argv.slice(2).length) {
  programJ2E.outputHelp();
}

const optionsJ2E = programJ2E.opts();
// 当有文件输入时导出文件
if (optionsJ2E.input) json2excel(optionsJ2E);

// 获取非命令参数 programJ2E.args
