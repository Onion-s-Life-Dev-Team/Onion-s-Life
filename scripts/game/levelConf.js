// Tile configuration for level data in levels.js.
// Ground/sand/water tiles return null because the level pipeline handles them.

export const levelConf = {
  tileWidth: 64,
  tileHeight: 64,

  tiles:{
    "=": () => null,
    "?": () => [
      sprite("fake"),
      area({ isSensor: true }),
      scale(1),
      offscreen({ hide: true }),
      anchor("bot"),
      "ground"
    ],
    "$": () => [
      sprite("coin"),
      area({ isSensor: true }),
      offscreen({ hide: true }),
      anchor("bot"),
      "coin",
    ],
    "^": () => [
      sprite("spike"),
      area(),
      body({ isStatic: true }),
      offscreen({ hide: true }),
      anchor("bot"),
      "danger",
    ],
    "`": () => [
      sprite("spike3"),
      area(),
      body({ isStatic: true }),
      offscreen({ hide: true, distance: 96 }),
      anchor("bot"),
      "danger",
    ],
    "&": () => [
      sprite("spike9"),
      area(),
      body({ isStatic: true }),
      offscreen({ hide: true, distance: 288 }),
      anchor("bot"),
      "danger",
    ],
    "v": () => [
      sprite("dspike"),
      area(),
      body({ isStatic: true }),
      offscreen({ hide: true }),
      anchor("top"),
      "danger",
    ],
    "O": () => [
      sprite("portal"),
      area({ scale: 0.5, isSensor: true }),
      offscreen({ hide: true }),
      pos(0, -12),
      anchor("bot"),
      "portal",
    ],
    "l": () => [
      sprite("jumpy"),
      anchor("bot"),
      offscreen({ hide: true }),
      area({ isSensor: true }),
      "jumpy",
    ],
    "D": () => [
      sprite("door"),
      area(),
      body({ isStatic: true }),
      offscreen({ hide: true }),
      anchor("bot"),
      "door",
    ],
    "k": () => [
      sprite("key"),
      offscreen({ hide: true }),
      area({ isSensor: true }),
      anchor("bot"),
      "key",
    ],
    ">": () => [
      sprite("coasterRight"),
      area(),
      body({ isStatic: true }),
      offscreen({ hide: true }),
      anchor("bot"),
      "right",
    ],
    "<": () => [
      sprite("coasterLeft"),
      area(),
      body({ isStatic: true }),
      offscreen({ hide: true }),
      anchor("bot"),
      "left",
    ],
    ".": () => [
      sprite("block"),
      area(),
      offscreen({ hide: true }),
      body({ isStatic: true }),
      anchor("bot"),
    ],
    "{": () => [
      sprite("signpostl"),
      offscreen({ hide: true }),
      anchor("bot"), 
    ],
      "}": () => [
      sprite("signpostr"),
      offscreen({ hide: true }),
      anchor("bot"), 
    ],
      "-": () => [
      sprite("signposte"),
      offscreen({ hide: true }),
      anchor("bot"), 
    ],
      "i": () => [
      sprite("invisdanger"),
      offscreen({ hide: true }),
      area({ isSensor: true }),
      "danger",
      anchor("bot"),
    ],
    "#": () => [
      rect(2400, 32),
      area(new Rect(vec2(), 2400, 32), { isSensor: true }),
      offscreen({ hide: true, distance: 1 }),
      "danger",
      anchor("bot"),
      opacity(0),
    ],
    "S": () => [
      sprite("invisdanger"),
      area({ isSensor: true }),
      offscreen({ hide: true }),
      "spawn",
      anchor("bot"),
    ],
    "Q": () => [
      sprite("invisdanger"),
      area({ isSensor: true }),
      offscreen({ hide: true }),
      "arg",
      anchor("bot"),
    ],
    "G": () => [
      sprite("ghost"),
      patrol(),
      offscreen({ hide: true }),
      "enemy",
      anchor("bot"),
      area(), 
      body(), 
      ],
     "g": () => [
      sprite("ghostiny"),
      patrol(),
      offscreen({ hide: true }),
      "enemy",
      anchor("bot"),
      area(), 
      body(), 
      ],
    "!": () => [
      sprite("darrow"),
      anchor("bot"),
      offscreen({ hide: true }),
      area({ isSensor: true }),
      scale(0.25),
    ],
    "a": () => [
      sprite("achievement"),
      area({ isSensor: true }),
      offscreen({ hide: true }),
      anchor("bot"),
      "achievement",
      {
        achName: "First Trophy",
        achDesc: "You found your first trophy!",
        achSprite: "achievement",
      },
    ],
    "|": () => [
      sprite("achievement"),
      area({ isSensor: true }),
      offscreen({ hide: true }),
      anchor("bot"),
      "achievement",
      {
        achName: "ChatGPT superstar",
        achDesc: "You made it to the ChatGPT levels! Go you!",
        achSprite: "achievement",
      },
    ],
    ")": () => [
      sprite("achievement"),
      area({ isSensor: true }),
      offscreen({ hide: true }),
      anchor("bot"),
      "achievement",
      {
        achName: "RollerMaster",
        achDesc: "Up and down you goooooooo!",
        achSprite: "block",
      },
    ],
    "(": () => [
      sprite("achievement"),
      area({ isSensor: true }),
      offscreen({ hide: true }),
      anchor("bot"),
      "achievement",
      {
        achName: "Up for the Challenge",
        achDesc: "You're a tough character! Nothing can stop you!",
        achSprite: "spike",
      },
    ],
	  "*": () => [
      sprite("achievement"),
      area({ isSensor: true }),
      offscreen({ hide: true }),
      anchor("bot"),
      "achievement",
      {
        achName: "...",
        achDesc: " ",
        achSprite: "spike",
      },
    ],
  "u": () => [
      sprite("achievement"),
      area({ isSensor: true }),
      offscreen({ hide: true }),
      anchor("bot"),
      "achievement",
      {
        achName: "Explored the Depths",
        achDesc: "You went deep under the sea in Onion's Life!",
        achSprite: "water",
      },
    ],
    "s": () => null,
    "w": () => null,
    "b": () => [
      sprite("invisdanger"),
      area({ isSensor: true }),
      offscreen({ hide: true }),
      anchor("bot"),
      "gravityreset"
    ],
    "2": () => [
      sprite("winSpin"),
      area({ isSensor: true }),
      offscreen({ hide: true }),
      anchor("center"),
      rotate(0),
      scale(0.25),
      "winSpin"
    ],
    "4": () => [
      sprite("lightbulb"),
      area(),
      body({ isStatic: true }),
      scale(1),
      offscreen({ hide: true }),
      anchor("bot"),
      "lightbulb"
    ],
  },
  
}
function patrol(speed = 60, dir = 1) {
	return {
		id: "patrol",
		require: [ "pos", "area", ],
		add() {
			this.on("collide", (obj, col) => {
				if (col.isLeft() || col.isRight()) {
					dir = -dir
				}
			})
		},
		update() {
			this.move(speed * dir, 0)
		},
	}
}
