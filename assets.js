export default function loadAssets() {
  loadSprite("onion", "sprites/onion.png")
  loadSprite("grass5", "sprites/grass5.png")
  loadSprite("bigonion", "sprites/bigonion.png")
  loadSprite("grass", "sprites/grass.png")
  loadSprite("coin", "sprites/coin.png")
  loadSprite("portal", "sprites/portal.png")
  loadSprite("spike", "sprites/spike.png")
  loadSprite("dspike", "sprites/dspike.png")
  loadSprite("invisdanger", "sprites/invisdanger.png")
  loadSprite("jumpy", "sprites/jumpy.png")
  loadSprite("heart", "sprites/heart.png")
  loadSprite("cloud", "sprites/cloud.png")
  loadSprite("boom", "sprites/boom.png")
  loadSprite("key", "sprites/key.png")
  loadSprite("door", "sprites/door.png")
  loadSprite("block", "sprites/rect.png")
  loadSprite("lvlbtn", "sprites/lvlbtn.png")
  loadSprite("lvlSelect", "sprites/lvlselect.png")
  loadSprite("startbtn", "sprites/startbtn.png")
  loadSprite("arrowl", "sprites/arrowl.png")
  loadSprite("signpostl", "sprites/signpostl.png")
  loadSprite("signpostr", "sprites/signpostr.png")
  loadSprite("signposte", "sprites/signposte.png")
  loadSprite("arrowr", "sprites/arrowr.png")
  loadSprite("lockedarrowr", "sprites/lockedarrowr.png")
  loadSprite("rightmove", "sprites/rightchevron.png")
  loadSprite("leftmove", "sprites/chevronleft.png")
  loadSprite("jumpbutton", "sprites/jumpbutton.png")
  loadSprite("restart", "sprites/replay.png")
  loadSprite("home", "sprites/home.png")
  loadSprite("jumpright", "sprites/jumpright.png")
  loadSprite("jumpleft", "sprites/jumpleft.png")
  loadSprite("ghost", "sprites/ghosty.png")
  loadSprite("nopiracy", "sprites/nopirates.png")
  loadSprite("darrow", "sprites/darrow.png")
  loadSprite("fake", "sprites/fake.png")
  loadSprite("dj", "sprites/dj.png")
  loadSprite("skinsBtn", "sprites/skinsBtn.png")
  // load sound
  loadSound("OverworldlyFoe", "sounds/OtherworldlyFoe.mp3")
  loadSound("death", "sounds/bug.mp3")
  loadSound("portal", "sounds/portal.mp3")
  loadSound("score", "sounds/score.mp3")
  loadSound("jump", "sounds/hit.mp3")
  loadSound("jumpy", "sounds/spring.mp3")
  loadSound("win", "sounds/error.mp3")
  //import new onion's
  loadSprite("onion-red", "sprites/onion-watermelon.png")
  loadSprite("onion-beach","sprites/onion-beach.png")
  loadSprite("onion-watermelon", "sprites/onion-watermelon2.png")
  loadSprite("onion-blue","sprites/onion-blue.png")
  loadSprite("onion-gold","sprites/onion-gold.png")
  loadSprite("onion-dark","sprites/onion-dark.png")
  
  loadFont('apl386', 'apl386.ttf', { outline: 4, filter: 'linear'})

  // Custom loading screen
  // Runs the callback every frame during loading
  onLoading((progress) => {

    // Black background
    drawRect({
      width: width(),
      height: height(),
      color: rgb(0, 0, 0),
    })

    // A pie representing current load progress
    drawCircle({
      pos: center(),
      radius: 32,
      end: map(progress, 0, 1, 0, 360),
    })

    drawText({
      text: "Loading" + ".".repeat(wave(1, 4, time() * 12)),
      font: "monospace",
      size: 24,
      anchor: "center",
      pos: center().add(0, 70),
    })

  })
}
