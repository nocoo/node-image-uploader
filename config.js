/*
    t-mac
    @author  Zheng Li <lizheng@lizheng.me>
    @license MIT
    @version 0.1.0
*/

var pro = {}, dev = {};

/* Production */

pro.timeout = 600000;
pro.run = { 'port': '17757' };
pro.db = {
	'address': 'localhost',
	'port': 27017,
	'auto_reconnect': false
};

/* Development */

dev.timeout = 600000;
dev.run = { 'port': '17757' };
dev.db = {
	'address': 'localhost',
	'port': 27017,
	'auto_reconnect': false
};

exports.conf = function() {
	return dev;
	//return pro;
};
