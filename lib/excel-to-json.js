const xlsx = require('node-xlsx');
const fs = require('fs');

function dataToJson(data, rule) {
  /**
   * excel读取规制解析，文件名为第一行(小写字母-大写字母 或 整个单元格内容)
   * rule 0:[4,15]表示第一列为语言key，第五列到第十九列为语言包数据，默认为0:[1,整行数据长度]
   */
  const [key, interval] = rule.split(':');
  const intervals = interval ? JSON.parse(interval) : [1];
  // 记录文件导成json的数据
  let jsonData={};
  data.forEach(sheet => {
    // 记录每个标签页的语言key
    let fileKeys = [];
    sheet.data.forEach((row, rowi) => {
      if (rowi === 0) {
        // 按第一行生成语言对象key
        row.splice(intervals[0], intervals[1] ?? row.length).forEach((col, coli) => {
          fileKeys.push(String(col).match(/[a-z]+-[A-Z]+/g) ? col.match(/[a-z]+-[A-Z]+/g)[0] : col);  // 记录语言key
          jsonData[fileKeys[coli]] = {};  // 设置语言对象key
        });
      } else {
        // 将第一行一下的数据生成语言json对象
        row.splice(intervals[0], intervals[1] ?? row.length).forEach((col, coli) => {
          console.log(`${sheet.name} | ${fileKeys[coli]} | ${row[key]} | ${col}`);  // 打印数据日志
          if(!fileKeys[coli] || !row[key]) return; // 没有文件key 或 数据key，跳过该列
          jsonData[fileKeys[coli]][row[key]] = col;  // 设置每行数据到对应语言对象
        });
      }
    });
  });
  return jsonData;
}

function writeFile(jsonData, output, add) {
  // 获取输出路径及文件类型，默认为单前文件夹ts文件
  const [path, suffix] = output.split('**');
  // 需要export的文件类型
  const isExportType = ['.ts', '.js'];
  Object.keys(jsonData).forEach(key => {
    console.log('正在写入文件:', path + key + suffix);
    let old = {};
    // 增量获取源文件数据
    if(add) {
      try {
        const fileData = fs.readFileSync(path + key + suffix, { flag: 'r', encoding: 'utf-8' }).replace(/\;/g, '');
        old = isExportType.includes(suffix) ? eval('(' + fileData.split('export default ')[1] + ')') : JSON.parse(fileData);
      } catch (error) {
        console.log('不出在源文件:', path + key + suffix, '，改文件只有单前文档数据')
      }
    }
    // 格式化json数据
    const data = (isExportType.includes(suffix) ? 'export default ' : '') + JSON.stringify({...old, ...jsonData[key]}, '', '  ');
    // 文件写入
    fs.writeFile(path + key + suffix, data, (err) => {
      if (err) {
        console.error(err);
      }
    });
  });
}

function excel2json(options) {
  // 读取文件
  const workSheetsFromFile = xlsx.parse(options.input);
  // 将数组转成json对象
  const jsonData = dataToJson(workSheetsFromFile, options.rule);
  // 将对象写入文件
  writeFile(jsonData, options.output, options.add);
}

module.exports = {
  excel2json
}