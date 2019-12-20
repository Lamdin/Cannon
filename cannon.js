window.addEventListener('load',function(e) {
  var Q = window.Q = Quintus()
                     .include('Input,Sprites,Scenes,SVG,Physics')
                     .svgOnly()
                     .setup('quintus',{ maximize: true });


  document.body.style.backgroundColor = 'pink';

  var KEY_NAMES = Q.KEY_NAMES = {
    LEFT: 37, RIGHT: 39,
    UP: 38, DOWN: 40,

    ZERO : 48, ONE : 49, TWO : 50,
    THREE : 51, FOUR : 52, FIVE : 53,
    SIX : 54, SEVEN : 55, EIGHT : 56,
    NINE : 57,

    A : 65, B : 66, C : 67,
    D : 68, E : 69, F : 70,
    G : 71, H : 72, I : 73,
    J : 74, K : 75, L : 76,
    M : 77, N : 78, O : 79,
    P : 80, Q : 81, R : 82,
    S : 83, T : 84, U : 85,
    V : 86, W : 87, X : 88,
    Y : 89, Z : 90,

    ENTER: 13,
    ESC: 27,
    BACKSPACE : 8,
    TAB : 9,
    SHIFT : 16,
    CTRL : 17,
    ALT : 18,
    SPACE: 32,

    HOME : 36, END : 35,
    PGGUP : 33, PGDOWN : 34
  };

  var DEFAULT_KEYS = {
    LEFT: 'left', RIGHT: 'right',
    UP: 'up',     DOWN: 'down',
    SPACE: 'fire',
    Z: 'fire',
    X: 'action',
    ENTER: 'confirm',
    ESC: 'esc',
    P: 'P',
    S: 'S'
  };

  Q.Sprite.extend('CannonBall',{
    init: function(props) {
      this._super({
        shape: 'circle',
        color: 'black',
        r: 8,
        restitution: 0.5,
        density: 4,
        x: props.dx * 50 + 10,
        y: props.dy * 50 + 210,
        seconds: 10
      });
      this.add('physics');
      this.on('step',this,'countdown');
    },

    countdown: function(dt) {
      this.p.seconds -= dt;
      if(this.p.seconds < 0) { 
        this.destroy();
      } else if(this.p.seconds < 1) {
        this.set({ "fill-opacity": this.p.seconds });
      }
    }
  });

  Q.Sprite.extend('Cannon',{
    init: function(props) {
      this._super({
        shape:'polygon',
        color: 'white',
        points: [[ 0,0 ], [0,-5], [5,-10], [8, -11], [40, -11], 
                  [ 40, 11], [8, 11], [5, 10], [0, 5] ],
        x: 10,
        y: 210
      });
    },

    fire: function() {
      var dx = Math.cos(this.p.angle / 180 * Math.PI),
          dy = Math.sin(this.p.angle / 180 * Math.PI),
          ball = new Q.CannonBall({ dx: dx, dy: dy, angle: this.p.angle });
      Q.stage().insert(ball);
      ball.physics.velocity(dx*475,dy*475);
    }
  });

  var targetCount = 0;
  Q.Sprite.extend('Target',{
    init: function(props) {
      this._super( Q._extend(props,{
        shape: 'circle',
        color: 'rgb(255, 0, 100)',
        r: 8
      }));
      targetCount++;
      this.add('physics');
      this.on('contact',this,'checkHit');
    },

    checkHit: function(sprite) {
      if(sprite instanceof Q.CannonBall) {
        targetCount--;
        this.destroy();
        if(targetCount == 0) { Q.stageScene('level'); }
      }
    }
  });

  Q.scene('level',new Q.Scene(function(stage) {
    targetCount = 0;
    stage.add("world");
    stage.insert(new Q.Sprite({ 
      x: 250, y: 250, w: 1250, h: 50, type:"static"
    }))

    stage.insert(new Q.Sprite({ w: 50, h: 100, x: 500, y: 200 }));

    stage.insert(new Q.Sprite({
      points: [[ 0,0 ], [ 50, -50 ],[150, -50],[200,0]],
      x: 200,
      y: 225,
      type:'static',
      shape: 'polygon'
    }));

    if (Q.input.on('action')) { Q.stageScene('level'); }; 

	// Drawing the first target area
    stage.insert(new Q.Sprite({ w: 50, h:50, x: 300, y: 150 }));
    stage.insert(new Q.Sprite({ w: 25, h:25, x: 300, y: 115 }));
	// Drawing the third target area
	stage.insert(new Q.Sprite({ w: 50, h:50, x: 700, y: 200 }));
	stage.insert(new Q.Sprite({ w: 25, h: 25, x: 700, y: 175 }));
  // Drawing the outer walls
  stage.insert(new Q.Sprite({ w: 25, h: 500, x: 0, y: 10, type:"static"})) //left wall
  stage.insert(new Q.Sprite({ w: 800, h: 25, x: 400, y: -50, type:"static"})) //roof
  stage.insert(new Q.Sprite({ w: 25, h: 500, x: 800, y: 10, type:"static"})) //right wall

    stage.each(function() { this.add("physics"); });
	// Drawing all the targets
    stage.insert(new Q.Target({ x: 500, y: 90 }));
    stage.insert(new Q.Target({ x: 300, y: 90 }));
	  stage.insert(new Q.Target({ x: 700, y: 90 }));

    stage.cannon = stage.insert(new Q.Cannon());
    stage.viewport(600,400);
    stage.centerOn(400,150);
      
  }));
  	Q.stageScene("level");
  	var cannonMove=function(e) {
    var stage = Q.stage(0), 
        cannon = stage.cannon,
        touch = e.changedTouches ?  
                e.changedTouches[0] : e,
        point = stage.browserToWorld(touch.pageX,touch.pageY);
   
    	var angle = Math.atan2(point.y - cannon.p.y,
                           point.x - cannon.p.x);
	    cannon.p.angle = angle * 180 / Math.PI;
	    e.preventDefault();
  	};
    Q._each(["touchstart","mousemove","touchmove"],function(evt) {
        Q.wrapper.addEventListener(evt,cannonMove);
    },this);

	var canonFire=function(e) {
		Q.stage(0).cannon.fire();
   		e.preventDefault();
	}
	Q._each(["touchend","mouseup"],function(evt) {
		Q.wrapper.addEventListener(evt,canonFire);
	});
});