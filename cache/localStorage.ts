// Get JSON Object from local storage.
const get = (key: string) => {
  const value = window.localStorage.getItem(key)
  if (value) {
    try {
      return JSON.parse(value)
    } catch (e) {
      // TODO Log first? Then let it return null.
    }
  }
  return null
}

// Save JSON Object in local storage.
const set = (key: string, value: any) => {
  window.localStorage.setItem(key, JSON.stringify(value))
}

const remove = (key: string) => {
  window.localStorage.removeItem(key)
}

export default { get, set, remove }
