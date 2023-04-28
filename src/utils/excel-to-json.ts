import xlsx from 'node-xlsx';
import * as fs from 'fs-extra';
import { OptionValues } from 'commander';
import chalk from 'chalk';
import { isExportType, typeToName } from '../constants';
import { format } from 'prettier';
import { prettierConfig } from '../constants/prettierrc';

function dataToJson(data: any[], {
  rule,
  key: isKey,
  notMatchFilename
}: {
  rule: string,
  key: boolean,
  notMatchFilename: boolean
}) {
  /**
   * excel读取规制解析，文件名为第一行(小写字母-大写字母 或 整个单元格内容)
   * rule 0:[4,15]表示第一列为语言key，第五列到第十九列为语言包数据，默认为0:[1,整行数据长度]
   */
  const [key, interval] = rule.split(':');
  const intervals = interval ? JSON.parse(interval) : [1];
  // 记录文件导成json的数据
  let jsonData:any = {};
  data.forEach(sheet => {
    // 记录每个标签页的语言key
    let fileKeys: any[] = [];
    sheet.data.forEach((row: any[], rowi: number) => {
      if (rowi === 0) {
        // 按第一行生成语言对象key
        row.splice(intervals[0], intervals[1] ?? row.length).forEach((col, coli) => {
          if (notMatchFilename) {  // 记录语言key
            fileKeys.push(col);
          } else {
            fileKeys.push(String(col).match(/[a-z]+-[A-Z]+/g) ? col.match(/[a-z]+-[A-Z]+/g)[0] : col);
          }
          jsonData[fileKeys[coli]] = {};  // 设置语言对象key
        });
      } else {
        // 将第一行一下的数据生成语言json对象
        if (isKey) {
          const data = row.splice(intervals[0], intervals[1] ?? row.length);
          fileKeys.forEach((filekey, i) => {
            console.log(chalk.green(`${sheet.name} | ${filekey} | ${row[key as any]} | ${data[i] ?? ''}`));  // 打印数据日志
            jsonData[filekey][row[key as any]] = data[i] ?? '';
          });
        } else {
          row.splice(intervals[0], intervals[1] ?? row.length).forEach((col, coli) => {
            console.log(chalk.green(`${sheet.name} | ${fileKeys[coli]} | ${row[key as any]} | ${col}`));  // 打印数据日志
            if(!fileKeys[coli] || !row[key as any]) return; // 没有文件key 或 数据key，跳过该列
            jsonData[fileKeys[coli]][row[key as any]] = col;  // 设置每行数据到对应语言对象
          });
        }
      }
    });
  });
  return jsonData;
}

function writeFile(jsonData: { [x: string]: any; }, output: string, add: any) {
  // 获取输出路径及文件类型，默认为单前文件夹ts文件
  const [path, fileOrSuffix] = output.split('**');
  const [filename, suffix] = fileOrSuffix.split('.');
  Object.keys(jsonData).forEach(key => {
    console.log('正在写入文件:', path + key + fileOrSuffix);
    let old = {};
    // 增量获取源文件数据
    if(add) {
      try {
        const fileData = fs.readFileSync(path + key + fileOrSuffix, { flag: 'r', encoding: 'utf-8' }).replace(/\;/g, '');
        old = isExportType.includes(suffix) ? eval('(' + fileData.split('export default ')[1] + ')') : JSON.parse(fileData);
      } catch (error) {
        console.error(chalk.red('不出在源文件:', path + key + fileOrSuffix, '，改文件只有单前文档数据'))
      }
    }
    // 格式化json数据
    const data = (isExportType.includes(suffix) ? 'export default ' : '') + JSON.stringify({...old, ...jsonData[key]}, undefined, '  ');
    // 查看文件夹是否存在
    fs.stat(path + key, async (_, stats) => {
      if (!stats && filename) {
        // 不存在创建文件夹
        fs.mkdir(path + key, { recursive: true }, err => {
          if (err) {
            console.error(chalk.red(err));
          } else {
            // 文件写入
            fs.writeFile(
              path + key + fileOrSuffix,
              format(data, {
                parser: typeToName[suffix] ?? 'typescript',
                ...prettierConfig
              }), (err: any) => {
                if (err) {
                  console.error(chalk.red(err));
                }
              }
            );
          }
        });
      } else {
        // 文件写入
        fs.writeFile(
          path + key + fileOrSuffix,
          format(data, {
            parser: typeToName[suffix] ?? 'typescript',
            ...prettierConfig
          }), (err: any) => {
            if (err) {
              console.error(chalk.red(err));
            }
          }
        );
      }
    });
  });
}

export function excel2json(options: OptionValues) {
  // 读取文件
  const workSheetsFromFile = xlsx.parse(options.input);
  // 将数组转成json对象
  const jsonData = dataToJson(workSheetsFromFile, {
    rule: options.rule,
    key: options.key,
    notMatchFilename: options.notMatchFilename
  });
  // 将对象写入文件
  writeFile(jsonData, options.output, options.add);
}