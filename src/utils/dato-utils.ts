// Datohjelpere som pinner tidspunkter til Europe/Oslo.
// Aksel sin <Timeline> regner ut månedsetiketter internt med date-fns, og ved
// overgang til sommertid forskyves resultatet én time dersom vindusgrensene har
// blandet tidssone-semantikk. TZDate gir én konsistent kontekst.

import { TZDate } from '@date-fns/tz'
import { parseISO } from 'date-fns'

const OSLO = 'Europe/Oslo'

function isoTimestampHarTidssone(iso: string): boolean {
    return /([Zz]|[+-]\d{2}:\d{2})$/.test(iso)
}

export function toDate(date: string, defaultTimezone = OSLO): Date {
    if (isoTimestampHarTidssone(date)) {
        return parseISO(date)
    }

    return new TZDate(date, defaultTimezone)
}

/** Nåtidspunkt i Oslo-tidssone. */
export function now(): Date {
    return new TZDate(new Date(), OSLO)
}

/** Bygger en dato fra år, måned og dag i Oslo-tidssone. */
export function osloDate(year: number, month: number, day: number): Date {
    const m = String(month).padStart(2, '0')
    const d = String(day).padStart(2, '0')

    return new TZDate(`${year}-${m}-${d}`, OSLO)
}

/** Normaliserer en vilkårlig Date til Oslo-dato på dagsnivå. */
export function tilOsloDatoFraDato(dato: Date): Date {
    const osloView = new TZDate(dato, OSLO)
    return osloDate(osloView.getFullYear(), osloView.getMonth() + 1, osloView.getDate())
}
