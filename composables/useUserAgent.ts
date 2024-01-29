import pkg from '~/package.json'

export const useUserAgent = () => {
  const userAgent = `wxm-explorer; ${pkg.version}; ${window.navigator.userAgent}`

  return { userAgent }
}
