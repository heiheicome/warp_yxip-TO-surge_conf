
//配合 https://gitlab.com/Misaka-blog/warp-script/-/tree/main/files/warp-yxip 【感恩】使用 批量输出wireguard节点， 并生成简洁 surge配置文件  直接使用
//想要输出几个节点就写几 
var num = 100
//网上找或者wgcf生成自己的私钥
const private_key = ""
//导出的配置文件路径 想放哪里放哪里
const export_conf_path = './my_surge.conf'

const fs = require('fs')
const csv = require('csv-parser');
const results = [];
var node_lists = ""
var confs = ""
var proxy_group = ""



//配置片段首部，[General] ，[Rule] 固定格式  自己去任何地方找一下懒人配置copy一下
var temp001 = `[General]
allow-wifi-access = false
http-listen = 127.0.0.1:9876
socks5-listen = 127.0.0.1:7654
# > Internet 测试 URL
internet-test-url = http://www.aliyun.com
# > 代理测速 URL
proxy-test-url = http://cp.cloudflare.com/generate_204
# > 测试超时（秒）
test-timeout = 5
[Rule]
DOMAIN-SUFFIX,nssurge.com,REJECT
IP-CIDR,45.32.72.77/32,REJECT,no-resolve
DOMAIN-SET,https://cdn.jsdelivr.net/gh/Loyalsoldier/surge-rules@release/private.txt,DIRECT
DOMAIN-SET,https://cdn.jsdelivr.net/gh/Loyalsoldier/surge-rules@release/reject.txt,REJECT
RULE-SET,SYSTEM,DIRECT
DOMAIN-SET,https://cdn.jsdelivr.net/gh/Loyalsoldier/surge-rules@release/tld-not-cn.txt,PROXY
DOMAIN-SET,https://cdn.jsdelivr.net/gh/Loyalsoldier/surge-rules@release/gfw.txt,PROXY
RULE-SET,https://cdn.jsdelivr.net/gh/Loyalsoldier/surge-rules@release/telegramcidr.txt,PROXY
FINAL,DIRECT,dns-failed`


fs.createReadStream('result.csv')
  .pipe(csv())
  .on('data', (data) => {  
  	//console.log(results.length)
  	//如果数据长度大于10  就不做操作
  	if ( results.length < num ) {
  		results.push(data['IP:PORT'])
  	}else{
  		// 提前结束读取？才多大的文件，又不是不能用
  	}
  })
  .on('end', () => {
     // console.log(results);
     print(results)
     //输出完整配置
     //console.log(temp001)
     //console.log(node_lists)
     //console.log(confs)
     let my = temp001 +"\n"+'[Proxy Group]'+ "\n" + "PROXY = url-test,"+proxy_group+"url = http://cp.cloudflare.com/generate_204"+"\n"+"[Proxy]"+node_lists+confs
     //将结果写入 .conf
     // console.log(my)
	fs.writeFile(export_conf_path,my, 
	// fs.writeFile('my_surge.conf',my, 
	    // 写入文件后调用的回调函数
	    function(err) {  
	        if (err) throw err; 
	        // 如果没有错误
	        console.log(" successfully.") 
	 });
  });

//操作数据 写入节点具体信息
function print(list){
	//把results的数据写入模版中

	for (var i = list.length - 1; i >= 0; i--) {
		let node = `wg${i} = wireguard, section-name=myproxy${i}`
		node_lists = node_lists +'\n'+ node
		proxy_group = proxy_group + `wg${i}, `

		let conf = `[WireGuard myproxy${i}]
private-key = ${private_key}
self-ip = 172.6.0.23
self-ip-v6 = 2606:4700:110:86b8:2a22:73ce:408:d976
dns-server = 1.1.1.1
mtu = 1420
peer = (public-key = bmXOC+F1FxEMF9dyiK2H5/1SUtzH0JuVo51h2wPfgyo=, allowed-ips = "0.0.0.0/0, ::0/0", endpoint = ${list[i]}, keepalive = 30)`
    confs = confs +"\n"+ conf
	}
}