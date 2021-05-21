import { initialize } from '../backend'
import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function (req: VercelRequest, res: VercelResponse) {
  const { firebase, db } = await initialize({ firebase: true, db: true })

  try {
    const member = await db.member.getByPhone(req.body.From)
    if (member) {
      await firebase.addIncomingMessage(req.body, member)
      await db.segment.newUnread(member.segmentId)
    }
    res.status(200)
  } finally {
    db.close()
  }
}
