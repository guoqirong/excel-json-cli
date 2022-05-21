# 命令导出数据

用于把表格数据导成json数据，可支持json、ts和js，或者，用于把json数据导成表格数据，可支持json、ts和js。

## 1、excel2json 命令

用于把表格数据导成json数据，可支持json、ts和js。

### 选项说明

| 选项                                        | 说明                                                         |
| ------------------------------------------- | ------------------------------------------------------------ |
| -v, --version                               | 查看工具版本                                                 |
| -i, --input \<file\>                        | 必填，输入要导成json的xls、xlsx文件，可带路径                |
| -r, --rule \<key-col-num:key-col-interval\> | 选填，解析表格规制，key-col-num为数据key列索引，key-col-interval为数据范围 （如：0:[4,15]表示第一列为key，第五列到第十九列为数据），默认为0:[1] |
| -a, --add                                   | 选填，增量导出数据，先获取原有数据                           |
| -o, --output \<path\>                       | 选填，输出文件路径及后缀配置，文件名以\**代替，文件存储路径必须存在，默认为./**.ts |
| -h, --help                                  | 查看命令帮助文档                                             |

### 命令说明

| 命令 | 说明             |
| ---- | ---------------- |
| help | 查看命令帮助文档 |

### 示例

文档

| key      | zh-CN | ar-AR   | de-DE      | en-US    | es-ES     | fr-FR     | id-ID    | ms-MS    | pt-PT     | ru-RU   | th-TH  | tr-TR   | vi-VI    | zh-HK | zh-TW |
| -------- | ----- | ------- | ---------- | -------- | --------- | --------- | -------- | -------- | --------- | ------- | ------ | ------- | -------- | ----- | ----- |
| France   | 法国  | فرنسا   | Frankreich | France   | Francia   | France    | Prancis  | Perancis | França    | Франция | ฝรั่งเศส | Fransa  | Pháp     | 法國  | 法國  |
| Thailand | 泰国  | تايلاند | Thailand   | Thailand | Tailandia | Thaïlande | Thailand | Thailand | Tailândia | Таиланд | ไทย    | Tayland | Thái Lan | 泰國  | 泰國  |

命令

`excel2json -i ./local.xlsx -o ./**.ts -r 0:[1,15] -a`

## 2、json2excel 命令

用于把表格数据导成json数据，可支持json、ts和js。

### 选项说明

| 选项                  | 说明                                                         |
| --------------------- | ------------------------------------------------------------ |
| -v, --version         | 查看工具版本                                                 |
| -i, --input <path\>   | 必填，输入文件路径及后缀配置，文件名以\**代替，文件支持ts、js和json文件，如：./**.ts |
| -o, --output \<file\> | 选填，输出要导成的xls、xlsx文件，可带路径，默认为local.xls (default: "local.xls") |
| -h, --help            | 查看命令帮助文档                                             |

### 命令说明

| 命令 | 说明             |
| ---- | ---------------- |
| help | 查看命令帮助文档 |

### 示例

ts文件示例

`export default {`

 `"France": "法国",`

 `"Thailand": "泰国"`

`}`

命令

`json2excel -i ./**.ts -o local.xlsx  `