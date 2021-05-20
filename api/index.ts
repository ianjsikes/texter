import { initialize } from '../backend'
import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function (req: VercelRequest, res: VercelResponse) {
  const { firebase } = await initialize({ firebase: true });
  res.send(await firebase.getAllData());
}
