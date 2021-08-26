export default class User {
  constructor(
    name: string,
    email: string,
    image: string,
    emailVerified: boolean,
    admin: boolean
  ) {
    if (name) {
      this.name = name
    }

    if (email) {
      this.email = email
    }

    if (image) {
      this.image = image
    }

    if (emailVerified) {
      const currentDate = new Date()
      this.emailVerified = currentDate
    }
    if (admin) {
      this.admin = admin
    }
  }
  id: number
  name: string
  email: string
  image: string
  emailVerified: Date
  admin: boolean
}
export const UserSchema = {
  name: 'User',
  target: User,
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true
    },
    name: {
      type: 'varchar',
      nullable: true
    },
    email: {
      type: 'varchar',
      unique: true,
      nullable: true
    },
    emailVerified: {
      type: 'timestamp',
      nullable: true
    },
    image: {
      type: 'varchar',
      nullable: true
    },
    createdAt: {
      type: 'timestamp',
      createDate: true
    },
    updatedAt: {
      type: 'timestamp',
      updateDate: true
    },
    // our custom properties
    role: {
      type: 'text',
      nullable: true
    },
    termsAccepted: {
      type: 'boolean',
      nullable: true
    }
  }
}
