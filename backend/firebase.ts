import Firebase from 'firebase'
import format from 'string-template'

const config = JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG)
export default class FirebaseService {
  db: Firebase.database.Database

  constructor() {
    // Avoid re-initializing Firebase multiple times
    const fb = !Firebase.apps.length
      ? Firebase.initializeApp(config)
      : Firebase.app()
    this.db = fb.database()
  }

  async getAllData() {
    return new Promise((resolve, reject) => {
      this.db.ref('messages').once('value', (snapshot) => {
        resolve(snapshot.val())
      })
    })
  }

  async addIncomingMessage(message, member) {
    if (!message || !message.From || !message.To || !message.Body) {
      return
    }
    await this.db
      .ref(
        `segments/${member.segmentId}/messages/${member._id}/${message.MessageSid}`,
      )
      .set({
        from: message.From,
        to: message.To,
        body: message.Body,
        timestamp: Date.now(),
      })
  }

  async sendMessage(message, recipient, sid, mediaUrl) {
    let msgObj: Record<string, any> = {
      to: recipient.phone,
      body: format(message, recipient),
      from: 'texter',
      timestamp: Date.now(),
    }

    if (
      !!mediaUrl &&
      typeof mediaUrl === 'string' &&
      mediaUrl.indexOf('http') != -1
    ) {
      msgObj.mediaUrl = mediaUrl.trim()
    }

    await this.db
      .ref(`segments/${recipient.segmentId}/messages/${recipient._id}/${sid}`)
      .set(msgObj)
  }

  async setMessageStatus(phone, sid, status, member) {
    await this.db
      .ref(`segments/${member.segmentId}/messages/${member._id}/${sid}`)
      .update({ status })
  }
}
