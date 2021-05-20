import { initialize } from '../backend'
import { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Handles twilio message status webhooks and updates the
 * corresponding message on Firebase
 */
export default async function (req: VercelRequest, res: VercelResponse) {
  const { db } = await initialize({ db: true });
  const message = req.body
  switch (message.MessageStatus) {
    case 'delivered':
      {
        const member = await db.member.getByPhone(message.To)
        if (member) {
          const segment = await db.segment.get(member.segmentId)
          await db.segment.update(member.segmentId, {
            messagesDelivered: (segment.messagesDelivered || 0) + 1,
          })
        }
      }
      break
    case 'undelivered':
    case 'failed':
      {
        const member = await db.member.getByPhone(message.To)
        if (member) {
          const segment = await db.segment.get(member.segmentId)
          await db.segment.update(member.segmentId, {
            messagesFailed: (segment.messagesFailed || 0) + 1,
          })
          await db.member.update(member._id, { invalid: true })
        }
      }
      break
    default:
      break
  }
  res.status(200)
}
