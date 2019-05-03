(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            (global = global || self, global.Signature  = factory);
}(this,  function signature(obj) {
    const that = this;
    this.obj = obj && !Array.isArray(obj) ? obj : {};
    this.option = {
        el: that.obj.el ? that.obj.el : 'body',
        lineWidth: that.obj.lineWidth && !isNaN(parseInt(that.obj.lineWidth)) ? that.obj.lineWidth : 5,
        lineColor: that.obj.lineColor && (/^#[1-9|A-F]{6}/).test(that.obj.lineColor.substr(0, 7).toLocaleUpperCase()) ? that.obj.lineColor : '#000000',
        overflow: that.obj.direction && typeof that.obj.direction === 'boolean' ? that.obj.direction : true,
        background: that.obj.background && (/^#[1-9|A-F]{6}/).test(that.obj.background.substr(0, 7).toLocaleUpperCase()) ? that.obj.background : '#ffffff'
    };
    this.status = [];
    this.step = -1;
    const el = document.querySelector(this.option.el);
    if (el.tagName !== 'CANVAS') {
        throw new Error('Target element must be canvas')
    }
    el.style.backgroundColor = this.option.background;
    let ctx = el.getContext('2d');
    this.create = function (v = that.option) {
        ctx.lineWidth = v.lineWidth;
        ctx.strokeStyle = v.lineColor;
        if (v.overflow === true) {
            document.querySelector('body').style.overflow = 'hidden'
        }
        let mp = '';
        const userAgent = navigator.userAgent.toLocaleLowerCase();
        if (userAgent.indexOf('iphone') !== -1 || userAgent.indexOf('android') !== -1) {
            // 用户为移动设备
            el.addEventListener('touchstart', function (e) {
                mp = {x: e.touches[0].clientX - this.offsetLeft, y: e.touches[0].clientY - this.offsetTop}
            });
            el.addEventListener('touchmove', function (e) {
                ctx.beginPath();
                ctx.moveTo(mp.x, mp.y);
                mp = {x: e.touches[0].clientX - this.offsetLeft, y: e.touches[0].clientY - this.offsetTop};
                ctx.lineTo(mp.x, mp.y);
                ctx.fill();
                ctx.closePath();
                ctx.stroke();
            });
            el.addEventListener('touchend', function () {
                mp = ''
            })
        } else {
            // 用户是电脑,不推荐使用
            el.addEventListener('mousedown', function (e) {
                saveStatus();
                mp = {x: e.clientX - this.offsetLeft, y: e.clientY - this.offsetTop}
            });

            el.addEventListener('mousemove', function (e) {
                if (mp.x && mp.y) {
                    ctx.beginPath();
                    ctx.moveTo(mp.x, mp.y);
                    mp = {x: e.clientX - this.offsetLeft, y: e.clientY - this.offsetTop};
                    ctx.lineTo(mp.x, mp.y);
                    ctx.fill();
                    ctx.closePath();
                    ctx.stroke();

                }
            });

            el.addEventListener('mouseup', function () {
                mp = ''
            });

            el.addEventListener('mouseout', function () {
                mp = ''
            })


        }
    };
    this.getContentBase64 = function (horizontal,callback) {
        if (!horizontal) {
            if (callback){
                callback(el.toDataURL('image/png'))
            }else{
                return el.toDataURL('image/png')
            }
        } else {
            for (let i of document.querySelectorAll('canvas[data-none="1"]')) {
                i.parentNode.removeChild(i)
            }

            // 创建横向画布
            let hideenEl = document.createElement('canvas');
            hideenEl.dataset.none = '1';
            hideenEl.width = el.offsetHeight;
            hideenEl.height = el.offsetWidth;
            document.body.appendChild(hideenEl);

            let hiddenCtx = document.querySelector('canvas[data-none="1"]').getContext("2d");
            let img = new Image();
            img.src = that.getContentBase64();
            img.onload = function () {
                let width = Math.round(el.offsetHeight / 2);
                let height = Math.round(el.offsetWidth / 2);
                hiddenCtx.save();
                hiddenCtx.translate(width, height);
                hiddenCtx.rotate(-90 * Math.PI / 180);
                hiddenCtx.drawImage(img, -img.width / 2, -img.height / 2);
                hiddenCtx.restore();
                if (callback) callback(document.querySelector('canvas[data-none="1"]').toDataURL('image/png'))
            }
        }
    };
    this.getBlob = function (v = this.getContentBase64()) {
        let arr = v.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type: mime});
    };
    this.getFile = function (filename, v = this.getContentBase64()) {
        let fn = filename || 'file';
        let arr = v.split(',');
        let mime = arr[0].match(/:(.*?);/)[1];
        let suffix = mime.split('/')[1];
        let bstr = atob(arr[1]);
        let n = bstr.length;
        let u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n)
        }
        return new File([u8arr], `${fn}.${suffix}`, {type: mime})
    };
    this.reset = function () {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.fillRect(0, 0, el.offsetWidth, el.offsetHeight);
        ctx.closePath();
    };

    function saveStatus() {
        that.step++;
        if (that.step < status.length) {
            that.status.length = that.step; // 截断数组
        }
        that.status.push(that.getContentBase64())
    }

    this.undo = function (callback) {
        if (that.step >= 0) {
            ctx.clearRect(0, 0, el.offsetWidth, el.offsetHeight);
            let canvasPic = new Image();
            try {
                canvasPic.src = that.status[that.step];
                canvasPic.addEventListener('load', () => {
                    ctx.drawImage(canvasPic, 0, 0);
                });
            } catch (e) {

            }
            that.step--;

        } else {
            console.warn('no more undo');
            if (callback) callback()
        }
    };
    this.redo = function (callback) {
        if (that.step < that.status.length - 2) {
            that.step++;
            let canvasPic = new Image();
            if (that.status[that.step + 1]) {
                canvasPic.src = that.status[that.step + 1];
                canvasPic.addEventListener('load', () => {
                    ctx.clearRect(0, 0, el.offsetWidth, el.offsetHeight);
                    ctx.drawImage(canvasPic, 0, 0);
                });
            }
        } else {
            console.log('no more redo');
            if (callback) callback()
        }
    }
}));
