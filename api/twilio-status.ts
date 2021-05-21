import { initialize } from '../backend'
import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function (req: VercelRequest, res: VercelResponse) {
  const message = req.body
  console.log('Received message status', JSON.stringify(message))
  if (!message || !message.MessageStatus || !message.To) {
    res
      .status(400)
      .send(
        'Invalid message object received: ' + JSON.stringify(message, null, 2),
      )
    return
  }

  console.log('Initializing...')
  const { db } = await initialize({ db: true })
  const member = await db.member.getByPhone(message.To)
  if (!member) {
    console.error('Unable to find member associated with message: ' + message)
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.status(200)
    return
  }

  console.log('Handling status...')
  switch (message.MessageStatus) {
    case 'delivered':
      await db.segment.messageDelivered(member.segmentId)
      break
    case 'undelivered':
      await db.segment.messageFailed(member.segmentId)
      await db.member.invalidUser(member._id)
      break
    case 'failed':
      await db.segment.messageFailed(member.segmentId)
      await db.member.invalidUser(member._id)
      break
    case 'queued':
      await db.segment.messageQueued(member.segmentId)
      await db.segment.messageUnknown(member.segmentId, -1)
      break
    case 'sent':
      await db.segment.messageSent(member.segmentId)
      await db.segment.messageQueued(member.segmentId, -1)
      break
    default:
      console.warn('Unknown message status:', JSON.stringify(message, null, 2))
      break
  }
  console.log('All done')

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.status(200)
}
