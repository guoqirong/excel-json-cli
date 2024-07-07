import xlsx, { WorkSheet } from 'node-xlsx';
import * as fs from 'fs-extra';
import { OptionValues } from 'commander';
import chalk from 'chalk';
import { isExportType } from '../constants';

const readDirFilesData = (input: string) => {
  // 获取输输入路径及文件类型
  const [path, fileOrSuffix] = input.split('**');
  const [filename, suffix] = fileOrSuffix.split('.');
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
    const checkFile = fs.existsSync(filename ? path + file + fileOrSuffix : path + file);
    if (checkFile) {
      let fileData = fs.readFileSync(filename ? path + file + fileOrSuffix : path + file, { flag: 'r', encoding: 'utf-8' });
      fileData = fileData.replace(/\;/g, '');
      try {
        const fns = file.split('.');
        data[fns.splice(0, fns.length - 1).join('.')] = isExportType.includes(suffix) ? eval('(' + fileData.split('export default ')[1] + ')') : JSON.parse(fileData);
      } catch (error) {
        console.error(chalk.red(file, '该文件不是json，无法导出'))
      }
    }
  });
  return data;
}

const multilevelObjectDeconstruct = (
  fileData: WorkSheet<string>[],
  data: { [x: string]: any; },
  datakeys: string[],
  pKey: string,
  langi: number
) => {
  Object.keys(data).forEach(item => {
    if (typeof data[item] === 'object') {
      multilevelObjectDeconstruct(fileData, data[item], datakeys, `${pKey}.${item}`, langi);
      return ;
    }
    const dataIndex = fileData[0].data.findIndex(di => di[0] === `${pKey}.${item}`);
    // 初始每行数据，加入对应可以值
    if(dataIndex === -1) {
      const data = new Array(langi + 1).fill('');
      data[0] = `${pKey}.${item}`;
      fileData[0].data.push(data);
    };
    const di = dataIndex !== -1 ? dataIndex : (fileData[0].data?.length - 1);
    // 补充缺少数据
    if (langi + 1 > fileData[0].data[di].length) {
      const notDataNum = langi + 1 - fileData[0].data[di].length;
      const data = new Array(notDataNum).fill('');
      fileData[0].data[di] = fileData[0].data[di].concat(data);
    }
    // 设置对应key的数据值
    fileData[0].data[di].push(data[item]);
  });
}

const writeFileToExcel = (data: { [x: string]: { [x: string]: any; }; }, {
  output,
  isMoToSo
}: {
  output: string;
  isMoToSo: boolean
}) => {
  // 表格初始数据
  const fileData: WorkSheet<string>[] = [{
    name: 'all data',
    data: [],
    options: {}
  }];
  // 表格首行数据
  let firstRow = ['key'];
  // 记入第一个文件的数据key
  let datakeys = Object.keys(data[Object.keys(data)[0]]);
  Object.keys(data).forEach((key, i) => {
    // 设置表格首行数据
    firstRow.push(key);
    // 合并补充第一个文件不存在的key
    datakeys = datakeys.concat(Object.keys(data[key]).filter(
      dk => !datakeys.includes(dk) && ((typeof data[key][dk] !== 'object' && isMoToSo) || !isMoToSo)
    ));
    Object.keys(data[key]).forEach(item => {
      if (typeof data[key][item] === 'object') {
        // 对象数据处理
        if (isMoToSo) {
          multilevelObjectDeconstruct(fileData, data[key][item], datakeys, item, i);
        } else {
          data[key][item] = JSON.stringify(data[key][item]);
        }
        return ;
      }
      const dataIndex = fileData[0].data.findIndex(di => di[0] === item);
      // 初始每行数据，加入对应可以值
      if(dataIndex === -1) {
        const data = new Array(i + 1).fill('');
        data[0] = item;
        fileData[0].data.push(data);
      };
      const di = dataIndex !== -1 ? dataIndex : (fileData[0].data?.length - 1);
      // 补充缺少数据
      if (i + 1 > fileData[0].data[di].length) {
        const notDataNum = i + 1 - fileData[0].data[di].length;
        const data = new Array(notDataNum).fill('');
        fileData[0].data[di] = fileData[0].data[di].concat(data);
      }
      // 设置对应key的数据值
      fileData[0].data[di].push(data[key][item]);
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
  writeFileToExcel(filesData, {
    output: options.output,
    isMoToSo: options.multilevelObjectDeconstruct
  });
}