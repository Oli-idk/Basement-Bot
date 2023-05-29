import { Command } from '~/types/Objects';
import Blacklist from '~/options/blacklist';
import { EmbedBuilder, TextChannel } from 'discord.js';
import { PrismaClient } from '@prisma/client';

export const blacklist: Command = {
    description: "blacklist a user from gaining xp",
    ownerOnly: true,
    options: Blacklist,
    execute: async function (interaction, args) {
        const user = args.getUser("user", true);
        const reason = args.getString("reason", true);
        const type = args.getString("type", true);

        const blacklistChannel = interaction.guild?.channels.cache.get(process.env.BLACKLIST_CHANNEL as string) as TextChannel;

        const prisma = new PrismaClient();
        const embed = new EmbedBuilder()
        .setDescription(`User: ${user.tag} (${user.id})\nReason: ${reason}`)

        if(type == "add"){
            const blacklist = await prisma.blacklist.upsert({
                where: { userId: user.id },
                update: {},
                create: { userId: user.id, reason: reason }
            })
            if(blacklist){
                embed.setTitle("User blacklisted")
                .setColor("#FF0000")
                blacklistChannel.send({embeds: [embed]});
                return
            }
            interaction.editReply("User is already blacklisted!");
        }else if (type == "remove") {
            const blacklist = await prisma.blacklist.findUnique({
                where: { userId: user.id }
            })
            if(blacklist){
                embed.setTitle("User unblacklisted")
                .setColor("#00FF00")
                blacklistChannel.send({embeds: [embed]});
                return
            }
            interaction.editReply("User is not blacklisted!");
        }
    }
}