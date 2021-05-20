import { initialize } from '../../backend'
import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function (req: VercelRequest, res: VercelResponse) {
  const { twilio } = await initialize({ twilio: true });
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment;filename=lastweek-incoming.csv')
  res.send(await twilio.getIncomingLogs());
}
