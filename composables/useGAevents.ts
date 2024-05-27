import _ from 'lodash'
import { event } from 'vue-gtag'
import localStorage from '~/cache/localStorage'

export const useGAevents = () => {
  const events = [
    {
      eventKey: 'click_on_read_more_button_cell_capacity',
      eventName: 'SELECT_CONTENT',
      parameters: {
        CONTENT_TYPE: 'Web Documentation'
      }
    },
    {
      eventKey: 'cell_capacity_info',
      eventName: 'SELECT_CONTENT',
      parameters: {
        CONTENT_TYPE: 'Learn More',
        ITEM_ID: null
      }
    },
    {
      eventKey: 'device_rewards',
      eventName: 'SCREEN_VIEW',
      parameters: {
        SCREEN_NAME: 'Device Rewards'
      }
    },
    {
      eventKey: 'device_reward_transactions',
      eventName: 'SCREEN_VIEW',
      parameters: {
        SCREEN_NAME: 'Device Reward Transactions',
        ITEM_ID: null
      }
    },

    {
      eventKey: 'explorer_cell',
      eventName: 'SCREEN_VIEW',
      parameters: {
        SCREEN_NAME: 'Explorer Cell',
        ITEM_ID: null
      }
    },
    {
      eventKey: 'explorer_device',
      eventName: 'SCREEN_VIEW',
      parameters: {
        SCREEN_NAME: 'Explorer Device',
        ITEM_ID: null
      }
    },
    {
      eventKey: 'explorer_search',
      eventName: 'USER_ACTION',
      parameters: {
        ACTION_NAME: 'Explorer Search'
      }
    },
    {
      eventKey: 'explorer_settings',
      eventName: 'SELECT_CONTENT',
      parameters: {
        CONTENT_TYPE: 'Explorer Settings'
      }
    },
    {
      eventKey: 'clickOnOpenShop',
      eventName: 'SELECT_CONTENT',
      parameters: {
        CONTENT_TYPE: 'Open Shop'
      }
    },
    {
      eventKey: 'clickOnManufacturerContactUs',
      eventName: 'SELECT_CONTENT',
      parameters: {
        CONTENT_TYPE: 'Open Manufacturer Contact'
      }
    },
    {
      eventKey: 'clickOnOpenStationShop',
      eventName: 'SELECT_CONTENT',
      parameters: {
        CONTENT_TYPE: 'Open Station Shop',
        ITEM_ID: null,
        ITEM_LIST_ID: null
      }
    },
    {
      eventKey: 'clickInfoIcon',
      eventName: 'SELECT_CONTENT',
      parameters: {
        CONTENT_TYPE: 'Learn More',
        ITEM_ID: null
      }
    },
    {
      eventKey: 'clickOnResultOnNetworkSearch',
      eventName: 'SELECT_CONTENT',
      parameters: {
        CONTENT_TYPE: 'Network Search',
        ITEM_ID: null,
        ITEM_LIST_ID: null
      }
    },
    {
      eventKey: 'clickOnReadMoreForTokenomicsLink',
      eventName: 'SELECT_CONTENT',
      parameters: {
        CONTENT_TYPE: 'Tokenomics',
        SOURCE: 'network_tats'
      }
    },
    {
      eventKey: 'deviceForecastClickOnAppStoreLink',
      eventName: 'USER_ACTION',
      parameters: {
        ACTION_NAME: 'Download App Link',
        ITEM_ID: null
      }
    },
    {
      eventKey: 'deviceObservationsClickOnDownloadButton',
      eventName: 'USER_ACTION',
      parameters: {
        ACTION_NAME: 'Device Observations Download Button '
      }
    },
    {
      eventKey: 'click_on_reward_contract_link',
      eventName: 'SELECT_CONTENT',
      parameters: {
        CONTENT_TYPE: 'Network Stats',
        SOURCE: 'reward_contract'
      }
    },
    {
      eventKey: 'click_on_token_contract_link',
      eventName: 'SELECT_CONTENT',
      parameters: {
        CONTENT_TYPE: 'Network Stats',
        SOURCE: 'token_contract'
      }
    },
    {
      eventKey: 'click_on_reward_last_run',
      eventName: 'SELECT_CONTENT',
      parameters: {
        CONTENT_TYPE: 'Network Stats',
        SOURCE: 'last_run_hash'
      }
    }
  ]

  // get tracking flag
  const getTrackingValue = () => {
    return localStorage.get('tracking') ? localStorage.get('tracking') : false
  }

  const getGAevent = (eventKey: string, parameters = {}) => {
    if (getTrackingValue()) {
      const event = _.find(events, (event) => event.eventKey === eventKey) ?? null
      if (event) {
        Object.assign(event.parameters, parameters, event.parameters)
      }
      return event
    } else {
      return null
    }
  }

  const trackGAevent = (eventKey: string, parameters: any) => {
    const validEvent = getGAevent(eventKey, parameters)
    if (validEvent) {
      event(validEvent.eventName, validEvent.parameters)
    }
  }

  return { trackGAevent }
}
