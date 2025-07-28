var game = new Phaser.Game(400, 490, Phaser.AUTO, "gameDiv");

var mainState = {

    preload: function () {
        if (!game.device.desktop) {
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        }

        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;

        game.stage.backgroundColor = '#71c5cf';

        game.load.image('bird', 'assets/man.png');
        game.load.image('pipe', 'assets/ball.png');
        game.load.image('bedEND', 'assets/bedEND.png');
        game.load.audio('jump', 'assets/jump.wav');
    },

    create: function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // 创建管道组
        this.pipes = game.add.group();
        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);

        // 创建小鸟
        this.bird = game.add.sprite(100, 245, 'bird');
        game.physics.arcade.enable(this.bird);
        this.bird.body.gravity.y = 1000;
        this.bird.anchor.setTo(-0.2, 0.5);
        this.bird.alive = true;

        // 跳跃控制
        var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);
        game.input.onDown.add(this.jump, this);

        // 分数显示
        this.score = 0;
        this.labelScore = game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" });

        // 跳跃音效
        this.jumpSound = game.add.audio('jump');
        this.jumpSound.volume = 0.2;

        // 创建游戏结束界面元素（初始隐藏）
        this.createGameOverUI();
    },

    // 创建游戏结束界面
    createGameOverUI: function() {
        // 半透明背景遮罩
        this.overlay = game.add.graphics(0, 0);
        this.overlay.beginFill(0x000000, 0.7);
        this.overlay.drawRect(0, 0, game.width, game.height);
        this.overlay.alpha = 0;
        this.overlay.inputEnabled = true; // 阻止点击穿透

        // 提示文字
        this.gameOverText = game.add.text(game.width/2, 100, "好像结局也不坏", {
            font: "24px Arial", 
            fill: "#ffffff",
            align: "center"
        });
        this.gameOverText.anchor.set(0.5);
        this.gameOverText.alpha = 0;

        // 显示man.png图片
        this.gameOverImage = game.add.sprite(game.width/2, 220, 'bedEND');
        this.gameOverImage.anchor.set(0.5);
        this.gameOverImage.scale.set(1.5); // 适当放大图片
        this.gameOverImage.alpha = 0;

        // 再来一次按钮
        this.restartButton = game.add.text(game.width/2, 350, "再来一次", {
            font: "28px Arial", 
            fill: "#ffffff",
            backgroundColor: "#ff0000",
            padding: {x: 20, y: 10}
        });
        this.restartButton.anchor.set(0.5);
        this.restartButton.alpha = 0;
        this.restartButton.inputEnabled = true;
        this.restartButton.events.onInputDown.add(this.restartGame, this);
        // 按钮悬停效果
        this.restartButton.events.onInputOver.add(function() {
            this.restartButton.scale.set(1.1);
        }, this);
        this.restartButton.events.onInputOut.add(function() {
            this.restartButton.scale.set(1);
        }, this);
    },

    // 显示游戏结束界面
    showGameOverUI: function() {
        // 渐入动画
        game.add.tween(this.overlay).to({alpha: 1}, 500, Phaser.Easing.Linear.None, true);
        game.add.tween(this.gameOverText).to({alpha: 1}, 500, Phaser.Easing.Linear.None, true);
        game.add.tween(this.gameOverImage).to({alpha: 1}, 500, Phaser.Easing.Linear.None, true);
        game.add.tween(this.restartButton).to({alpha: 1}, 500, Phaser.Easing.Linear.None, true);
    },

    update: function () {
        if (this.bird.y < 0 || this.bird.y > game.world.height)
            this.hitPipe(); // 超出边界也算碰撞

        game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this);

        // 小鸟旋转动画
        if (this.bird.angle < 20)
            this.bird.angle += 1;
    },

    jump: function () {
        if (!this.bird.alive)
            return;

        this.bird.body.velocity.y = -350;
        game.add.tween(this.bird).to({ angle: -20 }, 100).start();
        this.jumpSound.play();
    },

    hitPipe: function () {
        if (!this.bird.alive)
            return;

        this.bird.alive = false;
        game.time.events.remove(this.timer);
        
        // 停止所有管道移动
        this.pipes.forEach(function (p) {
            p.body.velocity.x = 0;
        }, this);

        // 显示游戏结束界面
        this.showGameOverUI();
    },

    restartGame: function () {
        // 重置游戏状态重新开始
        game.state.start('main');
    },

    addOnePipe: function (x, y) {
        var pipe = game.add.sprite(x, y, 'pipe');
        this.pipes.add(pipe);
        game.physics.arcade.enable(pipe);
        pipe.body.velocity.x = -200;
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },

    addRowOfPipes: function () {
        var hole = Math.floor(Math.random() * 5) + 1;

        for (var i = 0; i < 8; i++)
            if (i != hole && i != hole + 1)
                this.addOnePipe(400, i * 60 + 10);

        this.score += 1;
        this.labelScore.text = this.score;
    },
};

game.state.add('main', mainState);
game.state.start('main');
