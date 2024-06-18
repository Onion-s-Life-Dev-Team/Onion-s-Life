export default function loadBagAssets() {
  loadSprite("onion", "assets/sprites/onion.png")
  loadSprite("grass5", "assets/sprites/grass5.png")
  loadSprite("grass25", "assets/sprites/grass25.png")
  loadSprite("bigonion", "assets/sprites/bigonion.png")
  loadSprite("grass", "assets/sprites/grass.png")
  loadSprite("coin", "assets/sprites/coin.png")
  loadSprite("portal", "assets/sprites/portal1.png")
  loadSprite("spike", "assets/sprites/spike.png")
  loadSprite("spike3", "assets/sprites/spike3.png")
  loadSprite("spike9", "assets/sprites/spike9.png")
  loadSprite("dspike", "assets/sprites/dspike.png")
  loadSprite("invisdanger", "assets/sprites/invisdanger.png")
  loadSprite("invis25", "assets/sprites/invis25.png")
  loadSprite("jumpy", "assets/sprites/jumpy.png")
  loadSprite("heart", "assets/sprites/heart.png")
  loadSprite("cloud", "assets/sprites/cloud.png")
  loadSprite("boom", "assets/sprites/boom.png")
  loadSprite("key", "assets/sprites/key.png")
  loadSprite("door", "assets/sprites/door.png")
  loadSprite("coasterLeft", "assets/sprites/coasterLeft.png")
  loadSprite("coasterRight", "assets/sprites/coasterRight.png")
  loadSprite("block", "assets/sprites/block.png")
  loadSprite("lvlbtn", "assets/sprites/lvlbtn.png")
  loadSprite("lvlSelect", "assets/sprites/lvlselect.png")
  loadSprite("startbtn", "assets/sprites/startbtn.png")
  loadSprite("keyboardB", "assets/sprites/keyboard_b.svg")
  loadSprite("keyboardR", "assets/sprites/keyboard_r.svg")
  loadSprite("arrowl", "assets/sprites/arrowl.png")
  loadSprite("signpostl", "assets/sprites/signpostl.png")
  loadSprite("signpostr", "assets/sprites/signpostr.png")
  loadSprite("signposte", "assets/sprites/signposte.png")
  loadSprite("arrowr", "assets/sprites/arrowr.png")
  loadSprite("lockedarrowr", "assets/sprites/lockedarrowr.png")
  loadSprite("rightmove", "assets/sprites/rightchevron.png")
  loadSprite("leftmove", "assets/sprites/chevronleft.png")
  loadSprite("jumpbutton", "assets/sprites/jumpbutton.png")
  loadSprite("restart", "assets/sprites/replay.png")
  loadSprite("home", "assets/sprites/home.png")
  loadSprite("jumpright", "assets/sprites/jumpright.png")
  loadSprite("jumpleft", "assets/sprites/jumpleft.png")
  loadSprite("ghost", "assets/sprites/ghosty.png")
  loadSprite("nopiracy", "assets/sprites/nopirates.png")
  loadSprite("darrow", "assets/sprites/darrow.png")
  loadSprite("fake", "assets/sprites/fake.png")
  loadSprite("dj", "assets/sprites/dj.png")
  loadSprite("skinsBtn", "assets/sprites/skinsBtn.png")
  loadSprite("achBtn", "assets/sprites/achBtn.png")
  // load sound
  loadMusic("OverworldlyFoe", "assets/sounds/OtherworldlyFoe.mp3")
  loadSound("death", "assets/sounds/bug.mp3")
  loadSound("portal", "assets/sounds/portal.mp3")
  loadSound("score", "assets/sounds/score.mp3")
  loadSound("jump", "assets/sounds/hit.mp3")
  loadSound("jumpy", "assets/sounds/spring.mp3")
  loadSound("win", "assets/sounds/error.mp3")
  loadSprite("onion-red", "assets/sprites/onion-watermelon.png")
  loadSprite("onion-beach","assets/sprites/onion-beach.png")
  loadSprite("onion-watermelon", "assets/sprites/onion-watermelon2.png")
  loadSprite("onion-blue","assets/sprites/onion-blue.png")
  loadSprite("onion-gold","assets/sprites/onion-gold.png")
  loadSprite("onion-dark","assets/sprites/onion-dark.png")
  loadSprite("achievement", "assets/sprites/trophy.png")
  loadSprite("onion-eggplant", "assets/sprites/eggplant-onion.png")
  loadSprite("onion-magic", "assets/sprites/magic-onion.png")
  loadSprite("onion-pumpkin","assets/sprites/pumpkin-onion.png")
  loadSprite("onion-invert","assets/sprites/onionInvert.png")
  loadSprite("onion-secret","assets/sprites/onion-secret.png")
  
  loadSprite("water", "assets/sprites/water.png")
  loadSprite("sand", "assets/sprites/sand.png")
  loadSprite("ghostiny","assets/sprites/ghostiny.png")
  loadSprite("bag", "assets/sprites/bag.png")
  
  loadFont('apl386', 'assets/apl386.woff2', { outline: 4, filter: 'linear'})

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
      text: "Loading " + Math.round(loadProgress() * 100) + "% " + ".".repeat(wave(1, 4, time() * 12)),
      font: "monospace",
      size: 24,
      anchor: "center",
      pos: center().add(0, 70),
    })

  })
}
