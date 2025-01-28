**WELCOME TO THE ONIONVERSE**  
In our largest update yet, we have now implemented multiplayer. Have fun with your friends!

![Image](assets/sprites/onion.png)

## Onion's Life ##

An EPIC game for web where you impersonate an Onion and go on adventures through mazes and labyrinths. Feel free to contribute levels, and help optimize the code.

You can play it on our website [here](https://play.onions.life).  

This is the best new viral platformer game and we just added multiplayer. Onion's Life is one of the most popular new platforming games with tons of fun levels, and now you can play with your friends or people across the world for endless racing fun. Check out the game using the link in the description for hours of free platformer fun with no ads.


> "Surprisingly Addicting! No better way to spend your day."
>     
> ~The Regal Eagle

> "The last level was so hard, but I couldn't stop playing it!"
>
> -Onion's Life player


## DO YOU WANT YOUR OWN LEVEL TO BE ADDED TO ONION'S LIFE? ##

## Develop New Levels ##

Onion's Life has an intuitive level builder that you can access [here](https://design.onions.life/)! Here's how you can take your brand new creation and run it in Onion's Life:

1. Go to the [builder](https://design.onions.life/)
2. Click `Save`
3. Click `Test Level in Game`
4. This should open Onion's Life with your custom level!

Congratulations! You developed a new level for Onion's Life! When it's ready to deploy, create a PR into the [levels.js](levels.js) file.

## Add Achievements ##

Achievements are "there" own sprites. To add, do the following: (Surprise, surprise, Eli doesn't know grammar)

1. Add a new sprite that hasn't been used before to [levels.js](levels.js)
2. Make that sprite look like this:

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
a. Contains the home page of the website ([onions.life](https://onions.life))
2. [LagTheSystem/OnionsPack](https://github.com/LagTheSystem/OnionsPack)
a. Contains an Onion's Life resource pack template
