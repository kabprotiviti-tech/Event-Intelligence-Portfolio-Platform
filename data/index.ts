export { abuDhabiEvents } from './mock-events-abudhabi'
export { dubaiEvents } from './mock-events-dubai'
export { gccEvents } from './mock-events-gcc'

import { abuDhabiEvents } from './mock-events-abudhabi'
import { dubaiEvents } from './mock-events-dubai'
import { gccEvents } from './mock-events-gcc'

export const allEvents = [...abuDhabiEvents, ...dubaiEvents, ...gccEvents]
