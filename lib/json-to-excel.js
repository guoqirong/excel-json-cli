const fs = require('fs');

function readDirFilesData(input) {
  // 获取输出路径及文件类型，默认为单前文件夹ts文件
  const [path, suffix] = input.split('**');
  // 需要export的文件类型
  const isExportType = ['.ts', '.js'];
  const files = fs.readdirSync(path || './').filter(item => {
    return item.endsWith(suffix);
  })
  let data = {};
  files.forEach(file => {
    const fileData = fs.readFileSync(file, { flag: 'r', encoding: 'utf-8' });
    data[file.split('.')[0]] = JSON.parse(isExportType.includes(suffix) ? fileData.split('export default ')[1] : fileData);
  })
  console.log(data)
}

function json2excel(options) {
  const filesData = readDirFilesData(options.input)
  console.log(options, filesData)
}

module.exports = {
  json2excel
}