const xlsx = require('node-xlsx');
const fs = require('fs');

function dataToJson(data, rule) {
  /**
   * excel读取规制解析，文件名为第一行(小写字母-大写字母 或 整个单元格内容)
   * rule 0:[4,15]表示第一列为语言key，第五列到第十九列为语言包数据，默认为0:[1,整行数据长度]
   */
  const [key = 0, interval] = rule ? rule.split(':') : [0, [1]];
  const intervals = interval ? JSON.parse(interval) : [1];
  // 记录文件导成json的数据
  let jsonData={};
  data.forEach(sheet => {
    // 记录每个标签页的语言key
    let langudgeKeys = [];
    sheet.data.forEach((row, rowi) => {
      if (rowi === 0) {
        // 按第一行生成语言对象key
        row.splice(intervals[0], intervals[1] ?? row.length).forEach((col, coli) => {
          langudgeKeys.push(col.match(/[a-z]+-[A-Z]+/g)[0] ?? col);  // 记录语言key
          jsonData[langudgeKeys[coli]] = {};  // 设置语言对象key
        });
      } else {
        // 将第一行一下的数据生成语言json对象
        row.splice(intervals[0], intervals[1] ?? row.length).forEach((col, coli) => {
          console.log(`${sheet.name} | ${langudgeKeys[coli]} | ${row[key]} | ${col}`);  // 打印数据日志
          if(!langudgeKeys[coli]) return; // 没有语言包key，跳过该列
          jsonData[langudgeKeys[coli]][row[key]] = col;  // 设置每行数据到对应语言对象
        });
      }
    });
  });
  return jsonData;
}

function writeFile(jsonData, output, add) {
  // 获取输出路径及文件类型，默认为单前文件夹ts文件
  const [path, suffix] = output ? output.split('**') : ['./', '.ts'];
  // 需要export的文件类型
  const isExportType = ['.ts', '.js'];
  Object.keys(jsonData).forEach(key => {
    console.log('正在写入文件:', path + key + suffix);
    let old = {};
    // 增量获取源文件数据
    if(add) {
      try {
        const fileData = fs.readFileSync(path + key + suffix, { flag: 'r', encoding: 'utf-8' });
        old = JSON.parse(isExportType.includes(suffix) ? fileData.split('export default ')[1] : fileData);
      } catch (error) {
        console.log(error)
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
  const workSheetsFromFile = xlsx.parse(options.input);
  const jsonData = dataToJson(workSheetsFromFile, options.rule);
  writeFile(jsonData, options.output, options.add);
}

module.exports = {
  excel2json
}