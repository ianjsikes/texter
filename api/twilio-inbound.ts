import { initialize } from '../backend'
import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function (req: VercelRequest, res: VercelResponse) {
  const { db, firebase } = await initialize({ db: true, firebase: true });

  const member = await db.member.getByPhone(req.body.From)
  if (member) {
    await firebase.addIncomingMessage(req.body, member)
    await db.segment.newUnread(member.segmentId)
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.status(200)
}
