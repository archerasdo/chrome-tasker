// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
(function () {
    document.addEventListener('DOMContentLoaded', function () {
        var needCycle = $('.radio-panel'),
            cyclePanel = $('.timer-recycle'),
            labelPanel = $('.labelname'),
            selfDefPanel = $('.selfEvt'),
            button = $('#submit'),
            clickBtn = $('#eventClick'),
            refreshBtn = $('#eventRefresh'),
            evtBtns = $('.event'),
            submitPanel = $('.submit-panel'),
            tagInput = $('#tagname'),
            selfCode = $('#selfevt'),
            evtNameInput = $('#evtname'),
            cycleNumInput = $('#cycleNum'),
            intervalInput = $('#interval'),
            taskContainer = $('.task-list'),
            delAllBtn = $('#delAll'),
            defBtn = $('#selfDef');

        
        var config = {
            TABLE_NAME:'taskTable'
        };

        //取得数据库连接
        var db = getTaskDb();
        //db.dropTable(['taskTable']);
        //db.createTable([{name:'testTable',columns:['id INTEGER PRIMARY KEY','name TEXT']}]);


        //db.supportRowId();

        //检测是否是第一次加载，即task表是否存在，若不存在则建表
        db.isExitTable(config.TABLE_NAME,undefined,function(){
            db.createTable([{name:config.TABLE_NAME,columns:[
                "evtName CHARACTER(20) UNIQUE",
                "evtType CHARACTER(20)",
                "tagName VARCHAR(255)",
                "evtDesc VARCHAR(255)",
                "isCycle BOOLEAN",
                "cycleTime INTEGER",
                "cycleNum INTEGER",
                "evtCode TEXT"
            ]}]);
        });

        //操作面板对象
        var OperatePanel = {
            init:function(){
                this.data.tasknum = 0;
                this.bindEvents();
                this.queryAllEvts();
            },
            //数据对象 包含了任务数量和任务队列
            data:{
                //task queue
                tasknum:0,
                taskList:[]
            },
            bindEvents:function(){
                //是否循环radio
                needCycle.addEventListener('change',this.handler.needCycleChange);
                //事件类型 点击button
                clickBtn.addEventListener('click', this.handler.evtClkBtnClick);
                //事件类型 刷新button
                refreshBtn.addEventListener('click',this.handler.evtRfhBtnClick);
                //事件类型 自定义button
                defBtn.addEventListener('click',this.handler.selfDefClick);
                //生成任务button
                button.addEventListener('click', this.handler.submit);
                //一键清除button
                delAllBtn.addEventListener('click',this.handler.delAllClick);
                //任务列表用于事件委托 监听对应任务的点击
                taskContainer.addEventListener('click',this.handler.evtAgent);


            },
            handler:{
                needCycleChange:function(e){
                    if (e.target.id === 'recycle-true') {
                        cyclePanel.style.display = "block";
                        submitPanel.setAttribute('data-iscycle',true);
                    } else {
                        cyclePanel.style.display = "none";
                        submitPanel.setAttribute('data-iscycle',false);
                    }
                },
                evtClkBtnClick: function(e) {
                    Array.prototype.forEach.call(evtBtns, function (e) {
                        if (e.className.match(new RegExp('(^|\\s)' + 'active' + '(\\s|$)'))) {
                            e.classList.remove('active');
                        }
                    });
                    this.classList.add('active');
                    selfDefPanel.style.display = 'none';
                    labelPanel.style.display = 'block';
                    submitPanel.setAttribute('data-evttype','click');
                },
                evtRfhBtnClick:function (e) {
                    Array.prototype.forEach.call(evtBtns, function (e) {
                        if (e.className.match(new RegExp('(^|\\s)' + 'active' + '(\\s|$)'))) {
                            e.classList.remove('active');
                        }
                    });
                    this.classList.add('active');
                    labelPanel.style.display = 'none';
                    selfDefPanel.style.display = 'none';
                    submitPanel.setAttribute('data-evttype','refresh');
                },
                selfDefClick: function (e) {
                    Array.prototype.forEach.call(evtBtns, function (e) {
                        if (e.className.match(new RegExp('(^|\\s)' + 'active' + '(\\s|$)'))) {
                            e.classList.remove('active');
                        }
                    });
                    this.classList.add('active');
                    labelPanel.style.display = 'none';
                    selfDefPanel.style.display = 'block';
                    submitPanel.setAttribute('data-evttype','self');
                },
                submit:function (e) {
                    var evtName = evtNameInput.value;
                    var evtType = submitPanel.getAttribute('data-evttype');
                    var tagName = evtType === 'click' ? tagInput.value:'';
                    var evtDesc = '';
                    var iscycle = submitPanel.getAttribute('data-iscycle');
                    var cycleNum = iscycle ? cycleNumInput.value : 0;
                    var cycleTime = intervalInput.value;
                    var taskNum =  OperatePanel.data.tasknum + 1;
                    var evtCode = evtType === 'self' ? selfCode.value:'';
                    var task = new TASK(evtName,evtType,tagName,evtDesc,iscycle,cycleTime,cycleNum,taskNum,evtCode);
                    OperatePanel.data.taskList[taskNum] = task;
                    OperatePanel.saveTask2Db(task);
                },
                delAllClick:function (e) {
                    db.removeRecord(config.TABLE_NAME);
                    OperatePanel.data.tasknum = 0;
                    taskContainer.innerHTML = '';
                },
                evtAgent: function (e) {
                    var target = e.target;
                    if (target && target.nodeName.toUpperCase() === 'BUTTON') {
                        var id = target.parentNode.id.split('_')[1];
                        switch (target.id) {
                            case 'do':
                                OperatePanel.doTask(OperatePanel.data.taskList[id]);
                                return true;
                            case 'del':
                                OperatePanel.delTask(OperatePanel.data.taskList[id]);
                                return true;
                        }
                     }
                }
            },
            //执行任务逻辑
            doTask: function(task){
                chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                    var msg = produceJSON(task);
                    console.log(msg);
                    chrome.tabs.sendMessage(tabs[0].id, msg, function (res) {
                        alert('complete!');
                    });
                });
            },
            //删除任务
            delTask:function(task) {
                var id = task.id;
                if (id === this.data.tasknum) {
                    this.data.tasknum--;
                }
                delete this.data.taskList[id];
                this.delFromDb({rowid:task.id});
                var taskDom = $('#task_'+id);
                taskContainer.removeChild(taskDom);
            },
            //加载面板时将所有任务加载如tasklist面板
            queryAllEvts:function () {
                var self = this;
                db.findByColumn(config.TABLE_NAME,function(ctx,data){
                    console.log(data);
                    self.set2task(data.rows);
                    console.log(self.data.taskList);
                    self.renderTaskList(self.data.taskList);
                });
            },
            //将数据库结果集转换成task持久对象
            set2task:function(set){
                for(var idx=0;idx < set.length; idx++) {
                    var el = set[idx];
                    console.log(el);
                    this.data.taskList[el.rowid] = new TASK(el.evtName,el.evtType,el.tagName,el.evtDesc,el.isCycle,el.cycleTime,el.cycleNum,el.rowid,el.evtCode);
                    this.data.tasknum = el.rowid;
                }
            },
            //将task持久对象写库
            saveTask2Db:function (task) {
                var list = [task.evtName,task.evtType,task.tagName,task.evtDesc,task.isCycle,task.cycleTime,task.cycleNum,task.evtCode];
                db.addRecord(config.TABLE_NAME,list);
                this.data.tasknum = task.id;
                this.renderTaskList([task]);
            },
            //将task从db中删除
            delFromDb: function (condition) {
                var sentence = [];
                for (prop in condition) {
                    if (condition.hasOwnProperty(prop)){
                        sentence.push(prop + ' = "' + condition[prop] + '"');
                    }
                }
                db.removeRecord(config.TABLE_NAME,sentence);
            },
            // 将task队列渲染到面板上
            // [{TASKTABLE},....]
            renderTaskList:function (data){
                for(idx in data) {
                    if (data.hasOwnProperty(idx)) {
                        var el = data[idx];
                        var DIV = document.createElement('div');
                        var html = '<ul class="list-inline col-xs-8">'
                            + '<li class="col-xs-4">' + el.evtName +'</li>'
                            + '</ul>'
                            + '<button id="do" type="submit" class="btn btn-primary btn-sm">do</button>'
                            + '<button id="del" type="submit" class="btn btn-danger btn-sm">del</button>';
                        DIV.id = 'task_'+el.id;
                        DIV.className = 'task';
                        DIV.innerHTML = html;
                        taskContainer.appendChild(DIV);
                    }
                }
            }
        };

        OperatePanel.init();
        
        
        
        function produceJSON(task) {
            return JSON.stringify(task);
        }
    });
})();

