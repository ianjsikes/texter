import twilio from 'twilio'
import format from 'string-template'
import phoneFormatter from 'phone-formatter'
import json2csv from 'json2csv'
import { MessageInstance, MessageListInstanceCreateOptions } from 'twilio/lib/rest/api/v2010/account/message'

export default class Twilio {
  client: twilio.Twilio;

  constructor() {
    this.client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)
  }

  async sendMessage(message, recipient, mediaUrl?: string | string[]) {
    const body = format(message, recipient)

    let msgObj: MessageListInstanceCreateOptions = {
      to: phoneFormatter.format(recipient.phone, '+1NNNNNNNNNN'),
      messagingServiceSid: process.env.TWILIO_SERVICE_SID,
      statusCallback: process.env.TWILIO_STATUS_URL,
      body,
    }

    if (!!mediaUrl && typeof mediaUrl === 'string' && mediaUrl.indexOf('http') != -1) {
      msgObj.mediaUrl = mediaUrl.trim()
    }

    return this.client.messages.create(msgObj)
  }

  async getLogs(daysAgo = 7) {
    const parser = new json2csv.Parser({
      fields: [
        {
          value: (row, field) =>
            row.from
              .split('+1')
              .splice(-1, 1)
              .join(''),
          stringify: false,
          label: 'From',
        },
        {
          value: (row, field) =>
            row.to
              .split('+1')
              .splice(-1, 1)
              .join(''),
          stringify: false,
          label: 'To',
        },
        { value: 'body', label: 'Body' },
        { value: 'status', label: 'Status' },
        { value: 'dateSent', label: 'SentDate' },
        { value: 'apiVersion', label: 'ApiVersion' },
        { value: 'numSegments', label: 'NumSegments' },
        { value: 'errorCode', label: 'ErrorCode', default: 0 },
        { value: 'accountSid', label: 'AccountSid' },
        { value: 'sid', label: 'Sid' },
        { value: 'direction', label: 'Direction' },
        { value: 'price', label: 'Price' },
        { value: 'priceUnit', label: 'PriceUnit' },
      ],
    })
    const d = new Date()
    d.setTime(d.getTime() - 86400000 * daysAgo)
    // d.setHours(0, 0, 0, 0)
    const dayBefore = `${d
      .toISOString()
      .split('.')
      .splice(0, 1)
      .join('')}+00:00`

    const l: MessageInstance[] = await new Promise((resolve, reject) => {
      this.client.messages.list({ dateSentAfter: new Date(dayBefore) }, (err, items) => {
        if (err) reject(err);
        resolve(items)
      })
    });

    const csv = parser.parse(l)
    return csv
  }

  async getIncomingLogs(daysAgo = 7) {
    const parser = new json2csv.Parser({
      fields: [
        {
          value: (row, field) =>
            row.from
              .split('+1')
              .splice(-1, 1)
              .join(''),
          stringify: false,
          label: 'From',
        },
        {
          value: (row, field) =>
            row.to
              .split('+1')
              .splice(-1, 1)
              .join(''),
          stringify: false,
          label: 'To',
        },
        { value: 'body', label: 'Body' },
        { value: 'status', label: 'Status' },
        { value: 'dateSent', label: 'SentDate' },
        { value: 'apiVersion', label: 'ApiVersion' },
        { value: 'numSegments', label: 'NumSegments' },
        { value: 'errorCode', label: 'ErrorCode', default: 0 },
        { value: 'accountSid', label: 'AccountSid' },
        { value: 'sid', label: 'Sid' },
        { value: 'direction', label: 'Direction' },
        { value: 'price', label: 'Price' },
        { value: 'priceUnit', label: 'PriceUnit' },
      ],
    })
    const d = new Date()
    d.setTime(d.getTime() - 86400000 * daysAgo)
    const dayBefore = `${d
      .toISOString()
      .split('.')
      .splice(0, 1)
      .join('')}+00:00`

    const phoneNumbers = await this.client.incomingPhoneNumbers.list()
    const result: MessageInstance[][] = await Promise.all(
      phoneNumbers.map((p) => {
        return new Promise((resolve, reject) => {
          this.client.messages.list({ dateSentAfter: new Date(dayBefore), to: p.phoneNumber }, (err, items) => {
            if (err) reject(err);
            resolve(items)
          })
        });
      })
    ) as any

    const sorted = result.reduce((acc, val) => acc.concat(val), []).sort((a, b) => {
      return a.dateCreated.getTime() - b.dateCreated.getTime()
    })

    const csv = parser.parse(sorted)
    return csv
  }
}
