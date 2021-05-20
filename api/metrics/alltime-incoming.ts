import { initialize } from '../../backend'
import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function (req: VercelRequest, res: VercelResponse) {
  const { twilio } = await initialize({ twilio: true });
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment;filename=alltime-incoming.csv')
  const fullDaysSinceEpoch = Math.floor(Date.now() / 86400000)
  const projectStartDays = 18766 // 19-05-2021
  res.send(await twilio.getIncomingLogs(fullDaysSinceEpoch - projectStartDays))
}
