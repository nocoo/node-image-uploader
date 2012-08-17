# t-mac

t-mac, a time machine

## 功能

本意是想做一个按照时间保留设计界面作品的网站。展现形式为一个时间轴，可以无限下拉。

## 依赖

 * node.js
 * mongodb
 * express
 * ejs
 * imagemagick

## 安装

因为Express 3.0以上版本要求模板模块自己处理嵌入子模板，而EJS暂时不支持的缘故，这里临时使用Express 2.5.11版本，见谅。
mongodb请安装在本机，使用默认设置。

如果发现上传后图片缩略图不能显示，一个很可能的原因是imagemagick库没有安装。请执行

	sudo aptitude install imagemagick

如果发现上传多张图片的时候，无法完成上传，出现HTTP 413 Request Entity Too Large错误，那么一定是Web Server设置的上传大小太小了。解决这个问题，可以去配置文件做相应的设置。比如我在我的Nginx中nginx.conf的http段里做了如下设置：

	client_max_body_size 80m;

## License

(The MIT License)

Copyright (c) 2010 Charlie Robbins, Mikeal Rogers, Fedor Indutny, & Marak Squires

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.