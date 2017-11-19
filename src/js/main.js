(function (){
    var Game = window.Game = function (param) {
        let self = this;
        self.canvas = document.getElementById(param.canvasId);
        self.ctx = this.canvas.getContext('2d');
        // 初始化
        self.init();
        self.rUrl = param.rUrl;
        self.loadAllResource(function (str) {
            self.start(str)
        })
    };
    Game.prototype.init = function () {
        this.lastTime = 0; // 计算FPS

        // 处理高被屏
        // this.windowW = document.documentElement.clientWidth * 2;
        // this.windowH = document.documentElement.clientHeight * 2;
        // this.minW = 320 * 2;
        // this.maxW = 414 * 2;
        // this.maxH = 736 * 2;
        // this.minH = 500 * 2;
        this.windowW = document.documentElement.clientWidth;
        this.windowH = document.documentElement.clientHeight;
        this.minW = 320;
        this.maxW = 414;
        this.maxH = 736;
        this.minH = 500;

        // 验收
        this.canvas.width = this.windowW > this.maxW ? this.maxW : (this.windowW < this.minW ? this.minW : this.windowW)
        this.canvas.height = this.windowH > this.maxH ? this.maxH : (this.windowH < this.minH ? this.minH : this.windowH)

        this.w = this.canvas.width;
        this.h = this.canvas.height;
        this.picTop = this.canvas.height -512;

        // this.canvas.style.width = this.w / 2 + 'px';
        // this.canvas.style.height = this.h / 2 + 'px';
    }
    Game.prototype.rnd = function(start, end){
        return Math.floor(Math.random() * (end - start) + start);
    }

    Game.prototype.loadAllResource = function (callback) {
        let self = this;
        self.R = {};
        $.ajax({
            url: self.rUrl,
            type: 'get',
            dataType: 'json',
            success: function(res){
                let num = 0;
                for(let i = 0; i < res.images.length; i++) {
                    self.R[res.images[i].name] = new Image();
                    self.R[res.images[i].name].src =  '../' + res.images[i].url;
                    self.R[res.images[i].name].onload = function () {
                        num++;
                        let text = '正在加载，' + num + '／' + res.images.length;
                        self.ctx.clearRect(0, 0, self.w,self.h);
                        self.ctx.textAlign = 'center';
                        self.ctx.font = "20px Microfont YaHei";
                        self.ctx.fillText(text, self.w / 2, self.h / 2);
                        console.log('加载中' + num)
                        if (num == res.images.length) {
                            callback('done');
                        }
                    }
                }
            },
            error: function (res) {
                console.log(res)
            }
        })


    }
    Game.prototype.start = function (str) {
        let self = this;

        self.Bg = new Background();// 实例背景
        self.Land = new Land(); // 实例大地
        self.pipeArr = []
        self.num = 0; // 计数 用于控制new管子类

        this.timer = setInterval( () => {
            self.num++;
            // let random = game.rnd(150,200);
            (self.num === 1 || self.num % 180 === 0 ) && new Pipe();
            self.ctx.clearRect(0, 0, self.w, self.h);

            self.Bg.render(); // 背景渲染
            self.Bg.update(); // 背景更新

            for(let i = 0; i < self.pipeArr.length; i++){
                self.pipeArr[i].render(); // 管子渲染
                self.pipeArr[i].update(); // 管子更新
                console.log(self.pipeArr[i])
            }

            self.Land.render(); // 大地渲染
            self.Land.update(); // 大地更新

        },20);
    }
})();

let game = new Game({
    'canvasId': "canvas",
    "rUrl": "../R.json"
});


// 背景类
(function () {
    let Background = window.Background = function () {
        this.bgPic = game.R.bg_day;
        this.x  = 0;
        this.w = 288;
        this.y = 512;
        this.speed = 1;

    }
    // 背景渲染
    Background.prototype.render = function () {
        game.ctx.drawImage(this.bgPic, this.x, game.canvas.height - this.y);
        game.ctx.drawImage(this.bgPic, this.x + this.w, game.canvas.height - this.y);
        game.ctx.drawImage(this.bgPic, this.x + this.w*2, game.canvas.height - this.y);
        game.ctx.fillStyle = '#47c0cb';
        game.ctx.fillRect(0,0,game.w,game.h - this.y);
    }
    // 背景更新
    Background.prototype.update = function () {
        this.x -= this.speed;
        if (this.x < -this.w) {
            this.x = 0;
        }
    }
})();

// 大地类
(function () {
    let Land = window.Land = function () {
        this.landPic = game.R.land;
        console.log(this.landPic)
        this.x  = 0;
        this.w = 288;
        this.y = 512;
        this.speed = 1;

    }
    // 大地渲染
    Land.prototype.render = function () {
        game.ctx.drawImage(this.landPic, this.x, game.canvas.height*0.85);
        game.ctx.drawImage(this.landPic, this.x + this.w, game.canvas.height*0.85);
        game.ctx.drawImage(this.landPic, this.x + this.w*2, game.canvas.height*0.85);
    }
    // 大地更新
    Land.prototype.update = function () {
        this.x -= this.speed;
        if (this.x < -this.w) {
            this.x = 0;
        }
    }
})();

// 管子类
(function () {
    let Pipe = window.Pipe = function () {
        this.pipeUp = game.R.pipe_up;
        this.pipeDown = game.R.pipe_down;
        this.picHeight = 320;
        this.airHeight = game.h * 0.85;
        this.x = game.w;
        this.speed = 1;

        this.maxHeight = this.picHeight;  // 管子最长规定
        this.minHeight = this.airHeight - 100 - 320; // 管子最短规定

        this.interSpace = 100; // 中间空隙

        this.upHeight = game.rnd(this.minHeight,this.maxHeight); // 规定内 管子随机长度

        this.upCoord   = parseInt(this.upHeight - this.picHeight); // 上方管子的坐标
        this.downCoord = parseInt(this.upHeight + this.interSpace); // 下方管子的坐标
        game.pipeArr.push(this);

    }
    // 管子渲染
    Pipe.prototype.render = function () {
        game.ctx.drawImage(this.pipeDown, this.x, this.upCoord);
        game.ctx.drawImage(this.pipeUp, this.x, this.downCoord);
    }
    // 管子更新
    Pipe.prototype.update = function () {
        this.x -= this.speed;
    }
})();
