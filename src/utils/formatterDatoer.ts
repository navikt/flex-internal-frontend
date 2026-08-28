import { format } from 'date-fns'

import { toDate } from './dato-utils'

export function formatterTimestamp(timestamp: string | undefined): string {
    if (!timestamp) {
        return ''
    }
    return format(toDate(timestamp), 'd MMM yyyy HH:mm')
}
