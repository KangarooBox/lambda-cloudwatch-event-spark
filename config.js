module.exports = {

  // spark webhook access token
  accessToken: process.env.accessToken,
  // unencrypted spark webhook url
  webhookUrl: process.env.webhookUrl,
  // spark room to send a message to: "#general"
  roomId: process.env.roomId,
  // spark person to send a message to: "xxxxxxxx-xxx-xxxx-xxxxxxx"
  toPersonId: process.env.toPersonId,
  // spark person to send a message to: "#general"
  toPersonEmail: process.env.toPersonEmail

}
