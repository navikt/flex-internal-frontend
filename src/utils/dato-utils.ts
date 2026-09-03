// Datohjelpere som pinner tidspunkter til Europe/Oslo.
// Aksel sin <Timeline> regner ut månedsetiketter internt med date-fns, og ved
// overgang til sommertid forskyves resultatet én time dersom vindusgrensene har
// blandet tidssone-semantikk. TZDate gir én konsistent kontekst.

import { TZDate } from '@date-fns/tz'
import { format, parseISO } from 'date-fns'
import { nb } from 'date-fns/locale/nb'

const OSLO = 'Europe/Oslo'

function isoTimestampHarTidssone(iso: string): boolean {
    return /([Zz]|[+-]\d{2}:\d{2})$/.test(iso)
}

function erGyldigOsloKalenderdato(dato: string, parsed: TZDate): boolean {
    const [år, måned, dag] = dato.split('-').map(Number)

    return parsed.getFullYear() === år && parsed.getMonth() + 1 === måned && parsed.getDate() === dag
}

export function toDate(date: string, defaultTimezone = OSLO): Date {
    if (isoTimestampHarTidssone(date)) {
        return parseISO(date)
    }

    const parsed = new TZDate(date, defaultTimezone)
    if (/^\d{4}-\d{2}-\d{2}$/.test(date) && !erGyldigOsloKalenderdato(date, parsed)) {
        return new Date(NaN)
    }

    return parsed
}

/** Som toDate, men returnerer undefined for tomme verdier. */
export function toDateEllerUndefined(dato: string | null | undefined): Date | undefined {
    if (!dato) return undefined

    const parsed = toDate(dato)
    return erGyldigDato(parsed) ? parsed : undefined
}

/** Som toDateEllerUndefined, men kaster med feltnavn ved ugyldig verdi. */
export function toDatePaakrevd(dato: string, feltnavn: string): Date {
    const parsed = toDateEllerUndefined(dato)
    if (!parsed) {
        throw new Error(`Ugyldig datoverdi i ${feltnavn}: ${dato}`)
    }

    return parsed
}

/** Sjekker om verdien er en gyldig Date. Erstatter den gamle .isValid()-kontrollen. */
export function erGyldigDato(dato: unknown): dato is Date {
    return dato instanceof Date && !Number.isNaN(dato.getTime())
}

/** Formaterer en dato med norsk bokmål-locale. */
export function formaterDato(dato: Date, mønster: string): string {
    return format(dato, mønster, { locale: nb })
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
