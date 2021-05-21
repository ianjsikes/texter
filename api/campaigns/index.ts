import { initialize } from '../../backend'
import { VercelRequest, VercelResponse } from '@vercel/node'
import { hasKeys } from '../../backend/util'

export default async function (req: VercelRequest, res: VercelResponse) {
  const { db } = await initialize({ db: true })

  try {
    if (req.method === 'GET') {
      res.send(await db.campaign.list())
    } else if (req.method === 'POST') {
      if (!hasKeys(['title', 'segmentId', 'message', 'sent'], req.body)) {
        res.status(400).send('Invalid campaign object in request')
        return
      }

      res.send(await db.campaign.create(req.body))
    }
  } finally {
    db.close()
  }
}
