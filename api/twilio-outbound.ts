import { initialize } from '../backend'
import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function (req: VercelRequest, res: VercelResponse) {
  if (!req.body || !req.body.message || !req.body.users || typeof req.body.message !== 'string' || !Array.isArray(req.body.users)) {
    res.status(400).send('Invalid parameters')
    return;
  }

  try {
    console.log(`Messaging ${req.body.users.length} users...`)
    const { twilio } = await initialize({ twilio: true });
    
    let successfulMessages = 0
    for (const user of req.body.users) {
      if (!user || typeof user !== 'object' || !user.phone || typeof user.phone !== 'string') {
        console.log('Skipping invalid user', user)
        continue;
      }

      try {
        await twilio.sendMessage(req.body.message, user)
        successfulMessages++
      } catch (twilioError) {
        console.log('Twilio Error', twilioError)
      }
    }

    console.log(`${successfulMessages} messages sent successfully`)
  } catch (error) {
    console.log('Unknown Error', error)
  }

  res.status(200)
}
