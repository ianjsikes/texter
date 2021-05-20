import { initialize } from '../../../backend'
import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function (req: VercelRequest, res: VercelResponse) {
  const { db, twilio } = await initialize({ db: true, twilio: true });
  const campaign = await db.campaign.get(req.query.id);
  await twilio.sendMessage(campaign.message, req.body);
  res.status(200);
}
