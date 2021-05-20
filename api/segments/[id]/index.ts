import { initialize } from '../../../backend'
import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function (req: VercelRequest, res: VercelResponse) {
  const { db } = await initialize({ db: true });
  
  if (req.method === 'GET') {
    res.send(await db.segment.get(req.query.id))
  } else if (req.method === 'PATCH') {
    await db.segment.update(req.query.id, req.body)
    res.status(200)
  } else if (req.method === 'DEL') {
    await db.segment.delete(req.query.id)
    res.status(200)
  }
}
