import { initialize } from '../../../../../backend'
import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function (req: VercelRequest, res: VercelResponse) {
  const { db, twilio, firebase } = await initialize({
    db: true,
    twilio: true,
    firebase: true,
  })

  try {
    const { message, mediaUrl } = req.body
    const member = await db.member.get(req.query.memberId)
    const { sid } = await twilio.sendMessage(message, member)
    await firebase.sendMessage(message, member, sid, mediaUrl)

    const segment = await db.segment.get(member.segmentId)
    await db.segment.update(member.segmentId, {
      messagesTotal: (segment.messagesTotal || 0) + 1,
    })

    res.status(200)
  } finally {
    db.close()
  }
}
