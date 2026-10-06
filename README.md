**WELCOME TO THE ONIONVERSE**  
![Image](assets/sprites/onion.png)

## Onion's Life

An EPIC game for web where you play as an Onion going on adventures through mazes and labyrinths. Feel free to contribute levels, and help optimize the code.

You can play it on our website [here](https://play.onions.life).

This is the *best* new viral platformer game. Onion's Life is one of the most popular new platforming games with tons of fun levels, and now you can play with your friends or people across the world for endless racing fun. Check out the game for hours of free platformer fun with no ads.


> "Surprisingly Addicting! No better way to spend your day."
>     
> \- The Regal Eagle

> "The last level was so hard, but I couldn't stop playing it!"
>
> \- Onion's Life player

## Develop New Levels

Onion's Life has an intuitive level builder that you can access [here](https://design.onions.life/)! Here's how you can take your brand new creation and run it in Onion's Life:

1. Go to the [builder](https://design.onions.life/)
2. Click `Save`
3. Click `Test Level in Game`
4. This should open Onion's Life with your custom level!

Congratulations! You developed a new level for Onion's Life! When it's ready to deploy, create a PR into the [levels.js](scripts/game/levels.js) file.

## Add Achievements

Achievements are their own sprites. Here's how to add one:

1. Add a new sprite that hasn't been used before to [levels.js](scripts/game/levels.js)
2. Here is an example of the format:

```
"a": () => [
      sprite("achievement"),
      area(),
      offscreen({ hide: true }),
      anchor("bot"),
      "achievement",
      {
        achName: "Demo Trophy",
        achDesc: "Demo Trophy description",
        achSprite: "achievement",
      },
    ],
```
3. Add the sprite to a level (not supported yet in level designer)
4. Make a PR with your level's achievement
5. We might accept your achievement into the game!

## Related Repositories

1. [randomalt1123/randomalt1123.github.io](https://github.com/randomalt1123/randomalt1123.github.io)
- Contains the home page of the website ([onions.life](https://onions.life))
2. [LagTheSystem/OnionsPack](https://github.com/LagTheSystem/OnionsPack)
- Contains an Onion's Life resource pack template
