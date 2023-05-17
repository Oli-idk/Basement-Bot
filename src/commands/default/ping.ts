import { Command } from '~/types/Objects';

export const ping: Command = {
	description: "Pong!",

	execute: function (interaction, args, client) {
		interaction.editReply({content: "Pong!"})
	}
}