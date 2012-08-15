/*
	t-mac
	@author  Zheng Li <lizheng@lizheng.me>
	@license MIT
	@version 0.1.0
*/

/* Public Pages */

var fs    = require('fs'), 
	mongo = require('mongodb'),
	im    = require('imagemagick'),
	conf  = require('../config').conf();

exports.guid = function(type) {
	var S4 = function() { return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1); };
			
	if(type === 'long') {
		return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
	} else {
		return (S4() + S4());
	}
};

exports.log = function(input) {
	console.log('+ ' + '[' + (new Date()).toLocaleString() + '] ' + JSON.stringify(input));
};

exports.reqinfo = function(req) {
	var ip_address;
	try { ip_address = req.headers['x-forwarded-for']; }
	catch (error) { ip_address = req.connection.remoteAddress; }
	
	return { 
		'ua': req.headers['user-agent'] || 'N/A', 
		'ip' : ip_address || 'N/A' 
	};
};

exports.index = function(req, res) {
	res.render('public.index.ejs', { 
		'title': 'TimeLine'
	});
};

exports.upload = function(req, res) {
	res.render('public.upload.ejs', { 
		'title': 'Contribute'
	});
};

exports.imagestimeline = function(req, res) {
	var results = { 'images': [] }, per_page_count = 10;
	var filters = {
		'category': req.params.category,
		'last_id': req.params.lastid,
		'time': req.params.time,
		'module': req.params.module
	};

	//console.log(filters.last_id == -1)

	if(filters.last_id == '-1') {
		filters.last_id = 'ffffffffffffffffffffffff';
	}

	if(filters.time) {
		filters.time = filters.time.split('-');
	}

	if(filters.module) {
		filters.module = filters.module.split('-');
	}

	exports.log('Timeline Request: filter = ');
	exports.log(filters);

	// MongoDB.
	var server = new mongo.Server(conf.db.address, conf.db.port, {auto_reconnect: conf.db.auto_reconnect});
	var db = new mongo.Db('TMAC', server);

	db.open(function(error, db) {
		if(!error) {
			db.collection('images', function(err, collection) {
				var cursor, ObjectID = mongo.ObjectID;
				var criteria = { 
					'_id': { '$lt': new ObjectID(filters.last_id) }
				};
				
				if(filters.category !== 'null') { criteria['category'] = filters.category }
				if(filters.time[0] && filters.time[0] !== 'null') { criteria['date'] = filters.time; }
				if(filters.module[0] && filters.module[0] !== 'null') { criteria['module'] = { '$in': filters.module } }

				//console.log(criteria);

				cursor = collection.find(criteria);
				cursor.sort({ '_id': -1 }).limit(per_page_count).toArray(function(error, docs) {
					if(error) {
						console.log(error);
					}

					results.images = docs;
					res.json(results);
					db.close();
				});
			});
		}
	});
};

exports.apihide = function(req, res) {
	var data = {
		'_id': req.body.id,
		'guid': req.body.guid,
		'reason': req.body.reason
	};

	if(!data['_id'] || !data['guid'] || !data['reason']) {
		res.end('Bad Request');
		return;
	}

	var server = new mongo.Server(conf.db.address, conf.db.port, {auto_reconnect: conf.db.auto_reconnect});
	var db = new mongo.Db('TMAC', server);
	var info = exports.reqinfo(req), ObjectID = mongo.ObjectID, record;

	//console.log(data)
	exports.log('Hide Request: data = ');
	exports.log(data);

	db.open(function(error, db) {
		if(!error) {
			db.collection('images', function(err, collection) {

				collection.update({
					'_id': new ObjectID(data['_id']),
					'files.guid': data['guid']
				}, {
					$set: {
						'files.$.status': 'hide',
						'files.$.hide_ip': info.ip,
						'files.$.hide_ua': info.ua
					}
				}, { safe: true }, function(error) {
					if(error) {
						console.log(error);
					} else {
						console.log('hide ok');
					}
					
					res.end('OK');
					db.close();
				});		
			});
		}
	});

	//console.log(data);

	//res.end('OK');
};

exports.apiupload = function(req, res) {
	var files = req.files.file, names = [], target_path, tmp_path, total = files.length, current = 0, timer;
	var data = JSON.parse(req.body.payload);

	// Single image.
	if(!(files instanceof Array)) {
		files = [ req.files.file ];
		total = 1;
	}

	var wait = function() {
		if(current === total) {
			clearTimeout(timer);
			timer = undefined;

			// MongoDB.
			var server = new mongo.Server(conf.db.address, conf.db.port, {auto_reconnect: conf.db.auto_reconnect});
			var db = new mongo.Db('TMAC', server);
			var info = exports.reqinfo(req);

			var payload = {
				'files': names,
				'create': (new Date()).getTime(),
				'ip': info.ip, 'ua': info.ua
			};

			for(var i in data) { payload[i] = data[i]; }

			exports.log('Upload Request: payload = ');
			exports.log(payload);

			db.open(function(error, db) {
				if(!error) {
					db.collection('images', function(err, collection) {
						collection.insert(payload);
						db.close();
					});
				}
			});

			res.end('OK');
		} else {
			timer = setTimeout(wait, 10);
		}
	};

	var guid;
	for(var i = 0; i < files.length; ++i) {
		tmp_path = files[i].path;
		guid = exports.guid('long');

		target_path = './public/uploads/' + guid + files[i].name.substr(files[i].name.lastIndexOf('.'));
		target_path2 = './public/uploads/' + guid + '-small' +files[i].name.substr(files[i].name.lastIndexOf('.'));
		
		names.push({ 
			'original': target_path.replace('/public/', '/'),
			'thumbnail': target_path2.replace('/public/', '/'),
			'guid': guid,
			'status': 'show'
		});

		//console.log(names);

		var process = function(tmp, target, target2) {
			fs.rename(tmp, target, function(error) {
				if (error) {
					current++;
					exports.log('Error when rename uploaded file:' + error);
					return;
				}

				var resize = function(from, to) {
					im.resize({
						srcPath: from,
						dstPath: to,
						width: '240x'
					}, function(error, stdout, stderr) {
						if (error) {
							current++;
							console.log(error);
							return;
						}

						current++;
						//console.log('resized ' + from + ' to fit, ');
					});
				};

				resize(target, target2);
			});
		};

		process(tmp_path, target_path, target_path2);
	}

	wait();
};
