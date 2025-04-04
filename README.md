# Generation Ship 2

***In active development***

![Screenshot of vanilla JS gameplay. Its meant to evoke Dwarf Fortress.](public/Screenshot.png)
![Screenshot of a version that uses game modules to render a CSS 3D flying demo. The style is meant to be vaporwave-y.](public/vaporwave.png)

This is a remake of a previous game I built a few years ago. You can find the code for that project [here](https://github.com/andrewlaskey/generation-ship) or play it [here](https://generation-ship.vercel.app/). I also wrote a bit about the motivations and design goals for the original game [here](https://www.andrewlaskey.com/Andrew-Laskey-8f215a2f56104b2dae16c6d7f534f041?p=5135555e41824b7fbcbab09d3d68f332&pm=s).

For this new version I had a couple objectives. First I wanted to improve the code organization and test coverage so that making gameplay changes would be easier. Second I wanted to abstract the rendering and UI from the game mechanics. I did this so that it would possibly make it easier to port the code into a game engine like Unity or Godot. Finally I had some gameplay ideas that I had never implemented in the first version, like upgrades, bonuses, user score history, and being able to navigate the game world in 3d.

I've been posting updates of my progress on [bluesky](https://bsky.app/profile/andrewlaskey.bsky.social) if you'd like to follow me there.

## About the Game

The goal of the game is to maximize the health of a ship before it reaches its destination planet for colonization. Generation ships a named that because due to the incredible distances of space, it would take potentially generations of people living aboard a ship for years or centuries to reach nearby star systems. The health of the ship is measured by population and sort of a wishy-washy ecological health metric.

The player places tiles on a grid each turn. The grid then updates every space following rules inspired by Conway's Game of Life. This is meant to represent the interplay and dependency humans have with their environment.

## Setup

`npm install`

### Development

`npm run dev`

### Tests

`npm run test`

.