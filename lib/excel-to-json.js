const xlsx = require('node-xlsx');

function dataToJson(data, rule) {
  const [key = 0, interval] = rule.split(':');
  const intervals = interval ? JSON.parse(interval) : [1];
  console.log(key, JSON.parse(interval));
  let jsonData={};
  data.forEach(sheet => {
    let langudgeKeys = [];
    sheet.data.forEach((row, rowi) => {
      if (rowi === 0) {
        row.splice(intervals[0], intervals[1] ?? row.length).forEach((col, coli) => {
          langudgeKeys.push(col.match(/[a-z]+-[A-Z]+/g)[0]);
          jsonData[langudgeKeys[coli]] = {};
        });
      } else {
        if (rowi === 1) {
          console.log(row.splice(intervals[0], intervals[1] ?? row.length))
          row.splice(intervals[0], intervals[1] ?? row.length).forEach((col, coli) => {
            console.log(col, jsonData[langudgeKeys[coli]])
            // jsonData[langudgeKeys[coli]][row[key]] = col;
          });
        }
      }
    })
    // .match(/[a-z]+-[A-Z]+/g)
    // console.log(item.name, item.data, item.data[0] && item.data[0][4].match(/[a-z]+-[A-Z]+/g))
  })
  console.log(jsonData)

}

function excel2json(options) {
  console.log(options);
  const workSheetsFromFile = xlsx.parse(options.input);
  dataToJson(workSheetsFromFile, options.rule)
}

module.exports = {
  excel2json
}