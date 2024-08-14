import { textures, sounds, music } from "./resourcePaths.js";

/*
 * Go to scripts/resourcePaths.js to add new textures/sounds/music
 * - LagTheSystem
 */

export default function loadAssets() {
  // load sprites
  batchAssets(textures, "sprite");
  // load sound
  batchAssets(sounds, "sound");
  // load music
  batchAssets(music, "music");
  
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

function batchAssets(data, loadType) {
  data.forEach((element) => {
    if (loadType == "sprite") {
      loadSprite(element[0], element[1]);
    } else if (loadType == "sound") {
      loadSound(element[0], element[1]);
    } else if (loadType == "music") {
      loadMusic(element[0], element[1]);
    } else {
      console.error(element[0] + " failed to load! Invalid loadType.");
    }
  });
}
