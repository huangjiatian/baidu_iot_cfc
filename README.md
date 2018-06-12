# baidu_iot_cfc
----------
###简介
----------
该样例代码展示了如何在函数计算（CFC）中，更新物影子属性以及查询并更新TSDB历史数据。
- 物管理：修改物影子ratio属性
- TSDB：查询prt并更新pap
###步骤
----------
1，下载代码，并替换index.js文件中的
- baseConfig.credentials.ak: 替换成你的access key
- baseConfig.credentials.sk: 替换成你的secret key
- tsdbConfig.endpoint: 换成你自己TSDB的地址，例如： http://mytsdb.tsdb.iot.bj.baidubce.com
- iotdmConfig.endpoint: 按照实际区域选择bj或gz，例如：http://iotdm.bj.baidubce.com

2，将node_modules目录，index.js，iotdm_client.js共计三项压缩成zip

3，登录百度云控制台，创建函数计算（CFC）
- 填写函数名称
- 运行语言：node.js 8.x
- 编辑类型：上传.zip文件
- 请选择文件：上传刚才打包的zip文件
- 其他不需要指定
- 创建

4，测试
- 在函数列表点击刚才创建的CFC函数
- 右上角有测试按钮
- 输入事件（事件及相关字段解释见5）
- 点击运行
- 登录物管理查看物影子数据，已经更改
- 登录TSDB查看相关数据，已经更改

5，事件
在测试框中输入的事件为如下的JSON字符串
``` json
{
	"clientid": "99960001",
	"ratio": 100,
	"from": 1525104000000,
	"to": 1525276800000
}
```
- clientid：需要修改的物影子名称
- ratio：修改后的ratio值
- from：Unix时间戳
- to：大于from的Unix时间戳（用于指定需要修改的TSDB数据的时间范围）