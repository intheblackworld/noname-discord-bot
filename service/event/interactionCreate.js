const { transferPoint } = require('../utils/transferPoint.js')
const { setGroup } = require('../utils/setGroup.js')
module.exports = {
  name: "interactionCreate",
  run: async (client, interaction) => {
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName)
      if (!command) {
        return interaction
          .reply({ content: "An error has occurred ", ephemeral: true })
          .catch((error) => client.utils.log.handler("error", error))
      }
      const args = {}
      for (const option of interaction.options.data) {
        if (option.type === "SUB_COMMAND") {
          if (option.name) args[option.name] = true
          option.options?.forEach((x) => {
            args[x.name] = x.value
          })
        } else if (option.value) {
          args[option.name] = option.value
        }
      }
      interaction.member = interaction.guild.members.cache.get(
        interaction.user.id
      )
      try {
        command.run(client, interaction, args)
      } catch (error) {
        client.utils.log.error(error)
        interaction
          .reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
          })
          .catch((err) => client.utils.log.handler("error", err))
      }
    }
    // if (interaction.isSelectMenu()) {
    //   if (interaction.customId == 'select_product') {
    //     console.log(interaction.values, 'interaction.values') 
    //   }
    //   // const command = client.commands.get(interaction.values[0].split("=")[0]);
    //   // if (command) command.run(client, interaction);
    // }
    if (interaction.isButton()) {
      if (interaction.customId.includes('transPoint')) {
        transferPoint(interaction)
      }

      if (interaction.customId == 'goblins' || interaction.customId == 'orcs') {
        setGroup(client, interaction)
      }
    }
  },
}
