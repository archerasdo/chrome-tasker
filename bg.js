///**
// * Created by gongjian.gj on 2015/7/15.
// */
//function getCurrentTabUrl(callback) {
//    // Query filter to be passed to chrome.tabs.query - see
//    // https://developer.chrome.com/extensions/tabs#method-query
//    var queryInfo = {
//        active: true,
//        currentWindow: true
//    };
//
//    chrome.tabs.query(queryInfo, function(tabs) {
//        // chrome.tabs.query invokes the callback with a list of tabs that match the
//        // query. When the popup is opened, there is certainly a window and at least
//        // one tab, so we can safely assume that |tabs| is a non-empty array.
//        // A window can only have one active tab at a time, so the array consists of
//        // exactly one tab.
//        var tab = tabs[0];
//
//        // A tab is a plain object that provides information about the tab.
//        // See https://developer.chrome.com/extensions/tabs#type-Tab
//        var url = tab.url;
//
//        // tab.url is only available if the "activeTab" permission is declared.
//        // If you want to see the URL of other tabs (e.g. after removing active:true
//        // from |queryInfo|), then the "tabs" permission is required to see their
//        // "url" properties.
//        console.assert(typeof url == 'string', 'tab.url should be a string');
//
//        callback(url);
//    });
//
//    // Most methods of the Chrome extension APIs are asynchronous. This means that
//    // you CANNOT do something like this:
//    //
//    // var url;
//    // chrome.tabs.query(queryInfo, function(tabs) {
//    //   url = tabs[0].url;
//    // });
//    // alert(url); // Shows "undefined", because chrome.tabs.query is async.
//}
//
///**
// * @param {string} searchTerm - Search term for Google Image search.
// * @param {function(string,number,number)} callback - Called when an image has
// *   been found. The callback gets the URL, width and height of the image.
// * @param {function(string)} errorCallback - Called when the image is not found.
// *   The callback gets a string that describes the failure reason.
// */
//function getImageUrl(searchTerm, callback, errorCallback) {
//    // Google image search - 100 searches per day.
//    // https://developers.google.com/image-search/
//    var searchUrl = 'https://ajax.googleapis.com/ajax/services/search/images' +
//        '?v=1.0&q=' + encodeURIComponent(searchTerm);
//    var x = new XMLHttpRequest();
//    x.open('GET', searchUrl);
//    // The Google image search API responds with JSON, so let Chrome parse it.
//    x.responseType = 'json';
//    x.onload = function() {
//        // Parse and process the response from Google Image Search.
//        var response = x.response;
//        if (!response || !response.responseData || !response.responseData.results ||
//            response.responseData.results.length === 0) {
//            errorCallback('No response from Google Image search!');
//            return;
//        }
//        var firstResult = response.responseData.results[0];
//        // Take the thumbnail instead of the full image to get an approximately
//        // consistent image size.
//        var imageUrl = firstResult.tbUrl;
//        var width = parseInt(firstResult.tbWidth);
//        var height = parseInt(firstResult.tbHeight);
//        console.assert(
//            typeof imageUrl == 'string' && !isNaN(width) && !isNaN(height),
//            'Unexpected respose from the Google Image Search API!');
//        callback(imageUrl, width, height);
//    };
//    x.onerror = function() {
//        errorCallback('Network error.');
//    };
//    x.send();
//}
//
//function renderStatus(statusText) {
//    document.getElementById('status').textContent = statusText;
//}
//
//document.addEventListener('DOMContentLoaded', function() {
//    getCurrentTabUrl(function(url) {
//        // Put the image URL in Google search.
//        renderStatus('Performing Google Image search for ' + url);
//
//        getImageUrl(url, function(imageUrl, width, height) {
//
//            renderStatus('Search term: ' + url + '\n' +
//                'Google image search result: ' + imageUrl);
//            var imageResult = document.getElementById('image-result');
//            // Explicitly set the width/height to minimize the number of reflows. For
//            // a single image, this does not matter, but if you're going to embed
//            // multiple external images in your page, then the absence of width/height
//            // attributes causes the popup to resize multiple times.
//            imageResult.width = width;
//            imageResult.height = height;
//            imageResult.src = imageUrl;
//            imageResult.hidden = false;
//
//        }, function(errorMessage) {
//            renderStatus('Cannot display image. ' + errorMessage);
//        });
//    });
//});
//
//function gbkEncodeURL(s) {
//    var img = document.createElement("img");
//    // escapeDBC 对多字节字符编码的函数
//    function escapeDBC(s) {
//        if (!s) return ""
//        if (window.ActiveXObject) {
//            // 如果是 ie, 使用 vbscript
//            execScript('SetLocale "zh-cn"', 'vbscript');
//            return s.replace(/[\d\D]/g, function($0) {
//                window.vbsval = "";
//                execScript('window.vbsval=Hex(Asc("' + $0 + '"))', "vbscript");
//                return "%" + window.vbsval.slice(0,2) + "%" + window.vbsval.slice(-2);
//            });
//        }
//        // 其它浏览器利用浏览器对请求地址自动编码的特性
//        img.src = "offer_search.htm?separator=" + s;
//        return img.src.split("?separator=").pop();
//    }
//    // 把 多字节字符 与 单字节字符 分开，分别使用 escapeDBC 和 encodeURIComponent 进行编码
//    return s.replace(/([^\x00-\xff]+)|([\x00-\xff]+)/g, function($0, $1, $2) {
//        return escapeDBC($1) + encodeURIComponent($2||'');
//    });
//}
//
//
//
//function chinesefromutf8url(strutf8)
//{
//    var bstr = "";
//    var noffset = 0;
//// processing point on strutf8
//    if( strutf8 == "" )
//        return "";
//    strutf8 = strutf8.tolowercase();
//    noffset = strutf8.indexof("%e");
//    if( noffset == -1 )
//        return strutf8;
//
//    while( noffset != -1 )
//    {
//        bstr += strutf8.substr(0, noffset);
//        strutf8 = strutf8.substr(noffset, strutf8.length - noffset);
//        if( strutf8 == "" || strutf8.length < 9 ) // bad string
//            return bstr;
//
//        bstr += utf8codetochinesechar(strutf8.substr(0, 9));
//        strutf8 = strutf8.substr(9, strutf8.length - 9);
//        noffset = strutf8.indexof("%e");
//    }
//
//    return bstr + strutf8;
//}
//
//function unicodefromutf8(strutf8)
//{
//    var bstr = "";
//    var ntotalchars = strutf8.length; // total chars to be processed.
//    var noffset = 0; // processing point on strutf8
//    var nremainingbytes = ntotalchars; // how many bytes left to be converted
//    var noutputposition = 0;
//    var icode, icode1, icode2; // the value of the unicode.
//
//    while (noffset < ntotalchars)
//    {
//        icode = strutf8.charcodeat(noffset);
//        if ((icode & 0x80) == 0) // 1 byte.
//        {
//            if ( nremainingbytes < 1 ) // not enough data
//                break;
//
//            bstr += string.fromcharcode(icode & 0x7f);
//            noffset ++;
//            nremainingbytes -= 1;
//        }
//        else if ((icode & 0xe0) == 0xc0) // 2 bytes
//        {
//            icode1 = strutf8.charcodeat(noffset + 1);
//            if ( nremainingbytes < 2 || // not enough data
//                (icode1 & 0xc0) != 0x80 ) // invalid pattern
//            {
//                break;
//            }
//
//            bstr += string.fromcharcode(((icode & 0x3f) << 6) | ( icode1 & 0x3f));
//            noffset += 2;
//            nremainingbytes -= 2;
//        }
//        else if ((icode & 0xf0) == 0xe0) // 3 bytes
//        {
//            icode1 = strutf8.charcodeat(noffset + 1);
//            icode2 = strutf8.charcodeat(noffset + 2);
//            if ( nremainingbytes < 3 || // not enough data
//                (icode1 & 0xc0) != 0x80 || // invalid pattern
//                (icode2 & 0xc0) != 0x80 )
//            {
//                break;
//            }
//
//            bstr += string.fromcharcode(((icode & 0x0f) << 12) |
//                ((icode1 & 0x3f) << 6) |
//                (icode2 & 0x3f));
//            noffset += 3;
//            nremainingbytes -= 3;
//        }
//        else // 4 or more bytes -- unsupported
//            break;
//    }
//
//    if (nremainingbytes != 0)
//    {
//// bad utf8 string.
//        return "";
//    }
//
//    return bstr;
//}
//
//function utf8codetochinesechar(strutf8)
//{
//    var icode, icode1, icode2;
//    icode = parseint("0x" + strutf8.substr(1, 2));
//    icode1 = parseint("0x" + strutf8.substr(4, 2));
//    icode2 = parseint("0x" + strutf8.substr(7, 2));
//
//    return string.fromcharcode(((icode & 0x0f) << 12) |
//        ((icode1 & 0x3f) << 6) |
//        (icode2 & 0x3f));
//}
//chrome.browserAction.onClicked.addListener(function(){
//        chrome.runtime.sendMessage('fgifcloiiclajomgpiiebbjkmcomipbc', {key: 'helloworld'}, function (res) {
//            if (res) {
//                alert(res);
//            }
//        });
//});
//
//
//


