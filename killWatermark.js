// ==UserScript==
// @name         Hook Render Watermark Canvas For New 河畔
// @namespace    http://tampermonkey.net/
// @version      2026.03.26
// @description  通过hook转base64的filltext修改页面水印内容
// @author       LHC
// @match        https://river-side.cc/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 方法1Hook ToDataURL对该网站无效，弃用
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;

    HTMLCanvasElement.prototype.toDataURL = function(...args) {
        try {
            // 获取 canvas 上保存的数据
            // 我们用 __wmData 暂存要覆盖的数据
            if (this.__wmData) {
                const data = this.__wmData;
                console.log(data);
                if (data.username) data.username = "test";
                if (data.timestamp) data.timestamp = "2020-01-01";
            }
        } catch (e) {
            console.warn("[WM Hook] 修改水印数据失败", e);
        }

        // 调用原方法生成 Base64
        return originalToDataURL.apply(this, args);
    };

    // 拦截渲染函数调用，把数据挂到 canvas 上
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
        const ctx = originalGetContext.apply(this, [type, ...args]);
        if (type === "2d") {
            // 给 fillText 方法加个 hook
            const originalFillText = ctx.fillText;
            ctx.fillText = function(text, x, y, maxWidth) {
                // 如果 text 是用户名或时间，替换
                console.log(text);
                if (text && (text.length > 0)) {
                    console.log(text);
                    if (text.match(/^\d{2}-\d{2}-\d{2}$/)) {
                        text = "11-45-14"; // 年月日
                    }else if(text == 'river-side.cc'){
                        // text = "river-side.cc"; // 暂不修改
                    }else if(text.match(/\d{5}/)) {
                         text = "114514"; // 用户ID,为数字，走下面else
                    }else{
                    if (text === window.username || text.length < 30) text = "system"; // 用户名
                    }
                }else{
                    text = "114514"; // 用户ID
                }
                return originalFillText.call(this, ...[text, x, y, maxWidth]);
            };
        }
        return ctx;
    };

    console.log("[WM Hook] 已安装 canvas.toDataURL hook");
})();
