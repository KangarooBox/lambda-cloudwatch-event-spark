module.exports = {

  // spark webhook access token
  accessToken: process.env.ACCESS_TOKEN,
  // unencrypted spark webhook url
  webhookUrl: process.env.WEBHOOK_URL,
  // spark room to send a message to: "#general"
  roomId: process.env.ROOM_ID,
  // spark person to send a message to: "xxxxxxxx-xxx-xxxx-xxxxxxx"
  toPersonId: process.env.TO_PERSON_ID,
  // spark person to send a message to: "#general"
  toPersonEmail: process.env.TO_PERSON_EMAIL

}
