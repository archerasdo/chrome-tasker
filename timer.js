/**
 * Created by gongjian.gj on 2015/7/13.
 */

//生成定时器
function produceTimer(func,funcParam,interval,cycnum) {
    if (cycnum !=0) {
        var counter = 0;
        var t = setInterval(function(){
            var result = funcParam ? func(funcParam) : func();
            counter ++;
            if (counter > cycnum) {
                clearInterval(t);
                console.log(result);
            }
        },interval);
    } else {
        var t = setTimeout(function(){
            func(funcParam);
        },interval);
    }
}

//对应点击事件类型
function clickEvt(selector){
    $(selector).click();
}



//监听message消息
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {

        var msg = JSON.parse(message);
        console.log(msg);
        switch (msg.evtType) {
            case 'click':
                produceTimer(clickEvt,msg.tagName,msg.cycleTime,msg.cycleNum);
                break;
            case 'refresh':
                break;
            case 'self':
                produceTimer(new Function(msg.evtCode),false,msg.cycleTime,msg.cycleNum);
                break;
        }
    });

function $(selector) {
    var targetList = document.querySelectorAll(selector);
    var el = targetList.length !== 1 ? targetList : targetList[0];
    return el;
}


//不支持es6语法，使用deferred对象
function wait(func,time) {
    var dtd = jQuery.Deferred();
    setTimeout(function(){
        func();
        dtd.resolve();
    },time);
    return dtd.promise();
}


//支持es6语法
function delay(func,time,result) {
    return function(cb){
        setTimeout(function(){
            func();
            cb(result);
        },time);
    };
}

//高阶函数实现co支持 用于异步流程化
function co(generator){
    var iter = generator();
    function nextStep(it) {
        if(it.done) return ;
        if (typeof it.value === 'function') {
            //内层是cb函数
            it.value(function(ret){
                nextStep(iter.next(ret));
            })
        } else {
            nextStep(iter.next(it.value));
        }
    }
    nextStep(iter.next());
}
