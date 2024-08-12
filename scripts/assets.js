import { textureIds, texturePaths, soundIds, soundPaths, musicIds, musicPaths } from "./resourcePaths.js";

export default function loadAssets() {
  // load sprites
  batchAssets(textureIds, texturePaths, "sprite");
  // load sound
  batchAssets(soundIds, soundPaths, "sound");
  // load music
  batchAssets(musicIds, musicPaths, "music");
  
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

function batchAssets(ids, paths, loadType) {
  for (var i = 0; i < ids.length; i++) {
    if (loadType == "sprite") {
      loadSprite(ids[i], paths[i]);
    } else if (loadType == "sound") {
      loadSound(ids[i], paths[i]);
    } else if (loadType == "music") {
      loadMusic(ids[i], paths[i]);
    } else {
      console.error("Textures failed to load! Invalid loadType.");
    }
  }
}
