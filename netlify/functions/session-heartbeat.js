import { handleSessionHeartbeat } from '../lib/sessionHttp.js'

export const handler = async (event) => handleSessionHeartbeat(event)
