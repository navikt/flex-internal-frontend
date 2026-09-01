import { format } from 'date-fns'
import { nb } from 'date-fns/locale'

import { toDate } from './dato-utils'

export function formatterTimestamp(timestamp: string | undefined): string {
    if (!timestamp) {
        return ''
    }
    return format(toDate(timestamp), 'd MMM yyyy HH:mm', { locale: nb })
}
