
    var Game = window.Game = function (param) {
        let self = this;
        self.canvas = document.getElementById(param.canvasId);
        self.ctx = this.canvas.getContext('2d');
        // 初始化
        self.init();
        self.rUrl = param.rUrl;
        this.loadAllResource(function (str) {
            self.start(str)
        })
    };
    Game.prototype.init = function () {
        // window.ontouchstart = function(e) {
        //     e.preventDefault();
        // };
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
    //  资源加载
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
                        // console.log('加载中' + num)
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

    //  游戏开始

    Game.prototype.start = function (str) {
        let self = this;

        self.Bg = new Background();// 实例背景
        self.Land = new Land(); // 实例大地
        self.Bird = new Bird(); // 实例大地
        self.pipeArr = []
        self.num = 0; // 计数 用于控制new管子类
        self.preTime= Date.now();
        // let random = game.rnd(20,300);
        this.timer = setInterval( () => {
            self.num++;
            self.nowTime = Date.now();
            let dt = self.nowTime - self.preTime;
            self.preTime = self.nowTime;


            self.ctx.clearRect(0, 0, self.w, self.h);

            self.Bg.render(); // 背景渲染
            self.Bg.update(); // 背景更新

            (self.num === 1 || self.num % 150 === 0 ) && new Pipe();
            for(let i = 0; i < self.pipeArr.length; i++){
                self.pipeArr[i].render(); // 管子渲染
                self.pipeArr[i].update(); // 管子更新
            }

            self.Land.render(); // 大地渲染
            self.Land.update(); // 大地更新

            self.Bird.render();
            self.Bird.update(dt);

            self.gameOver(self.Bird.x, self.Bird.y,self.Bird.pic, self.pipeArr);

        },16);
        self.canvas.addEventListener('click', function(e){
            self.Bird.speed = -.2;
            if (self.Bird.angle < -50) return;
            self.Bird.angle -= 50;
            // setTimeout(() => {self.Bird.speed = 0.002},3000)
        }, false);
    };
    // 游戏结束
    Game.prototype.gameOver = function (birdX, birdY, birdPic, pipeLocation) {
        var pipe = {};
        var succNum = 0;

        for(let i = 0; i < pipeLocation.length; i++){
            if (birdX < (pipeLocation[i].x + pipeLocation[i].picWidth)) {
                pipe = pipeLocation[i];
                succNum = i; // 成功次数
                break;
            }
        }

        if(birdY < 0 || (birdY + birdPic.h) > this.h*0.85 ){ //碰到天和地
            clearInterval(this.timer);
            console.log('到边了');
            console.log("得分 = "+succNum)
        }
        // console.log('鸟上缘='+ birdY, '管子下缘='+pipe.pipeY1, '鸟下缘=' + (birdY + 48),'管子上缘='+pipe.pipeY2)
        if((birdX + birdPic.w) >= pipe.x && birdX <= (pipe.x+pipe.picWidth)){
            if (birdY >= pipe.pipeY1 && (birdY + birdPic.h) <= pipe.pipeY2) return;
            clearInterval(this.timer);
            console.log('撞管子了');
            console.log("得分 = "+succNum)
        }
    };

    let game = new Game({
        'canvasId': "canvas",
        "rUrl": "../R.json"
    });
    // game.init();


    // =========== 背景类 ==================

    let Background = window.Background = function () {
        this.bgPic = game.R.bg_day;
        this.x  = 0;
        this.w = 288;
        this.y = 512;
        this.speed = 1;
    };
    // 背景渲染
    Background.prototype.render = function () {
        game.ctx.drawImage(this.bgPic, this.x, game.canvas.height - this.y);
        game.ctx.drawImage(this.bgPic, this.x + this.w, game.canvas.height - this.y);
        game.ctx.drawImage(this.bgPic, this.x + this.w*2, game.canvas.height - this.y);
        game.ctx.fillStyle = '#47c0cb';
        game.ctx.fillRect(0,0,game.w,game.h - this.y);
    };
    // 背景更新
    Background.prototype.update = function () {
        this.x -= this.speed;
        if (this.x < -this.w) {
            this.x = 0;
        }
    };


    // ============ 大地类 =================

    let Land = window.Land = function () {
        this.landPic = game.R.land;
        // console.log(this.landPic)
        this.x  = 0;
        this.w = 288;
        this.y = 512;
        this.speed = 2;
    };
    // 大地渲染
    Land.prototype.render = function () {
        game.ctx.drawImage(this.landPic, this.x, game.canvas.height*0.85);
        game.ctx.drawImage(this.landPic, this.x + this.w, game.canvas.height*0.85);
        game.ctx.drawImage(this.landPic, this.x + this.w*2, game.canvas.height*0.85);
    };
    // 大地更新
    Land.prototype.update = function () {
        this.x -= this.speed;
        if (this.x < -this.w) {
            this.x = 0;
        }
    };

    // ============= 管子类 =================
    let Pipe = window.Pipe = function () {
        this.pipeUp = game.R.pipe_up;
        this.pipeDown = game.R.pipe_down;
        this.picHeight = 320; // 管子长度
        this.picWidth = 52;
        this.interSpace = 140; // 中间空隙
        this.airHeight = game.h * 0.85; // 用于放管子的高度（大地占屏幕的15%）
        this.x = game.w;
        this.speed = 2;

        this.maxHeight = this.picHeight;  // 管子最长规定
        this.minHeight = this.airHeight - this.interSpace - this.picHeight; // 管子最短规定

        this.upHeight = game.rnd(this.minHeight,this.maxHeight); // 规定内 管子随机长度

        this.upCoord   = parseInt(this.upHeight - this.picHeight); // 上方管子的坐标
        this.downCoord = parseInt(this.upHeight + this.interSpace); // 下方管子的坐标

        this.pipeY1 = this.upCoord + this.picHeight; //上方管子的底部y坐标
        this.pipeY2 = this.downCoord; // 下方管子的顶部y坐标
        game.pipeArr.push(this);

    };
    // 管子渲染
    Pipe.prototype.render = function () {
        game.ctx.drawImage(this.pipeDown, this.x, this.upCoord);
        game.ctx.drawImage(this.pipeUp, this.x, this.downCoord);

        // game.ctx.save();
        // game.ctx.fillStyle = 'rgba(0,0,0,0.2)';
        // game.ctx.moveTo(0,this.pipeY1);
        // game.ctx.lineTo(game.w,this.pipeY1);
        // game.ctx.lineTo(game.w,this.pipeY2);
        // game.ctx.lineTo(0,this.pipeY2);
        // game.ctx.fill();
        // game.ctx.restore();
    };
    // 管子更新
    Pipe.prototype.update = function () {
        this.x -= this.speed;
    };

    // ============= 小鸟类 ================
    let Bird = window.Bird = function () {
        this.birdPic = game.R.bird0_0;
        this.pic =   {
          w: 34,
          h: 24
        };
        this.x = 48;
        this.y = game.h * .5;
        this.t = 20;
        this.v = 0;
        this.speed = 0;
        this.a = .0004;
        this.angle = 1;
    };

    Bird.prototype.render = function (){
        // game.ctx.drawImage(this.birdPic, this.x, this.y);
        this.origin = {
            x: this.x + this.pic.w / 2,
            y: this.y + this.pic.h / 2
        };
        game.ctx.save();
        game.ctx.translate(this.origin.x, this.origin.y);
        game.ctx.rotate((this.angle / 180) * Math.PI); // 1弧度
        console.log(this.angle)
        // console.log(this.origin.x,this.origin.y)
        game.ctx.drawImage(this.birdPic, -this.pic.w / 2, -this.pic.h / 2);
        game.ctx.restore();
    };

    Bird.prototype.update = function (dur) {
        this.speed = this.speed + this.a * dur;
        this.y = parseInt(this.y + this.speed * dur);

        if (this.angle > 50) return;
        this.angle += 1;
    };

    window.ontouchstart = function(e) { e.preventDefault(); };