chrome.browserAction.onClicked.addListener(function(){
        console.log('ok');
        document.addEventListener('DOMContentLoaded', function () {
            var needCycle = $('.radio-panel'),
                cyclePanel = $('.timer-recycle'),
                labelPanel = $('.labelname'),
                button = $('#submit'),
                clickBtn = $('#eventClick'),
                refreshBtn = $('#eventRefresh'),
                evtType = $('#evttype'),
                evtBtns = $('.event');
            var db = getDataBase();
            console.log(db);
            db.findByColumn('testTable');
            db.execSql('select * from testTable',[],function(cxt,res){
                var len = res.rows.length, i;
                console.log('Got '+len+' rows.');
                for (i = 0; i < len; i++){
                    console.log('id: '+res.rows.item(i).id);
                    console.log('name: '+res.rows.item(i).name);
                }
            });
            needCycle.addEventListener('change', function (e) {
                if (e.target.id === 'recycle-true') {
                    cyclePanel.style.display = "block";
                } else {
                    cyclePanel.style.display = "none";
                }
            });

            clickBtn.addEventListener('click', function (e) {

                Array.prototype.forEach.call(evtBtns, function (e) {
                    if (e.className.match(new RegExp('(^|\\s)' + 'active' + '(\\s|$)'))) {
                        e.classList.remove('active');
                    }
                });
                this.classList.add('active');
                evtType.value = 'click';
                labelPanel.style.display = 'block';
            });

            refreshBtn.addEventListener('click', function (e) {
                Array.prototype.forEach.call(evtBtns, function (e) {
                    if (e.className.match(new RegExp('(^|\\s)' + 'active' + '(\\s|$)'))) {
                        e.classList.remove('active');
                    }
                });
                this.classList.add('active');
                evtType.value = 'refresh';
                labelPanel.style.display = 'none';
            });

            button.addEventListener('click', function () {

                chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                    var msg = produceJSON();
                    chrome.tabs.sendMessage(tabs[0].id, msg, function (res) {
                        alert('complete!');
                    });
                });
            });

            function produceJSON() {
                var tagname = $('#tagname'),
                    interval = $('#interval'),
                    cycleNum = $('#cycleNum'),
                    output = {};
                if (tagname) {
                    output.tagname = tagname.value;
                }
                if (cycleNum && cycleNum != '') {
                    output.cyclenum = cycleNum.value;
                }
                output.interval = interval.value;
                output.evttype = evtType.value;
                return output;
            }
        });
});


