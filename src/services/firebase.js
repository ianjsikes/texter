import { FirebaseApp } from 'firebase-rxjs'

export const setupFirebase = () => {
  const app = new FirebaseApp({
    options: JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG),
  })
  return app.database()
}
