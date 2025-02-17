import type { FirebaseApp } from 'firebase/app'
import { getInstallations, getId } from 'firebase/installations'
import {
  getRemoteConfig,
  getAll,
  fetchAndActivate,
  type RemoteConfig,
} from 'firebase/remote-config'

export const useFirebase = () => {
  const { $firebase } = useNuxtApp()

  const getFirebaseId = async () =>
    $firebase ? await getId(getInstallations($firebase as FirebaseApp)) : ''
  const remoteConfig = async (): Promise<RemoteConfig> =>
    getRemoteConfig($firebase as FirebaseApp)

  const fetchRemoteConfig = async () => {
    if ($firebase) {
      try {
        const configInstance = await remoteConfig()
        configInstance.settings.minimumFetchIntervalMillis = 0
        await fetchAndActivate(configInstance)
        return getAll(configInstance)
      } catch (e) {
        return {}
      }
    } else {
      return null
    }
  }

  return { getFirebaseId, fetchRemoteConfig }
}