function $(selector) {
    var targetList = document.querySelectorAll(selector);
    var el = targetList.length > 1 ? targetList : targetList[0];
    return el;
}

function getDataBase() {
    return websql('taskDB',{version:'1.0',desc:'任务队列',size:'1024*1024'});
}

var websql = function (db_name, config) {
    var cf = config ? config : {},
        cfg = {
            version: cf.version ? cf.version : '1.0',
            desc: cf.desc ? cf.desc : '数据库' + db_name,
            size: cf.size ? cf.size : 10 * 1024
        },
        log= function(msg, cat, src){
            if (window['console'] !== undefined && console.log) {
                console[cat && console[cat] ? cat : 'log'](msg);
            }
        },
        formatSql= function(sql,data){
            var count=0;
            return sql.replace(/(\?)/g, function(a,b){
                return data[count++];
            });
        },
        db= function(){
            if(window['openDatabase'] !== undefined){
                log("数据库连接成功");
                return openDatabase(db_name, cfg.version , cfg.desc , cfg.size);
            }else{
                log("数据库连接失败");
                return null;
            }
        }();
    websql.prototype = {
        db: db,
        execSql: function(sql,data,success,failure){
            if(!db){
                log("请先初始化数据库和表。");
                return;
            }
            if(!data){
                data= [];
            }
            if (success === undefined){
                success = function(tx, results){
                    log("操作成功:"+formatSql(sql,data));
                }
            }
            var errfun= toString.call(failure) === '[object Function]'?
                function(tx, err){
                    failure.call(this,tx,err,formatSql(sql,data));
                } :
                function(tx, err){
                    log("操作失败! msg:"+err.message+" sql:"+formatSql(sql,data));
                };
            db.transaction(function(tx){
                try{
                    tx.executeSql(sql,data,success,errfun)
                }catch(e){
                    log("数据库执行失败:"+e.message);
                }
            });
        },
        createTable: function(tables) {
            for (var index = 0; index < tables.length ; index++) {
                var table = tables[index];
                this.execSql('CREATE TABLE IF NOT EXISTS ? (?)',[table.name,table.columns.join(',')],
                    function(){
                        log('表'+table.name+'插入成功');
                    },
                    function(tx,err){
                        log("操作失败! msg:"+err.message)
                    });
            }
        },
        dropTable: function(tables) {
            for (var index = 0; index < tables.length ; index++) {
                var table = tables[index];
                this.execSql('DROP TABLE ? IF EXISTS',[table.name],
                    function(){
                        log('表'+table.name+'删除成功');
                    },
                    function(tx,err){
                        log("操作失败! msg:"+err.message)
                    });
            }
        },
        findByColumn: function(tableName,columnName){
            columnName = columnName || '*';
            this.execSql('SELECT ? FROM ?',[tableName,columnName],
                function(ctx,res){
                    var len = res.rows.length, i;
                    console.log('Got '+len+' rows.');
                    for (i = 0; i < len; i++){
                        console.log(res.rows.item(i));
                    }
                });
        }

    };

    return websql;
}