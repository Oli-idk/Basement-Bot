import { ChannelType, Client, Collection, Message } from "discord.js";
import rewards from "~/config/rewards.json";
import prisma, { addXp } from "~/functions/database";

const xpCooldowns = new Collection<string, number>();

export default async (client: Client, message: Message) => {
  if (message.author.bot) return;
  if (message.channel.type != ChannelType.GuildText) return;
  const userId = message.author.id;

  const cooldownExpiration = xpCooldowns.get(userId);
  const now = Date.now();

  if (cooldownExpiration && now < cooldownExpiration) return;

  xpCooldowns.set(userId, now + 5000);

  const xpAmount = Math.floor(Math.random() * 5) + 1;

  try {
    ;
    const newXp = await addXp(message.author, message.guild!.id, xpAmount);
    if (newXp.leveledUp) {
      const reward = await prisma.level_rewards.findUnique({
        where: {
          guildId_level: {
            guildId: message.guild!.id,
            level: newXp.newLevel,
          },
        },
      });
      if (reward) {
        const role = message.guild?.roles.cache.get(reward.role);
        if (role) {
          message.member?.roles.add(role);
        }
        if (reward.message) {
          message.channel.send(reward.message
            .replace("{USER MENTION}", `<@${message.author.id}>`)
            .replace("{USERNAME}", message.author.username)
            .replace("{SERVER NAME}", message.guild!.name)
            .replace("{LEVEL}", newXp.newLevel.toString())
            );
        }
      }
      message.channel.send(`Congratulations ${message.author!.username}! You have leveled up to level ${newXp.newLevel}!`);
    }
  } catch (err) {
    logger.error(err);
  }
};