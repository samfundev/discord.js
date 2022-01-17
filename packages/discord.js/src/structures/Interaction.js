'use strict';

const { DiscordSnowflake } = require('@sapphire/snowflake');
const { InteractionType, ApplicationCommandType, ComponentType } = require('discord-api-types/v9');
const Base = require('./Base');
const Permissions = require('../util/Permissions');

/**
 * Represents an interaction.
 * @extends {Base}
 */
class Interaction extends Base {
  constructor(client, data) {
    super(client);

    /**
     * The interaction's type
     * @type {InteractionType}
     */
    this.type = InteractionType[data.type];

    /**
     * The interaction's id
     * @type {Snowflake}
     */
    this.id = data.id;

    /**
     * The interaction's token
     * @type {string}
     * @name Interaction#token
     * @readonly
     */
    Object.defineProperty(this, 'token', { value: data.token });

    /**
     * The application's id
     * @type {Snowflake}
     */
    this.applicationId = data.application_id;

    /**
     * The id of the channel this interaction was sent in
     * @type {?Snowflake}
     */
    this.channelId = data.channel_id ?? null;

    /**
     * The id of the guild this interaction was sent in
     * @type {?Snowflake}
     */
    this.guildId = data.guild_id ?? null;

    /**
     * The user which sent this interaction
     * @type {User}
     */
    this.user = this.client.users._add(data.user ?? data.member.user);

    /**
     * If this interaction was sent in a guild, the member which sent it
     * @type {?(GuildMember|APIGuildMember)}
     */
    this.member = data.member ? this.guild?.members._add(data.member) ?? data.member : null;

    /**
     * The version
     * @type {number}
     */
    this.version = data.version;

    /**
     * The permissions of the member, if one exists, in the channel this interaction was executed in
     * @type {?Readonly<Permissions>}
     */
    this.memberPermissions = data.member?.permissions ? new Permissions(data.member.permissions).freeze() : null;

    /**
     * The locale of the user who invoked this interaction
     * @type {string}
     * @see {@link https://discord.com/developers/docs/dispatch/field-values#predefined-field-values-accepted-locales}
     */
    this.locale = data.locale;

    /**
     * The preferred locale from the guild this interaction was sent in
     * @type {?string}
     */
    this.guildLocale = data.guild_locale ?? null;
  }

  /**
   * The timestamp the interaction was created at
   * @type {number}
   * @readonly
   */
  get createdTimestamp() {
    return DiscordSnowflake.timestampFrom(this.id);
  }

  /**
   * The time the interaction was created at
   * @type {Date}
   * @readonly
   */
  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  /**
   * The channel this interaction was sent in
   * @type {?TextBasedChannels}
   * @readonly
   */
  get channel() {
    return this.client.channels.cache.get(this.channelId) ?? null;
  }

  /**
   * The guild this interaction was sent in
   * @type {?Guild}
   * @readonly
   */
  get guild() {
    return this.client.guilds.cache.get(this.guildId) ?? null;
  }

  /**
   * Indicates whether this interaction is received from a guild.
   * @returns {boolean}
   */
  inGuild() {
    return Boolean(this.guildId && this.member);
  }

  /**
   * Indicates whether or not this interaction is both cached and received from a guild.
   * @returns {boolean}
   */
  inCachedGuild() {
    return Boolean(this.guild && this.member);
  }

  /**
   * Indicates whether or not this interaction is received from an uncached guild.
   * @returns {boolean}
   */
  inRawGuild() {
    return Boolean(this.guildId && !this.guild && this.member);
  }

  /**
   * Indicates whether this interaction is a {@link CommandInteraction}.
   * @returns {boolean}
   */
  isCommand() {
    return InteractionType[this.type] === InteractionType.ApplicationCommand;
  }

  /**
   * Indicates whether this interaction is a {@link ChatInputCommandInteraction}.
   * @returns {boolean}
   */
  isChatInputCommand() {
    return InteractionType[this.type] === InteractionType.ApplicationCommand && typeof this.targetId === 'undefined';
  }

  /**
   * Indicates whether this interaction is a {@link ContextMenuCommandInteraction}
   * @returns {boolean}
   */
  isContextMenuCommand() {
    return InteractionType[this.type] === InteractionType.ApplicationCommand && typeof this.targetId !== 'undefined';
  }

  /**
   * Indicates whether this interaction is a {@link UserContextMenuCommandInteraction}
   * @returns {boolean}
   */
  isUserContextMenuCommand() {
    return this.isContextMenuCommand() && ApplicationCommandType[this.targetType] === ApplicationCommandType.User;
  }

  /**
   * Indicates whether this interaction is a {@link MessageContextMenuCommandInteraction}
   * @returns {boolean}
   */
  isMessageContextMenuCommand() {
    return this.isContextMenuCommand() && ApplicationCommandType[this.targetType] === ApplicationCommandType.Message;
  }

  /**
   * Indicates whether this interaction is an {@link AutocompleteInteraction}
   * @returns {boolean}
   */
  isAutocomplete() {
    return InteractionType[this.type] === InteractionType.ApplicationCommandAutocomplete;
  }

  /**
   * Indicates whether this interaction is a {@link MessageComponentInteraction}.
   * @returns {boolean}
   */
  isMessageComponent() {
    return InteractionType[this.type] === InteractionType.MessageComponent;
  }

  /**
   * Indicates whether this interaction is a {@link ButtonInteraction}.
   * @returns {boolean}
   */
  isButton() {
    return (
      InteractionType[this.type] === InteractionType.MessageComponent &&
      ComponentType[this.componentType] === ComponentType.Button
    );
  }

  /**
   * Indicates whether this interaction is a {@link SelectMenuInteraction}.
   * @returns {boolean}
   */
  isSelectMenu() {
    return (
      InteractionType[this.type] === InteractionType.MessageComponent &&
      ComponentType[this.componentType] === ComponentType.SelectMenu
    );
  }
}

module.exports = Interaction;