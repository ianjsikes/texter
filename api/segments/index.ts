import { initialize } from '../../backend'
import { VercelRequest, VercelResponse } from '@vercel/node'
import { hasKeys } from '../../backend/util';

export default async function (req: VercelRequest, res: VercelResponse) {
  const { db } = await initialize({ db: true });
  
  if (req.method === 'GET') {
    res.send(await db.segment.list())
  } else if (req.method === 'POST') {
    if (!hasKeys(['name'], req.body)) {
      res.status(400).send('Invalid segment object in request')
      return;
    }
    res.send(await db.segment.create(req.body))
  }
}
