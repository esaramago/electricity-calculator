/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const usersCol = app.findCollectionByNameOrId('users')

  // Create default app user if none exists
  try {
    const existing = app.findAuthRecordByEmail('users', 'admin@local.host')
    if (!existing) {
      const user = new Record(usersCol)
      user.setEmail('admin@local.host')
      user.setPassword('password123456')
      app.save(user)
    }
  } catch (e) {
    const user = new Record(usersCol)
    user.setEmail('admin@local.host')
    user.setPassword('password123456')
    app.save(user)
  }
})
