//定义自己封装的一些工具函数
var langFun = (function() {
	var module = {};

	//定时器:每隔ms毫秒调用一次callback,可以设置count计数器来控制最多调用多少次
	module.setInterval = function(callback, ms, count) {
		var r = {},
			fun = function() {
				count = (count !== undefined) ? count - 1 : count;
				if (callback(count === 0) !== false) {
					if (r.ref && (count === undefined || count > 0)) {
						r.ref = setTimeout(fun, ms);
					}
				}
			};
		r.ref = setTimeout(fun, ms); //启动调用一次后, fun自己调用自己
		return r;
	};

	//取消定时器
	module.clearInterval = function(r) {
		if (r !== undefined && r.ref) {
			clearTimeout(r.ref);
			r.ref = undefined;
		}
	};

	/**
	 * 定时器对象：该对象保持唯一一个定时器，若定时器没被启动或已结束，可通过start方法重启定时器
	 * callback 回调函数
	 * ms 定时器的时间间隔
	 * count 定时器的启动次数
	 */
	module.createTimer = function(callback, ms, count) {
		var interval, timer = {};

		timer.start = function() {
			if (interval === undefined) {
				interval = module.setInterval(function() {
					if (callback() === false) {
						interval = undefined;
						return false;
					}
				}, ms, count);
			}
		};
		timer.close = function() {
			module.clearInterval(interval);
			interval = undefined
		};

		timer.restart = function(newCallback, newMs, newCount) {
			callback = newCallback || callback;
			ms = newMs || ms;
			count = newCount || count;
			timer.close();
			timer.start();
		};
		return timer;
	};
	//判断value是否是Array，返回值是boolean
	module.isArray = function(value) {
		
		return Object.prototype.toString.apply(value) === "[object Array]";
	};
	//深度克隆，防止修改原数据，主要是做remind时不修改sudoku 的数据
	module.clone = function(obj) {
		var o, i = 0,
			len = 0,
			k;
		switch (typeof obj) {
			case 'undefined':
				break;
			case 'string':
				o = obj.toString();
			case 'number':
				o = obj - 0;
				break;
			case 'boolean':
				o = obj;
				break;
			case 'object':
				if (obj === null) {
					o = null;
				} else {
					if (langFun.isArray(obj)) {
						o = [];
						for (i = 0,len = obj.length; i < len; i++) {
							o.push(this.clone(obj[i]));
						}
					} else {
						o = {};
						for (k in obj) {
							if (obj.hasOwnProperty(k)) {
								o[k] = this.clone(obj[k]);
							}
						}
					}
				}
				break;
			default:
				o = obj;
				break;
		}
		return o;
	};

	//随机函数
	module.rand = (function() {
		var today = new Date();
		var seed = today.getTime();

		function rnd() {
			seed = (seed * 9301 + 49297) % 233280;
			return seed / (233280.0);
		}
		return function rand(number) {
			return Math.ceil(rnd(seed) * number);
		};
	}());
	return module;
}());