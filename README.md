# TimeBomb

This [Roll20](http://roll20.net/) script allows for the creation of player-controllable "time bombs" on the Combat Tracker in Roll20 games. Each Bomb you add to the Tracker will count down each round to zero, detonating the Bomb and sending an effect dialog to all players and replacing the Bomb token with a graphic representation the detonation.

## Set Up

TimeBomb requires two tokens: A "Bomb" token and a "Result" token. The Bomb token provides the number of rounds to start the countdown and the detonation chat effects. The Result token is a graphic representation of the detonation effect. Once you have set up your Bomb and Result tokens (see below), select both of them and use the `!bomb create` command.

### Bomb Token
Place a graphic on the VTT to represent your Bomb. Enter "Bomb" in the first Bar 1 field to designate it as the Bomb token. This token can be controlled by any number of players if desired, and the token name can be revealed to players as you see fit.

The Bomb's timer is round based. If you wish it to detonate after six rounds, enter "6" in the token's first Bar 2 field. This number will decrement by one each round. On reaching zero, the Bomb will detonate. If no number is provided, it will default to 10.

The detonation chat effects are stored in the Bomb token's GM Notes field. You can give as much information as you wish here, depending on your Bomb and what should happen once it's detonated. An alternative option is to use a [roll template](https://roll20.zendesk.com/hc/en-us/articles/360037257334-How-to-Make-Roll-Templates). This allows you to provide a melee or magical attack dialog with rolled damage, saving throw links/buttons and any other information you like that matches a familiar format.

If not using a roll template, you can still provide die roll expressions that will be executed whenever the Bomb is detonated. In your effect description, surround your die expression in @ signs, i.e. `@1d8+2@`. You may use as many die expressions as you want and each will be evaluated separately. You **should not** use @ signs for any other purpose or it will give unintended results.

### Result Token
Place a token on the VTT to represent the graphic effects of your Bomb. This could be a fireball, fallen debris, etc. Size and place this token as needed relative to the Bomb token. This relative location is stored for later detonation. If your Result token is centered on the Bomb token, for instance, the Result token will still be centered when the Bomb is detonated no matter where the Bomb was moved.

By default, the Result token will be placed below player tokens on the map layer. This allows the players to see the Bomb's effect and still access their tokens. If you wish to place the Result token over all player tokens, enter "tokens" into the second Bar 1 field.

## Starting the Countdown

The Bomb you created will sit quietly until you add it to the Turn Tracker. If the Tracker is not open, TimeBomb will open it to add the Bomb. To add a Bomb to the Tracker, select the Bomb token and use the `!bomb add` command.

You can add as many Bombs to the Turn Tracker as you wish, and each will count down as their turn comes up.

## Detonation

When a Bomb's counter reaches zero in the Turn Tracker, it will detonate. This replaces the Bomb token with the Result token, sends the chat effect to all players, and removes the Bomb from the Turn Tracker. The GM will also receive a dialog with buttons to hide the Result token (sending it to the Dynamic Lighting layer) if desired, or to reset the Bomb. Resetting a Bomb allows it to be added to the Turn Tracker again.

## Detection and Disarmament

Because of the many possible Bomb variants, detection and disarmament procedures are strictly left up to the GM. If you allow a Bomb to be disarmed while counting down in the Turn Tracker, you can simply delete it from the Tracker. If you want to let a failed disarm attempt to subtract rounds from the timer, the Bomb's Tracker entry can be edited like any other item.
