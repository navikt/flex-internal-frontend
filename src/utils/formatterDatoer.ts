import dayjs from 'dayjs'

export function formatterTimestamp(timestamp: string | undefined): string {
    if (!timestamp) {
        return ''
    }
    return dayjs(timestamp).format('D MMM YYYY HH:mm')
}
