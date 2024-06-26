const { User } = require("../../schema/user")
const { ServerPoint } = require("../../schema/serverPoint")
const { OfficialShop } = require("../../schema/officialShop")
const { OfficialProduct } = require("../../schema/officialProduct")
const { Product } = require("../../schema/product")

const { error, shopMsg } = require("../../utils/msgTemplate")
const { addOrUpdateUser } = require("../../utils/addOrUpdateUser")
const _ = require('lodash')
const pageSize = 5

module.exports = {
  name: "check_shop",
  description: "呼叫未來商城 or 指定 某 user 的商店",
  options: [
    {
      type: 6,
      name: "user",
      description: "選擇使用者",
    },
  ],
  run: async (client, interaction, args) => {
    await addOrUpdateUser(interaction)

    // 判斷是否有傳 user 值
    if (!args['user']) {
      // 沒有則搜尋未來商城並回傳資料
      // 判斷目前是否有未來商城
      const officialShop = await OfficialShop.findOne({
        serverId: interaction.guildId
      })
      if (!officialShop) {
        return error({
          msg: `本伺服器目前尚無商店`,
          interaction,
        })
      } else {
        const list = await OfficialProduct.find({
          serverId: interaction.guildId,
        })
        if (!list || !list.length) {
          return error({
            msg: `目前未來商城尚無商品`,
            interaction,
          })
        }
        const message_products = list.map((item, i) => ({
          name: item.name,
          price: item.price,
          description: '',
          amount: item.amount,
          id: item.roleId
        }))

        const point = await ServerPoint.findOne({
          serverId: interaction.guildId,
          userDiscordId: interaction.user.id,
        })


        return shopMsg({
          is_official: 0, // 0 官方, 1 使用者, 2 拍賣所
          user_name: interaction.user.username,
          productChunk: [
            ..._.chunk(message_products, pageSize)
          ],
          interaction,
          point,
        })
      }

    }

    // 有則尋找該 user
    const user = await User.findOne({
      serverIds: interaction.guildId,
      discordId: args['user'],
    })

    if (!user) {
      return error({
        msg: `查不到此人資料`,
        interaction,
      })
    }

    // 如果有 user 判斷該 user 有無商品販售
    const products = await Product.find({
      serverId: interaction.guildId,
      userId: user.discordId,
      isOnShop: true,
      isOnMarket: [false, null],
    })

    if (!products || products.length == 0) {
      return error({
        msg: `目前對方無商品販售`,
        interaction,
      })
    } else {
      const message_products = products.map((item, i) => ({
        name: item.name,
        price: item.price,
        description: '',
        amount: 1,
        id: item._id
      }))

      const point = await ServerPoint.findOne({
        serverId: interaction.guildId,
        userDiscordId: interaction.user.id,
      })

      return shopMsg({
        is_official: 1, // 0 官方, 1 使用者, 2 拍賣所
        user_name: user.discordName,
        hint: `你可以使用 /buy [商品 id] 來購買商品\n\n`,
        productChunk: [
          ..._.chunk(message_products, pageSize)
        ],
        interaction,
        point,
      })

    }
  },
}
