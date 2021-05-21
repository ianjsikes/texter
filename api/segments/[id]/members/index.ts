import { initialize } from '../../../../backend'
import { VercelRequest, VercelResponse } from '@vercel/node'
import { hasKeys } from '../../../../backend/util'

export default async function (req: VercelRequest, res: VercelResponse) {
  const { db } = await initialize({ db: true })

  try {
    if (req.method === 'GET') {
      res.send(await db.member.list(req.query.id))
    } else if (req.method === 'POST') {
      if (!hasKeys(['phone'], req.body)) {
        res.status(400).send('Invalid member object in request')
        return
      }
      res.send(await db.member.create(req.query.id, req.body))
    }
  } finally {
    db.close()
  }
}
