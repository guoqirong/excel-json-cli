import xlsx, { WorkSheet } from 'node-xlsx';
import * as fs from 'fs-extra';
import { OptionValues } from 'commander';
const chalk = require('chalk');

function readDirFilesData(input: string) {
  // 获取输输入路径及文件类型
  const [path, fileOrSuffix] = input.split('**');
  const [filename, suffix] = fileOrSuffix.split('.');
  // 需要export的文件类型
  const isExportType = ['ts', 'js'];
  console.log('数据读取中，请稍后...');
  // 读取文件夹文件列表
  const files = fs.readdirSync(path || './').filter((item: string) => {
    if (filename) {
      const d = fs.statSync(path + item)
      return d.isDirectory();
    }
    return item.endsWith(suffix);
  })
  let data:any = {};
  // 将文件数据转成json数据
  files.forEach(async (file: string) => {
    const checkFile = fs.existsSync(filename? path + file + fileOrSuffix : path + file);
    if (checkFile) {
      let fileData = fs.readFileSync(filename? path + file + fileOrSuffix : path + file, { flag: 'r', encoding: 'utf-8' });
      fileData = fileData.replace(/\;/g, '');
      try {
        data[file.split('.')[0]] = isExportType.includes(suffix) ? eval('(' + fileData.split('export default ')[1] + ')') : JSON.parse(fileData);
      } catch (error) {
        console.error(chalk.red(file, '该文件不是json，无法导出'))
      }
    }
  });
  return data;
}

function writeFileToExcel(data: { [x: string]: { [x: string]: any; }; }, output: string) {
  // 表格初始数据
  const fileData: WorkSheet<string>[] = [{
    name: 'all data',
    data: [],
    options: {}
  }];
  // 表格首行数据
  let firstRow = ['key'];
  // 记入第一个文件的数据key
  const datakeys = Object.keys(data[Object.keys(data)[0]]);
  Object.keys(data).forEach(key => {
    // 设置表格首行数据
    firstRow.push(key);
    // 比对导出文佳的差异性
    console.log('比', firstRow[1], '文件少字段', key, datakeys.filter(dk => !Object.keys(data[key]).includes(dk)));
    console.log('比', firstRow[1], '文件多字段', key, Object.keys(data[key]).filter(dk => !datakeys.includes(dk)));
    Object.keys(data[key]).forEach((item, i) => {
      // 初始每行数据，加入对应可以值
      if(!fileData[0].data[i]) {
        fileData[0].data.push([item]);
      };
      // 设置对应key的数据值
      const dataIndex = fileData[0].data.findIndex(di => di[0] === item);
      fileData[0].data[dataIndex].push(data[key][item]);
    });
  });
  console.log('文件写入中，请稍后...');
  // 合并首行数据
  fileData[0].data.unshift(firstRow);
  // 将数据转成文件buffer
  const buffer = xlsx.build(fileData);
  // 查看文件夹是否存在
  let paths = output.split('/');
  paths = paths.splice(0, paths.length - 1);
  const path = paths.join('/') || './';
  fs.stat(path, async (_, stats) => {
    if (!stats) {
      // 不存在创建文件夹
      await fs.mkdir(path, {recursive: true}, err => {
        if (err) {
          console.error(chalk.red(err));
        } else {
          // 文件写入
          fs.writeFile(output, Buffer.from(buffer), (err: any) => {
            if (err) {
              console.error(chalk.red(err));
            }
          });
        }
      });
    } else {
      // 文件写入
      fs.writeFile(output, Buffer.from(buffer), (err: any) => {
        if (err) {
          console.error(chalk.red(err));
        }
      });
    }
  });
}

export function json2excel(options: OptionValues) {
  // 读取文件夹数据
  const filesData = readDirFilesData(options.input);
  // 将数据写入excel文件
  writeFileToExcel(filesData, options.output);
}