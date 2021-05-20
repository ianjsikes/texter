import Twilio from './twilio';
import FirebaseService from './firebase';
import Database from './db';

const initializeDbAsync = async (): Promise<Database> => new Promise(resolve => new Database(resolve));

interface ApiConfig {
  db?: boolean;
  twilio?: boolean;
  firebase?: boolean;
}

// Will conditionally make each module null or set depending on
// if the corresponding config boolean is true or false
type ApiContext<Config extends ApiConfig> = {
  db: Config extends { db: true } ? Database : null;
  twilio: Config extends { twilio: true } ? Twilio : null;
  firebase: Config extends { firebase: true } ? FirebaseService : null;
}

export const initialize = async <C extends ApiConfig>(config: C): Promise<ApiContext<C>> => {
  const db = await (config.db ? initializeDbAsync() : null);
  const twilio = config.twilio ? new Twilio() : null;
  const firebase = config.firebase ? new FirebaseService() : null;

  return { db, twilio, firebase } as any;
}
