import { handleSessionLogout } from '../lib/sessionHttp.js'

export const handler = async (event) => handleSessionLogout(event)
