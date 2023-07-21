
//配合 https://gitlab.com/Misaka-blog/warp-script/-/tree/main/files/warp-yxip 【感恩】使用 批量输出wireguard节点， 并生成简洁 surge配置文件  直接使用
//想要输出几个节点就写几 
var num = 40
//网上找或者wgcf生成自己的私钥

const private_key = "CLQJ+u6DuD/Y4/OpB6AzEOZCQERrNVcRhPkI+i21dkw="

//导出的配置文件路径 想放哪里放哪里
// 重点，yaml文件对制表符不容

const export_conf_path = './my_clash.yaml'

const fs = require('fs')
const csv = require('csv-parser');
const results = [];

var node_lists = ""

var proxies = "\nproxies:\n"



//配置片段首部
var temp001 = `
mixed-port: 9323
allow-lan: false
log-level: info
dns:
    enable: false
    ipv6: false
rule:
  MATCH,自动测试节点

proxy-groups:
  - name: 自动测试节点
    type: url-test
    url: http://www.aliyun.com
    interval: 300
    proxies:`




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
     let my = temp001 + node_lists + proxies 
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
		let node = `wireguard${i}`
		node_lists = node_lists +'\n      - '+ node

		// console.log(list[i])
		let tmp = list[i].split(":")
		let ip = tmp[0]
		let port = tmp[1]
		
		proxies = proxies +

		` - { name: '${node}', type: 'wireguard', server: '${ip}', port: '${port}', ip: '172.6.0.2', ipv6: '2606:4700:110:86b8:2a22:73ce:408:d976', private-key: '${private_key}', public-key: 'bmXOC+F1FxEMF9dyiK2H5/1SUtzH0JuVo51h2wPfgyo=', dns-server: '1.1.1.1', allowed-ips: "0.0.0.0/0, ::0/0", keepalive: 30, mtu: 1420, udp: true}\n`
	}
}




