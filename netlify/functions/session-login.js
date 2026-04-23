import { handleSessionLogin } from '../lib/sessionHttp.js'

export const handler = async (event) => handleSessionLogin(event)
