const { User } = require("../schema/user");
const { updateServerPoints } = require("../crud/updateServerPoints");
const { updatePointAdjustLog } = require("../crud/updatePointAdjustLog");
const { eventType, eventPoint, typeToPoint } = require("../config");
const { error, success } = require("../utils/msgTemplate");

module.exports = {
  name: "add_wallet",
  description: "Add wallet address",
  options: [
    {
      type: 3,
      name: "wallet_address",
      description: "Register your address for claiming whitelist",
      required: true,
    },
  ],

  run: async (client, interaction, args) => {
    const user = await User.findOne({
      serverIds: interaction.guildId,
      discordId: interaction.user.id,
    });

    if (!user) {
      return error({
        msg: `You have to register before adding a wallet`,
        interaction,
      });
    }

    if (!user.walletAddress[interaction.guildId])
      user.walletAddress[interaction.guildId] = [];

    if (
      user.walletAddress[interaction.guildId].includes(args["wallet_address"])
    ) {
      return error({
        msg: `Address :${args["wallet_address"]} already exists`,
        interaction,
      });
    } else {
      try {
        const s = `walletAddress.${interaction.guildId}`;
        const user = await User.updateOne(
          {
            serverIds: interaction.guildId,
            discordId: interaction.user.id,
          },
          { $push: { [s]: args["wallet_address"] } }
        );
      } catch (error) {
        console.log(error);
      }

      await updateServerPoints({
        serverId: interaction.guildId,
        userDiscordId: interaction.user.id,
        point: typeToPoint[eventType.add_wallet],
      });

      await updatePointAdjustLog({
        amount: typeToPoint[eventType.add_wallet],
        serverId: interaction.guildId,
        userDiscordId: interaction.user.id,
        eventType: eventType.add_wallet,
      });

      success({
        msg: `Address :${args["wallet_address"]} added successfully. You recieved : ${typeToPoint.add_wallet} points`,
        interaction,
      });
    }
  },
};
