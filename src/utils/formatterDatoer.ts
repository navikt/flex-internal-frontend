import dayjs from 'dayjs'

export function formatterTimestamp(timestamp: string): string {
    return dayjs(timestamp).format('D MMM YYYY HH:mm')
}
