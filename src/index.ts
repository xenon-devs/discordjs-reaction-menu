import { MessageEmbed, TextChannel, DMChannel, Message, ReactionCollector, MessageReaction } from 'discord.js';

export interface IControlsEmojis {
  first: string,
  next: string,
  back: string,
  last: string
}

export interface IMenuPage {
  pageEmbed: MessageEmbed,
  customReaction?: string
}

export class ReactionMenu {
  private pages: IMenuPage[] = [];
  controlsEmojis: IControlsEmojis;
  private allEmojis: string[] = [];
  private channel: TextChannel | DMChannel;
  menuMessage: Message;
  reactionCollector: ReactionCollector;
  listenTo: string[]; // Array of user IDs
  currentPage: number = 0;
  timeout: number = 60;

  static ControlsEmojiDefaults = {
    first: '⏮️',
    next: '➡️',
    back: '⬅️',
    last: '⏭️'
  }

  /**
   * Constructor of ReactionMenu class
   * @param pages An array of pages for the menu
   * @param channel The channel in which the embed should be send
   * @param timeout The time (in seconds) after which the menu stops working
   * @param customcontrolsEmojis Optional custom controls emojis, that is, the next and back buttons
   */
  constructor(
    pages: IMenuPage[],
    channel: TextChannel | DMChannel,
    timeout: number = 60,
    customcontrolsEmojis: IControlsEmojis = ReactionMenu.ControlsEmojiDefaults
  ) {
    this.pages = pages;
    this.channel = channel;
    this.timeout = timeout;

    this.controlsEmojis = customcontrolsEmojis;
    for (let emoji in this.controlsEmojis) this.allEmojis.push(this.controlsEmojis[emoji]);
  }

  /**
   * Starts the reaction menu
   * @param listenTo An array of IDs of users who can change the embed
   * @param startPage The 0-indexed page at which the menu starts
   */
  async start(
    listenTo: string[],
    startPage: number = 0
  ) {
    this.listenTo = listenTo;

    try {
      this.menuMessage =  await this.channel.send(this.pages[startPage].pageEmbed);
      this.currentPage = startPage;

      await this.menuMessage.react(this.controlsEmojis.first);
      await this.menuMessage.react(this.controlsEmojis.next);

      // Add custom page emojis
      for (const page of this.pages) {
        if (page.customReaction) {
          await this.menuMessage.react(page.customReaction);
          this.allEmojis.push(page.customReaction);
        }
      }
      // /Add custom page emojis

      await this.menuMessage.react(this.controlsEmojis.back);
      await this.menuMessage.react(this.controlsEmojis.last);

      this.reactionCollector = this.menuMessage.createReactionCollector(
        ({emoji}, user) => {
          return this.allEmojis.includes(emoji.name) &&
            !user.bot &&
            this.listenTo.includes(user.id)
        },
        {
          dispose: true,
          time: this.timeout * 1000
        }
      )

      this.reactionCollector.on('collect', (reaction) => {
        this.handleReaction(reaction);
      })
      this.reactionCollector.on('remove', (reaction) => {
        this.handleReaction(reaction);
      })
    }
    catch (e) {
      throw e;
    }
  }

  handleReaction(reaction: MessageReaction) {
    switch (reaction.emoji.name) {
      case this.controlsEmojis.first:
        this.displayPage(0)
        break;
      case this.controlsEmojis.last:
        this.displayPage(this.pages.length - 1);
        break;
      case this.controlsEmojis.next:
        this.displayPage(Math.min(this.pages.length - 1, this.currentPage + 1));
        break;
      case this.controlsEmojis.back:
        this.displayPage(Math.max(0, this.currentPage - 1));
        break;
      default:
        for (let i = 0; i < this.pages.length; i++) {
          if (this.pages[i].customReaction) {
            if (this.pages[i].customReaction === reaction.emoji.name) {
              this.displayPage(i);
              break;
            }
          }
        }
        break;
    }
  }

  /**
   * Displays a certain page
   * @param pageNumber 0-indexed number of the page to be displayed
   */
  async displayPage(pageNumber: number = 0) {
    if (!this.menuMessage) throw new Error('Use .start() first.');
    else if (!this.pages[pageNumber]) throw new Error('Page number invalid.');
    else {
      if (this.currentPage !== pageNumber) {
        try {
          this.currentPage = pageNumber;
          return await this.menuMessage.edit(this.pages[pageNumber].pageEmbed);
        }
        catch (e) {
          throw e;
        }
      }
    }
  }

  /**
   * Stops the reaction menu
   */
  stop() {
    this.reactionCollector.stop();
  }
}
