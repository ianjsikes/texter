import { initialize } from '../../../backend'
import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function (req: VercelRequest, res: VercelResponse) {
  const { db } = await initialize({ db: true });
  
  await db.segment.clearUnreads(req.query.id)
  res.status(200)
}
