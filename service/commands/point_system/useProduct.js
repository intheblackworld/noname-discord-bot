const { User } = require("../../schema/user");
const { error, success } = require("../../utils/msgTemplate")
const { Product } = require("../../schema/product")
const { addOrUpdateUser } = require("../../utils/addOrUpdateUser")
const ObjectId = require('mongoose').Types.ObjectId

module.exports = {
  name: "use",
  description: "使用商品",
  options: [
    {
      type: 3,
      name: "item",
      description: "輸入自己背包中的商品id",
      required: true,
    },
  ],
  run: async (client, interaction, args) => {
    try {
      await addOrUpdateUser(interaction)

      if (!ObjectId.isValid(args['item'])) {
        return error({
          msg: `商品id錯誤`,
          interaction,
        })
      }

      const product = await Product.findOne({
        _id: args['item'],
        userId: interaction.user.id,
        isOnShop: false,
        isOnMarket: [false, null],
      })
      
      // 判斷是否持有此商品

      if (!product) {
        return error({
          msg: `你沒有持有此商品或此商品目前上架無法使用`,
          interaction,
        })
      }

      // 判断是否已经有这个身分组
      const role = interaction.member.guild.roles.cache.find(role => role.id === product.roleId)
      if (interaction.member.roles.cache.find(role => role.id == product.roleId)) {
        return success({
          msg: `您已經使用過此商品：${product.name}，不需重複使用`,
          interaction,
        })
      } else {
        // 使用，獲取身分組
        interaction.member.roles.add(role)  
      }

      // 移除商品
      await product.remove()

      return success({
        msg: `成功使用商品，獲得身分組:${product.name}`,
        interaction,
      })


    } catch (error) {
      console.log(error)
    }
  },
}
