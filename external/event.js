/*global pi */

/**
 * @name pi.event
 * @object
 * @namespace
 * @description 事件处理器模块，提供事件处理器列表, 事件处理器列表的顺序按照添加的反序进行事件处理，事件处理器返回false可以跳出处理。容许在处理过程中删除事件处理器
 */
pi.mod.define('pi.event', function () {
    "use strict";
    /** @exports module as pi.event */
    var module = {},

        createHandlerList = function () {
            /**
             * @name list
             * @class
             * @extends pi.event
             * @exports list as pi.event.$createHandlerList
             */
            var list, delIndex, size = 0,
                arr = [];
            list = function (e) {
                var i, handler, r, n = arr.length;

                for (i = n - 1; i >= 0; i--) {
                    handler = arr[i];
                    if (handler) {
                        try {
                            r = handler(e);
                       } catch (ex) {
                            if (pi.log) {
                                pi.log("pi.event, ex: " + ex+"\nhandler:"+handler);
                            }
                        }
                        if (r === "BREAK") {
                            r = false;
                            break;
                        }
                    }
                }
                if (delIndex) {
                    for (i = delIndex + 1; i < n; ++i) {
                        handler = arr[i];
                        if (handler) {
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
            /**
             * 获得事件处理器列表的长度
             */
            list.size = function () {
                return size;
            };
            /**
             * 添加事件处理器
             * @param  {int} handler
             */
            list.add = function (handler) {
                arr.push(handler);
                size += 1;
            };
            /**
             * 删除事件处理器
             * @param  {int} handler
             */
            list.remove = function (handler) {
                var i;
                for (i = arr.length - 1; i >= 0; --i) {
                    if (arr[i] === handler) {
                        arr[i] = undefined;
                        size -= 1;
                        if (delIndex === undefined || delIndex > i) {
                            delIndex = i;
                        }
                        return true;
                    }
                }
                return false;
            };

            return list;
        };

    /**
     * 创建事件处理器表 {@link pi.event.createHandlerTable}
     * @return {list} 事件列表，见{@link pi.event.createHandlerTable}
     */
    module.createHandlerTable = function () {
        var tableMod = {}, table = {}; // table of type to handler_list
        /**
         * 获得事件处理器列表的长度
         */
        tableMod.size = function () {
            var i, n = 0;
            for (i in table) {
                if (table.hasOwnProperty(i)) {
                    ++n;
                }
            }
            return n;
        };

        /**
         * 事件通知
         * @param  {int | string}   type 事件的类型
         * @param  {object} e            事件
		 * @return {*}
         */
        tableMod.notify = function (type, e) {
            var list = table[type];
            if (list !== undefined) {
                return list(e); // invoke: list = function (e)
            }
        };
        /**
         * 添加事件处理器
         * @param  {int} handler
         * @param  {int | string | array}   type 事件的类型
         */
        tableMod.add = function (type, handler) {
            var i, list;
            if (handler === undefined || type === undefined) {
                return false;
            }
            if (pi.lang.isArray(type)) {
                for (i = type.length - 1; i >= 0; --i) {
                    list = table[type[i]];
                    if (list === undefined) {
                        table[type[i]] = list = createHandlerList();
                    }
                    list.add(handler);
                }
            } else {
                list = table[type];
                if (list === undefined) {
                    table[type] = list = createHandlerList();
                }
                list.add(handler);
            }
            return true;
        };

        tableMod.destroy = function () {
            var type, handle, list;
            for (type in table) {
                if (table.hasOwnProperty(type)) {
                    list = table[type];
                    for (handle in list) {
                        if (list.hasOwnProperty(handle)) {
                            list.remove(handle);
                        }
                    }
                    delete table[type];
                }
            }
        };
        /**
         * 删除事件处理器
         * @param  {int} handler
         * @param  {int | string | array | undefined}   type 事件的类型
         */
        tableMod.remove = function (type, handler) {
            var i, list, r = false;
            if (handler === undefined) {
                if (type === undefined) {
                    return false;
                }
                if (pi.lang.isArray(type)) {
                    for (i = type.length - 1; i >= 0; --i) {
                        delete table[type[i]];
                    }
                } else {
                    delete table[type];
                }
                return true;
            }
            if (type === undefined) {
                for (i in table) {
                    if (table.hasOwnProperty(i)) {
                        list = table[i];
                        if (list.remove(handler)) {
                            r = true;
                            if (list.size() === 0) {
                                delete table[i];
                            }
                        }
                    }
                }
            } else if (pi.lang.isArray(type)) {
                for (i = type.length - 1; i >= 0; --i) {
                    list = table[type[i]];
                    if (list !== undefined) {
                        if (list.remove(handler)) {
                            r = true;
                            if (list.size() === 0) {
                                delete table[type[i]];
                            }
                        }
                    }
                }
            } else {
                list = table[type];
                if (list !== undefined) {
                    if (list.remove(handler)) {
                        r = true;
                        if (list.size() === 0) {
                            delete table[type];
                        }
                    }
                }
            }
            return r;
        };
        return tableMod;
    };
    /**
     * 创建事件处理器列表 {@link pi.event.createHandlerList}
     * @return {list} 事件列表，见{@link pi.event.createHandlerList}
     */
    module.createHandlerList = createHandlerList;

    /**
     * 给一个对象建立事件监听接口
     * @param  {Object} obj
     */
    module.buildEventable = function (obj) {
        var listener = pi.event.createHandlerTable();

        /**
         * 注册事件处理器
         * @param  {int | string | array}   type 事件类型
         * @param  {Function} handler     事件处理器
         */
        obj.register = function (type, handler) {
            listener.add(type, handler);
        };

        /**
         * 注销事件处理器
         * @param  {int | string | array | undefined}   type 事件类型
         * @param  {Function} handler     事件处理器
         */
        obj.unregister = function (type, handler) {
            listener.remove(type, handler);
        };

        /**
         * 事件通知
         */
        obj.notify = function (eventName, eventParam) {
            listener.notify(eventName, eventParam);
        };

        obj.eventDestroy = function () {
            listener.destroy();
        };

    };

    return module;
});