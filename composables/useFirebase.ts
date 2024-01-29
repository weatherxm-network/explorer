import { getInstallations, getId } from 'firebase/installations'
import { getRemoteConfig, getAll, fetchAndActivate } from 'firebase/remote-config'

export const useFirebase = () => {
  const { $firebase } = useNuxtApp()

  const getFirebaseId = async () => ($firebase ? await getId(getInstallations($firebase)) : '')
  const remoteConfig = async () => ($firebase ? await getRemoteConfig($firebase) : {})

  const fetchRemoteConfig = async () => {
    if ($firebase) {
      try {
        const configInstance = await remoteConfig()
        configInstance.settings.minimumFetchIntervalMillis = 0
        await fetchAndActivate(configInstance)
        return await getAll(configInstance)
      } catch (e) {
        return {}
      }
    } else {
      return null
    }
  }
  return { getFirebaseId, fetchRemoteConfig }
}
