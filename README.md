## DiscordJS Reaction Menu
A simple, modern and easy to use reaction menu for [discord.js](https://discord.js.org).

[![NPM](https://img.shields.io/npm/v/@xenon-devs/discordjs-reaction-menu?label=yarn%20add%20%40xenon-devs%2Fdiscordjs-reaction-menu&style=flat-square)](https://www.npmjs.com/package/@xenon-devs/discordjs-reaction-menu)

### Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [ReactionMenu](#reactionmenu)
- [IMenuPage](#imenupage)
- [IControlsEmojis](#icontrolsemojis)
- [Examples](#examples)

### Installation
Install using npm:
```
npm install @xenon-devs/discordjs-reaction-menu
```
Or using yarn:
```
yarn add @xenon-devs/discordjs-reaction-menu
```

### Usage
This package exports a single class, [`ReactionMenu`](#reactionmenu). Typescript typings are also included.

Usage:
```js
const { ReactionMenu } = require('@xenon-devs/discordjs-reaction-menu');

const menu = new ReactionMenu({ // Initialize
  pages,
  channel,
  timeout
})

menu.start([user1Id, user2Id]); // Start
```
See more [examples](#examples).

### ReactionMenu
This is the base class. See [usage](#usage).

Constructor:
`ReactionMenu(pages, channel, timeout = 60, customControlsEmojis = ReactionMenu.ControlsEmojiDefaults)`

Arguments:
1. `pages`: An array of [IMenuPage](#imenupage)s.
2. `channel`: A [TextChannel](https://discord.js.org/#/docs/main/stable/class/TextChannel) or [DMChannel](https://discord.js.org/#/docs/main/stable/class/DMChannel) to send the menu in.
3. `timeout`: The time (in seconds) after which the menu stops working. (Default: `60`)
4. `customControlsEmojis`: Optional custom [controls emojis](#icontrolsemojis) ie the next and back buttons. (Default: see `ControlsEmojiDefaults` in the `ReactionMenu` properties below)

Properties:
- `controlsEmojis`: [IControlsEmojis](#icontrolsemojis).
- `menuMessage`: The message which is sent with the menu embed.
- `reactionCollector`: The [ReactionCollector](https://discord.js.org/#/docs/main/stable/class/ReactionCollector) associated with the menu.
- `listenTo`: An array of [User.id](https://discord.js.org/#/docs/main/stable/class/User?scrollTo=id). Only these users can change the menu pages. Set in the `start` method below.
- `currentPaage`: The 0-indexed number of the current page, that is, it's index in the `pages` property.
- `timeout`: The timeout in seconds after which the menu stops working.
- `static ControlsEmojiDefaults`: The defaults for the `controlsEmojis` property above. It's value is:
  ```
  {
    first: '⏮️',
    next: '➡️',
    back: '⬅️',
    last: '⏭️'
  }
  ```

Methods:
- `start(listenTo, startPage)`: Sends the menu embed and starts the menu.
  - `listenTo`: An array of [User.id](https://discord.js.org/#/docs/main/stable/class/User?scrollTo=id). Only these users can change the menu pages.
  - `startPage`: The 0-indexed page at which the menu starts. (Default: `0`)

- `displayPage(pageNumber)`: Display a page manually in code (apart from the reactions).
  - `pageNumber`: 0-indexed number of the page to be displayed.

- `stop()`: Stops the menu manually, before the timeout.

### IMenuPage
An object of the format:
```js
{
  pageEmbed: embed, // The embed for this page.
  customReaction?: string // Optional custom emoji to jump to this page.
}
```
Properties:
- `pageEmbed`: [MessageEmbed](https://discord.js.org/#/docs/main/stable/class/MessageEmbed) for this page.
- `customReaction`: Optional [emoji](https://discord.js.org/#/docs/main/stable/class/Emoji?scrollTo=name) string in the menu to jump to this page.

### IControlsEmojis
An object of the format:
```js
{
  first: string, // Emoji to jump to the first page
  next: string, // Emoji to go to the next page
  back: string, // Emoji to go to the previous page
  last: string // Emoji to jump to the last page
}
```
Default: See `ControlsEmojiDefaults` property in [ReactionMenu](#reactionmenu).

### Examples
1. Simplest Reaction Menu.
```js
const { ReactionMenu } = require('@xenon-devs/discordjs-reaction-menu');
const { MessageEmbed } = require('discord.js');

const menu = new ReactionMenu(
  [
    {
      pageEmbed: new MessageEmbed().setTitle('Page 1').setDescription('Click on emojis below to navigate.')
    },
    {
      pageEmbed: new MessageEmbed().setTitle('Page 2')
    }
    },
    {
      pageEmbed: new MessageEmbed().setTitle('Page 3')
    }
  ],
  msg.channel // Get from an on('message') event listener.
)

menu.start([msg.author.id]) // Get from an on('message') event listener.
```

2. Custom Controls Emojis.
```js
const { ReactionMenu } = require('@xenon-devs/discordjs-reaction-menu');
const { MessageEmbed } = require('discord.js');

const menu = new ReactionMenu(
  [
    {
      pageEmbed: new MessageEmbed().setTitle('Page 1').setDescription('Click on emojis below to navigate.')
    },
    {
      pageEmbed: new MessageEmbed().setTitle('Page 2')
    }
    },
    {
      pageEmbed: new MessageEmbed().setTitle('Page 3')
    }
  ],
  msg.channel, // Get from an on('message') event listener.
  60, // 60 seconds
  {
    next: '▶️',
    first: '🏠',
    back: '◀️',
    last: '📄'
  }
)

menu.start([msg.author.id]) // Get from an on('message') event listener.
```

3. Custom Page Jump Emojis.
```js
const { ReactionMenu } = require('@xenon-devs/discordjs-reaction-menu');
const { MessageEmbed } = require('discord.js');

const menu = new ReactionMenu(
  [
    {
      pageEmbed: new MessageEmbed().setTitle('Page 1').setDescription('Click on emojis below to navigate.'),
      customReaction: '🏠' // Click on this emoji to jump to this page
    },
    {
      pageEmbed: new MessageEmbed().setTitle('Page 2 | Cats'),
      customReaction: '🐱' // Click on this emoji to jump to this page
    }
    },
    {
      pageEmbed: new MessageEmbed().setTitle('Page 3 | Dogs'),
      customReaction: '🐶' // Click on this emoji to jump to this page
    }
  ],
  msg.channel // Get from an on('message') event listener.
)

menu.start([msg.author.id]) // Get from an on('message') event listener.
```