//选择器
function $(selector) {
    var targetList = document.querySelectorAll(selector);
    var el = targetList.length !== 1 ? targetList : targetList[0];
    return el;
}

    //工厂方法
function getTaskDb() {

    return new WEBSQL('taskDB',{version:'1.0',desc:'task objects',size:'1024*1024'});
}

//function Db(db_name,config) {
//
//    return websql(db_name,config);
//}


//SQL类封装
var WEBSQL = function (db_name, config) {
    var cf = config ? config : {},
        cfg = {
            version: cf.version ? cf.version : '1.0',
            desc: cf.desc ? cf.desc : '?????' + db_name,
            size: cf.size ? cf.size : 10 * 1024
        },
        log = function (msg, cat, src) {
            if (window['console'] !== undefined && console.log) {
                console[cat && console[cat] ? cat : 'log'](msg);
            }
        },
        formatSql = function (sql, data) {
            var count = 0;
            return sql.replace(/(\?)/g, function (a, b) {
                return data[count++];
            });
        },
        db = function () {
            if (window['openDatabase'] !== undefined) {
                log("db connected success");
                return openDatabase(db_name, cfg.version, cfg.desc, cfg.size);
            } else {
                log("db connected failed");
                return null;
            };
        }();
    //取得db连接
    this.getDbConnection = db;
    //执行sql
    this.execSql = function (sql, data, success, failure) {
        if (!db) {
            log("please create db first");
            return;
        }
        if (!data) {
            data = [];
        }
        if (success === undefined) {
            success = function (tx, results) {
                log("success" + formatSql(sql, data));
            }
        }
        var errfun = toString.call(failure) === '[object Function]' ?
            function (tx, err) {
                failure.call(this, tx, err, formatSql(sql, data));
            } :
            function (tx, err) {
                log("success msg:" + err.message + " sql:" + formatSql(sql, data));
            };
        db.transaction(function (tx) {
            try {
                tx.executeSql(sql, data, success, errfun)
            } catch (e) {
                log("failed msg:" + e.message);
            }
        });
    };
    // table =
    //[
    //{ name: "kids", columns: ["id INTEGER PRIMARY KEY",
    //    "name TEXT"]},
    //{ name: "candy", columns: ["id INTEGER PRIMARY KEY",
    //    "name TEXT"]},
    //{ name: "candySales", columns: ["kidId INTEGER",
    //    "candyId INTEGER",
    //    "date TEXT"]}
    //]


    //检测表是否存在
    this.isExitTable = function (tableName, exitFun, noexitFun) {
        var sql = "select * from sqlite_master where type='table' and name = ?";
            this.execSql(sql, [tableName], function (transaction, result) {
                if (result.rows.length > 0 && exitFun) {
                    exitFun.call();
                } else if (result.rows.length <= 0 && noexitFun) {
                    noexitFun.call();
                }
            }, null);
    };

    //检测websql（sqlite）是否支持rowid 主要用于兼容chrome版本  目前尚未完成
    this.supportRowId = function () {
        var sql = "select * from sqlite_master";
        this.execSql(sql, [], function (transaction, result) {
            if (result.rows.length > 0) {
                console.log(result);
            } else if (result.rows.length <= 0 ) {
                console.log(result);
            }
        }, null);
    },
    //创建表
    this.createTable = function (tables) {
        for (var index = 0; index < tables.length; index++) {
            var table = tables[index];
            var SQL = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + table.columns.join(',') + ')';
            this.execSql(SQL, [],
                function () {
                    log('create table ' + table.name + ' success');
                },
                function (tx, err) {
                    log("create failed! msg:" + err.message)
                });
        }
    };
    //删除表
    this.dropTable = function (tables) {
        for (var index = 0; index < tables.length; index++) {

            var table = tables[index];
            var SQL = "DROP TABLE IF EXISTS " + table;
            this.execSql(SQL,[],
                function () {
                    log('drop table ' + table + ' success');
                },
                function (tx, err) {
                    log("drop failed! msg:" + err.message +  " sql:" + formatSql(SQL, table))
                    log(table);
                });
        }
    };
    //CRUD R 根据条件查询
    this.findByColumn = function (tableName, callback,columnName, conditions) {
        columnName = columnName || '*, rowid';
        var SQL = conditions &&  conditions.length > 0 ? ' SELECT ' + columnName + ' FROM ' + tableName + ' WHERE ' + conditions.join(',') :' SELECT ' + columnName + ' FROM '   + tableName;
        this.execSql(SQL,[],
                callback
                //var len = res.rows.length, i;
                ////log('Got ' + len + ' rows.');
                //for (i = 0; i < len; i++) {
                //    //log(res.rows.item(i));
                //    resultSet.push(res.rows.item(i));
                //}
                //return resultSet;
);
    };
    //CRUD C 创建一条记录
    this.addRecord =  function (tableName,data) {
        var COLUMS = [];
        for (var idx = 0; idx < data.length; idx++)
        {
            COLUMS.push('?');
        }
        var SQL = 'INSERT INTO ' + tableName + ' VALUES (' + COLUMS.join(',') + ' )';
        this.execSql(SQL,data,
            function (result) {
                log('insert record ' + result + ' success');
            },
            function (tx, err) {
                log("insert failed! msg:" + err.message )
            });
    };

    //CRUD D 删除一条记录
    this.removeRecord =  function (tableName,conditions) {

        var SQL = conditions && conditions.length > 0 ? 'DELETE FROM ' + tableName + ' WHERE ' + conditions.join('AND') : 'DELETE FROM ' + tableName ;
        this.execSql(SQL,[],
            function (result) {
                log('remove record ' + result + ' success');
            },
            function (tx, err) {
                log("remove failed! msg:" + err.message )
            });
    };

    return this;
};

//TASK的持久化类
function TASK(evtName,evtType,tagName,evtDesc,isCycle,cycleTime,cycleNum,id,evtCode) {
    this.evtName = evtName;
    this.evtDesc = evtDesc || evtName;
    this.evtType = evtType || 'click';
    this.tagName = tagName || '';
    this.isCycle = isCycle || false;
    this.cycleTime = cycleTime || 0;
    this.cycleNum = cycleNum || 0;
    this.id = id;
    this.evtCode = evtCode;
    return this;
}


//taskTable ???
//id INTEGER PRIMARY KEY UNIQUE
//evtName CHARACTER(20) UNIQUE
//evtType CHARACTER(20)
//evtDesc VARCHAR(255)
//isCycle BOOLEAN
//CycleTime INTEGER
//evtCode TEXT

