import { initialize } from '../../../backend'
import axios from 'axios'
import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function (req: VercelRequest, res: VercelResponse) {
  const { db } = await initialize({ db: true })

  try {
    const campaign = await db.campaign.get(req.query.id)
    if (campaign.sent) {
      res.status(402)
      return
    }
    await db.campaign.launch(req.query.id)
    const segment = await db.segment.get(campaign.segmentId)
    await db.segment.update(campaign.segmentId, {
      lastCampaignSent: campaign._id,
      lastCampaignTime: Date.now(),
      messagesDelivered: 0,
      messagesFailed: 0,
      messagesSent: 0,
      messagesQueued: 0,
      messagesUnknown: 0,
      messagesTotal: segment.members.length || 0,
    })

    try {
      let data: Record<string, any> = {
        message: campaign.message,
        users: segment.members,
      }
      if (
        !!campaign.mediaUrl &&
        typeof campaign.mediaUrl === 'string' &&
        campaign.mediaUrl.indexOf('http') != -1
      ) {
        data.mediaUrl = campaign.mediaUrl.trim()
      }

      await axios({
        method: 'post',
        url: process.env.TWILIO_OUTBOUND_URL,
        data,
      })
    } catch (error) {
      console.warn(error)
    } finally {
      res.status(200)
    }
  } finally {
    db.close()
  }
}
