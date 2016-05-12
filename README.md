# Material Template Scaffold
侯斯特图文模板开发基础框架

###使用方法

1. 安装node.js

	[https://nodejs.org/](https://nodejs.org/)

1. 安装grunt-cli

		npm install -g grunt-cli
		// 可能需要 sudo

1. 安装框架依赖的插件

		// 在框架根目录下执行
		npm install -d

1. 启动本地测试服务器，开发模板

		grunt serve
		
1. 开发及测试完毕后，打包模板文件

		grunt build
		// 会在框架根目录生成dist文件，
		// 包含模板文件（template.html）和模板字段配置文件（config.json）