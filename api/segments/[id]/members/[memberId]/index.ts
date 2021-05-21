import { initialize } from '../../../../../backend'
import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function (req: VercelRequest, res: VercelResponse) {
  const { db } = await initialize({ db: true })

  try {
    if (req.method === 'GET') {
      res.send(await db.member.get(req.query.memberId))
    } else if (req.method === 'PATCH') {
      await db.member.update(req.query.memberId, req.body)
      res.status(200)
    } else if (req.method === 'DEL') {
      await db.member.delete(req.query.memberId)
      res.status(200)
    }
  } finally {
    db.close()
  }
}
