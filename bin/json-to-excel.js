#!/usr/bin/env node

const commander = require('commander');
const { json2excel } = require('../lib/json-to-excel');
const package = require('../package.json');

const program = new commander.Command();

// 版本输出
program
  .version(package.version, '-v, --version', '查看工具版本')
  .usage('<command> | [options]');

// 自定义选项参数
program
  .option('-i, --input <path>', '必填，输入文件路径及后缀配置，文件名以**代替，文件支持ts、js和json，如：./**.ts')
  .option('-o, --output <file>', '选填，输出要导成的xls、xlsx文件，可带路径，默认为local.xls', 'local.xls')
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
// 当有文件输入时导出文件
if (options.input) json2excel(options);

// 获取非命令参数 program.args
