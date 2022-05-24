const fs = require('fs');
const xlsx = require('node-xlsx');
const chalk = require('chalk');

function readDirFilesData(input) {
  // 获取输输入路径及文件类型
  const [path, suffix] = input.split('**');
  // 需要export的文件类型
  const isExportType = ['.ts', '.js'];
  console.log('数据读取中，请稍后...');
  // 读取文件夹文件列表
  const files = fs.readdirSync(path || './').filter(item => {
    return item.endsWith(suffix);
  })
  let data = {};
  // 将文件数据转成json数据
  files.forEach(file => {
    let fileData = fs.readFileSync(path + file, { flag: 'r', encoding: 'utf-8' });
    fileData = fileData.replace(/\;/g, '');
    try {
      data[file.split('.')[0]] = isExportType.includes(suffix) ? eval('(' + fileData.split('export default ')[1] + ')') : JSON.parse(fileData);
    } catch (error) {
      console.error(chalk.red(file, '该文件不是json，无法导出'))
    }
  });
  return data;
}

function writeFileToExcel(data, output) {
  // 表格初始数据
  const fileData = [{
    name: 'all data',
    data: []
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
  // 文件写入
  fs.writeFile(output, Buffer.from(buffer), (err) => {
    if (err) {
      console.error(chalk.red(err));
    }
  });
}

function json2excel(options) {
  // 读取文件夹数据
  const filesData = readDirFilesData(options.input);
  // 将数据写入excel文件
  writeFileToExcel(filesData, options.output);
}

module.exports = {
  json2excel
}