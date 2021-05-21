// @ts-check
import Mongo from 'mongodb'
import phoneFormatter from 'phone-formatter'

export const COLS = {
  campaigns: 'campaigns',
  segments: 'segments',
  members: 'members',
}

export const ID = (i) => new Mongo.ObjectID(i)

export default class Database {
  db: Mongo.Db
  campaign: Campaign
  member: Member
  segment: Segment

  constructor(callback) {
    const client = new Mongo.MongoClient(process.env.DATABASE_URL, {
      useUnifiedTopology: true,
    })
    client.connect(async (err, client) => {
      if (err) {
        return console.log(err)
      }

      this.db = client.db('texter-db')

      this.campaign = new Campaign(this.db)
      this.member = new Member(this.db)
      this.segment = new Segment(this.db, this.member)

      await this.db.collection('members').createIndex({ segmentId: 1 })

      callback(this)
    })
  }
}

class Campaign {
  db: Mongo.Db
  collection: Mongo.Collection<any>

  constructor(db) {
    this.db = db
    this.collection = this.db.collection(COLS.campaigns)
  }

  async list() {
    return this.collection.find().toArray()
  }

  async get(id) {
    return this.collection.findOne({ _id: ID(id) })
  }

  async create(data) {
    const { insertedId } = await this.collection.insertOne({
      ...data,
      segmentId: ID(data.segmentId),
    })

    return {
      ...data,
      _id: ID(insertedId),
    }
  }

  async update(id, data) {
    return this.collection.updateOne({ _id: ID(id) }, { $set: data })
  }

  async launch(id) {
    return this.collection.updateOne({ _id: ID(id) }, { $set: { sent: true } })
  }

  async delete(id) {
    return this.collection.deleteOne({ _id: ID(id) })
  }
}

/**
 * SEGMENTS
 */

class Segment {
  db: Mongo.Db
  member: Member
  collection: Mongo.Collection<any>

  constructor(db, member) {
    this.db = db
    this.member = member
    this.collection = this.db.collection(COLS.segments)
  }

  async list() {
    return this.collection.find().toArray()
  }

  async get(id) {
    const metadata = await this.collection.findOne({ _id: ID(id) })
    const members = await this.member.list(id)
    return { ...metadata, members }
  }

  async create(data) {
    const { insertedId } = await this.collection.insertOne({
      name: data.name,
      numMembers: data.members ? data.members.length : 0,
      unread: 0,
    })

    if (data.members && data.members.length > 0) {
      await this.member.createMany(insertedId, data.members)
    }

    return {
      ...data,
      _id: ID(insertedId),
    }
  }

  async update(id, data) {
    return this.collection.updateOne({ _id: ID(id) }, { $set: data })
  }

  async newUnread(id) {
    const { unread } = await this.collection.findOne({ _id: ID(id) })
    return this.collection.updateOne(
      { _id: ID(id) },
      { $set: { unread: unread + 1 } },
    )
  }

  async clearUnreads(id) {
    return this.collection.updateOne({ _id: ID(id) }, { $set: { unread: 0 } })
  }

  async delete(id) {
    await this.collection.deleteOne({ _id: ID(id) })
    await this.db.collection(COLS.campaigns).deleteMany({ segmentId: ID(id) })
    await this.member.deleteMany(id)
    return
  }

  async messageDelivered(id, increment = 1) {
    const { messagesDelivered } = await this.collection.findOne({ _id: ID(id) })
    return this.collection.updateOne(
      { _id: ID(id) },
      { $set: { messagesDelivered: (messagesDelivered || 0) + increment } },
    )
  }

  async messageFailed(id, increment = 1) {
    const { messagesFailed } = await this.collection.findOne({ _id: ID(id) })
    return this.collection.updateOne(
      { _id: ID(id) },
      { $set: { messagesFailed: (messagesFailed || 0) + increment } },
    )
  }

  async messageQueued(id, increment = 1) {
    const { messagesQueued } = await this.collection.findOne({ _id: ID(id) })
    return this.collection.updateOne(
      { _id: ID(id) },
      { $set: { messagesQueued: (messagesQueued || 0) + increment } },
    )
  }

  async messageSent(id, increment = 1) {
    const { messagesSent } = await this.collection.findOne({ _id: ID(id) })
    return this.collection.updateOne(
      { _id: ID(id) },
      { $set: { messagesSent: (messagesSent || 0) + increment } },
    )
  }

  async messageUnknown(id, increment = 1) {
    const { messagesUnknown } = await this.collection.findOne({ _id: ID(id) })
    return this.collection.updateOne(
      { _id: ID(id) },
      { $set: { messagesUnknown: (messagesUnknown || 0) + increment } },
    )
  }
}

/**
 * MEMBERS
 */

class Member {
  db: Mongo.Db
  collection: Mongo.Collection<any>

  constructor(db) {
    this.db = db
    this.collection = this.db.collection(COLS.members)
  }

  async listAll() {
    return this.collection.find().toArray()
  }

  async list(segmentId) {
    return this.collection.find({ segmentId: ID(segmentId) }).toArray()
  }

  async get(id) {
    return this.collection.findOne({ _id: ID(id) })
  }

  async getByPhone(phone) {
    const allMembers = await this.collection
      .find({ phone: phoneFormatter.normalize(phone) })
      .toArray()
    let latestMember = allMembers[0]
    let latestTime = 0
    for (const member of allMembers) {
      const segment = await this.db
        .collection(COLS.segments)
        .findOne({ _id: ID(member.segmentId) })
      if (segment && segment.lastCampaignTime > latestTime) {
        latestTime = segment.lastCampaignTime
        latestMember = member
      }
    }
    return latestMember
  }

  async create(segmentId, data) {
    data.phone = phoneFormatter.normalize(data.phone)
    const { insertedId } = await this.collection.insertOne({
      ...data,
      segmentId: ID(segmentId),
    })
    const { numMembers } = await this.db
      .collection(COLS.segments)
      .findOne({ _id: ID(segmentId) })
    await this.db
      .collection(COLS.segments)
      .updateOne(
        { _id: ID(segmentId) },
        { $set: { numMembers: numMembers + 1 } },
      )
    return {
      ...data,
      _id: ID(insertedId),
    }
  }

  async createMany(segmentId, members) {
    const taggedMembers = members.map((member) => ({
      ...member,
      phone: phoneFormatter.normalize(member.phone),
      segmentId: ID(segmentId),
    }))

    return this.collection.insertMany(taggedMembers)
  }

  async update(id, data) {
    if (data.phone) {
      data.phone = phoneFormatter.normalize(data.phone)
    }
    return this.collection.updateOne({ _id: ID(id) }, { $set: data })
  }

  async delete(id) {
    const member = await this.collection.findOne({ _id: ID(id) })

    const { numMembers } = await this.db
      .collection(COLS.segments)
      .findOne({ _id: ID(member.segmentId) })
    await this.db
      .collection(COLS.segments)
      .updateOne(
        { _id: ID(member.segmentId) },
        { $set: { numMembers: numMembers - 1 } },
      )

    return this.collection.deleteOne({ _id: ID(id) })
  }

  async deleteMany(segmentId) {
    return this.collection.deleteMany({ segmentId: ID(segmentId) })
  }

  async invalidUser(id) {
    return this.collection.updateOne(
      { _id: ID(id) },
      { $set: { invalid: true } },
    )
  }
}
