import { EmbedBuilder } from 'discord.js';
import { getTopUsers } from '~/functions/database';
import { Command } from '~/types/objects';

export const leaderboard: Command = {
    description: "display the level leaderboard",
    category: "levels",
    guildOnly: true,
    execute: async function (interaction, args) {
        const rows = await getTopUsers(interaction.guild!.id, 10);
        const fields = [];

        const embed = new EmbedBuilder()
            .setTitle("Leaderboard")
            .setDescription("Top 10 users by level")

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const user = await interaction.guild!.members.fetch(row.userId);
            fields.push({
                name: `${i + 1}. ${user.displayName}`,
                value: `Level ${row.level} (${row.xp} xp)`,
                inline: false
            })
        }
        embed.addFields(...fields);
        interaction.editReply({ embeds: [embed] });
    }
}