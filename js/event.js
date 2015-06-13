//事件处理模块，注册事件方便不同机构间的通信
var event = (function(){
	var module = {},
	createHandlerList = function(){
		var list,delIndex,size = 0,arr = [];
		list = function(e){
			var i,handler,r,n = arr.length;
			for(i=n-1;i>=0;i--){
				handler = arr[i];
				if(handler){
					try{
						r = handler(e);
					}catch(ex){
						console.log("event,ex:"+ex+"\nhandler:"+handler);
					}
					if(r === "BREAK"){
						r = false;
						break;
					}
				}
			}
			if(delIndex){
				for(i = delIndex+1;i<n;++i){
					handler = arr[i];
					if(handler){
						arr[delIndex] = handler;
						++delIndex;
					}
				}
				size = delIndex;
				arr.length = delIndex;
				delIndex = undefined;
			}
			return r;	
		};
		//获得事件处理器列表的长度
		list.size = function(){
			return size;
		};
		//添加事件处理器 {int} handler
		list.add = function(handler){
			arr.push(handler);
			size+=1;	
		};
		//移除事件处理器 {int} handler
		list.remove = function(handler){
			var i;
			for(i=arr.length;i>=0;--i){
				if(arr[i] === handler){
					arr[i] = undefined;
					size -= i;
					if(delIndex === undefined || delIndex > i){
						delIndex = i;
					}
					return true;
				}
			}
			return false;
		};
		return list;
	};

//创建事件处理列表
module.createHandlerTable = function(){
	var tableMod = {},table = {};  //table of type to handler_list
//获得事件处理器列表的长度
	tableMod.size = function(){
		var i,n=0;
		for(i in table){
			if(table.hasOwnProperty(i)){
				++n;
			}
		}
		return n;
	};
	//事件通知  {int|string} type 事件的类型 {object} e 事件
	tableMod.notify = function(type,e){
		var list = table[type];
		if(list !== undefined){
			return list(e);  //invoke:list = function(e)
		}
	};
	//添加事件处理器  {int} handler   {int | string|array} type 事件的类型
	tableMod.add = function(type,handler){
		var i,list;
		if(handler === undefined||type === undefined){
			return false;
		}
		if(langFun.isArray(type)){
			for(i = type.length - 1;i>=0;--i){
				list = table[type[i]];
				if(list === undefined){
					table[type[i]] = list = createHandlerList();
				}
				list.add(handler);
			}
		}else{
			list = table[type];
			if(list === undefined){
				table[type] = list = createHandlerList();
			}
			list.add(handler);
		}
		return true;
	};

	tableMod.destroy = function(){
		var type,handler,list;
		for(type in table){
			if(table.hasOwnProperty(type)){
				for(handle in list){
					if(list.hasOwnProperty(handle)){
						list.remove(handle);
					}
				}
				delete table[type];
			}
		}
	};
	//删除事件处理器 {int} handler   {int | string|array|undefined} type 事件的类型
	tableMod.remove = function(type,handler){
		var i,list,r = false;
		if(handler === undefined){
			if(type === undefined){
				return false;
			}
			if(langFun.isArray(type)){
				for(i = type.length-1;i>=0;--i){
					delete table[type[i]];
				}
			}else{
				delete table[type];
			}
			return true;
		}
		if(type === undefined){
			for(i in table){
				if(table.hasOwnProperty(i)){
					list = table[i];
					if(list.remove(handler)){
						r = true;
						if(list.size() === 0){
							delete table[i];
						}
					}
				}
			}
		}else if(langFun.isArray(type)){
			for(i = type.length - 1;i>=0;--i){
				list = table[typr[i]];
				if(list !== undefined){
					if(list.remove(handler)){
						r = true;
						if(list.size() === 0){
							delete table[type[i]];
						}
					}
				}
			}
		}else{
			list = table[type];
			if(list !== undefined){
				if(list.remove(handler)){
					r = true;
					if(list.size() === 0){
						delete table[type];
					}
				}
			}
		}
		return r;
	};
	return tableMod;
};


//创建事件处理器列表  return {list} 事件列表  见 createHandlerList
module.createHandlerList = createHandlerList;

//给一个对象建立事件监听接口  param {Object} obj
module.buildEventTable = function(obj){
	var listener = module.createHandlerTable();
	//注册事件处理器  type 事件类型  handler  事件处理器(function)
	obj.register = function(type,handler){
		listener.add(type,handler);
	}
	obj.unregister = function(type.handler){
		listener.remove(type,handler);
	}
	//事件通知
	obj.notify =function(eventName,eventParam){
		listener.notify(eventName,eventParam);
	};
	obj.eventDestroy = function(){
		listener.destroy();
	};
};
return module;

}())