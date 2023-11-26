export const HOST = 'http://localhost:5000'

const AUTH_ROUTE = `${HOST}/api/auth`
const GESSAGES_ROUTE = `${HOST}/api/messages`

export const CHECK_USER_ROUT = `${AUTH_ROUTE}/check-user`
export const ONBOARD_USER_ROUT = `${AUTH_ROUTE}/onboard-user`
export const GET_ALL_CONTACTS = `${AUTH_ROUTE}/get-contacts`
export const GET_CALL_TOKEN = `${AUTH_ROUTE}/generate-token`

// message 
export const ADD_MESSAGE_ROUTE = `${GESSAGES_ROUTE}/add-message`
export const GET_MESSAGES_ROUTE = `${GESSAGES_ROUTE}/get-messages`
export const ADD_IMAGE_MESSAGES_ROUTE = `${GESSAGES_ROUTE}/add-image-message`
export const ADD_AUDIO_MESSAGES_ROUTE = `${GESSAGES_ROUTE}/add-audio-message`
export const GET_INITIAL_CONTACTS_ROUTE = `${GESSAGES_ROUTE}/get-initial-contacts`