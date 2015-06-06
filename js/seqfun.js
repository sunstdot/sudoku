/*global pi, app,console */
pi.mod.define("app.seqfun",function(){
	"use strict";
	var sf = {};
	(function () {
		var makeArgs = function (funArgs, obj) {
			var i, value, keys, ki, args, parent, path, fail;
			args = [];
			for (i = 0; i < funArgs.length; ++i) {
				value = funArgs[i];
				if (typeof value === "string" && value[0] === '$') {
					parent = obj;
					path = ["obj"];
					fail = false;
					keys = value.substring(1).split(".");
					for (ki = 0; ki < keys.length; ++ki) {
						if (!parent) {
							app.log.debugInfo("sf error, wrong argument:[" + value + "], [" + path.join(".") + "] is undefiend!");
							fail = true;
							break;
						}
						parent = parent[keys[ki]];
						path.push(keys[ki]);
					}
					if (!fail) {
						value = parent;
					}
				}
				args.push(value);
			}
			return args;
		}, makeThen = function (defer, argList, obj) {
			var fun = argList[0],
				args = [].slice.call(argList, 1);

			return function () {
				fun.apply(undefined, [defer].concat(makeArgs(args.concat([].slice.call(arguments)), obj)));
			};
		}, makeDone = function (argList, obj) {
			var fun = argList[0],
				args = [].slice.call(argList, 1);

			return function () {
				fun.apply(undefined, makeArgs(args.concat([].slice.call(arguments)), obj));
			};
		};

		// sf.start([obj])
		//     .then(#funthen,[arg1,arg2,...])
		//     .then(#funthen,[arg1,arg2,...])
		//     .then(#funthen,[arg1,arg2,...])
		//     .done(#fundone,[arg1,arg2,...])   // 完成函数,可选
		//     .fail(#funfail)                 // 错误函数,可选,一旦上面的过程中出错直接跳转到fail
		//
		// #defer : function ([error])
		//         参数说明: error 是否出错(非0也非空表示出错)
		// #funthen : function (#defer, arg1,arg2,...)
		// #fundone : function (arg1,arg2,...)
		// #funfail : function (error)
		// obj是环境上下文，不传则内部创建一个
		// arg*的值可以是普通的值，则取即时值保存（即时取值)
		//       也可以是obj的属性路径，如 "$param.abc"表示使用 obj.param.abc 在使用时的值做为参数（延时取值)
		//       数值可以使用 "$param.list.1" 来取指定下标的值
		// 在defer.obj保存了start时的obj
		sf.start = function (obj) {
			var lists = [],
				index = 0,
				defer,
				first;

			if (obj === undefined) {
				obj = {};
			}

			defer = function (error) {
				var fun;
				if (index >= lists.length) {
					return;
				}

				fun = lists[index++];
				if (error === undefined || error === 0) {
					if (fun.__is_fail === true) {
						defer.apply(undefined, [].slice.call(arguments));
						return;
					}
					fun.apply(undefined, [].slice.call(arguments, 1));
				} else {
					if (fun.__is_fail !== true) {
						defer.apply(undefined, [].slice.call(arguments));
						return;
					}
					fun.call(undefined, error);
				}
			};

			defer.obj = obj;

			first = function () {
				defer();
			};
			first.then = function () {
				lists.push(makeThen(defer, arguments, obj));
				return first;
			};
			first.done = function () {
				lists.push(makeDone(arguments, obj));
				delete first.then;
				delete first.done;
				return first;
			};
			first.fail = function (fun) {
				var funFail = function (error) {
					fun(error);
				};
				funFail.__is_fail = true;
				lists.push(funFail);
				delete first.then;
				delete first.fail;
				return first;
			};
			return first;
		};
	}());
	return sf;
});
