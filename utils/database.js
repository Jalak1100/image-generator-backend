// In-memory database for demo purposes
// Replace with MongoDB or any other database in production

let users = []
let images = []
let userIdCounter = 1
let imageIdCounter = 1

export const db = {
  users: {
    findByEmail: (email) => users.find(u => u.email === email),
    findById: (id) => users.find(u => u.id === id),
    create: (email, passwordHash) => {
      const user = {
        id: userIdCounter++,
        email,
        passwordHash,
        createdAt: new Date(),
      }
      users.push(user)
      return user
    },
  },
  images: {
    create: (userId, prompt, style, url) => {
      const image = {
        id: imageIdCounter++,
        userId,
        prompt,
        style,
        url,
        createdAt: new Date(),
      }
      images.push(image)
      return image
    },
    findByUserId: (userId) => {
      return images
        .filter(img => img.userId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    },
    findById: (id) => images.find(img => img.id === id),
    delete: (id) => {
      images = images.filter(img => img.id !== id)
    },
  },
}
