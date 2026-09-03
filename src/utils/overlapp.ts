import { addDays, eachDayOfInterval, format, isBefore, isEqual, isValid, startOfDay } from 'date-fns'

import { KlippetSykepengesoknadRecord, Soknadsperiode } from '../queryhooks/useSoknader'

import { toDate } from './dato-utils'
import { SykmeldingGruppering } from './gruppering'

const DATO_FORMAT = 'yyyy-MM-dd'

export interface FomTom {
    fom: string
    tom: string
}
export interface Klipp extends KlippetSykepengesoknadRecord, FomTom {}

export function perioderSomMangler(klipping: KlippetSykepengesoknadRecord) {
    const fom = minFom(klipping.periodeFor)
    const tom = maxTom(klipping.periodeFor)
    const range = dateRange(fom, tom)
    const dagerSomMangler: Date[] = []

    for (const dag of range) {
        const iPerioderFor = dagErIPerioder(dag, klipping.periodeFor)
        const iPerioderEtter = dagErIPerioder(dag, klipping.periodeEtter)
        if (iPerioderFor && !iPerioderEtter) {
            dagerSomMangler.push(dag)
        }
    }

    return sammenhengendeDagerTilPerioder(dagerSomMangler).map((p) => {
        return {
            ...p,
            ...klipping,
        } as Klipp
    })
}

export function minFom(perioder: { fom: string | Date }[]) {
    let currentMin = '9999-12-31'
    perioder.forEach((p) => {
        const fom = typeof p.fom === 'string' ? p.fom : format(p.fom, DATO_FORMAT)
        if (fom < currentMin) {
            currentMin = fom
        }
    })
    return currentMin
}

export function maxTom(perioder: { tom: string | Date }[]) {
    let currentMax = '1111-01-01'
    perioder.forEach((p) => {
        const tom = typeof p.tom === 'string' ? p.tom : format(p.tom, DATO_FORMAT)
        if (tom > currentMax) {
            currentMax = tom
        }
    })
    return currentMax
}

/**
 * Normaliserer en dato-only-verdi (streng eller Date) til midnatt Oslo-tid.
 * `toDate()` av en dato-only streng er forankret i UTC-midnatt av datostrengen (viser riktig Oslo-kalenderdag ved
 * formatering, men er ikke selv Oslo-midnatt som instant). `eachDayOfInterval` sin interne dag-stepping bruker derimot
 * ekte Oslo-midnatt (via setHours). Uten denne normaliseringen blir første dag i et spenn feilaktig ekskludert.
 */
function kalenderdag(dato: string | Date): Date {
    return startOfDay(typeof dato === 'string' ? toDate(dato) : dato)
}

/** Bygger en inklusiv liste av kalenderdager (Oslo-dato, midnatt) fra og med `from` til og med `to`. */
function dateRange(from: string | Date, to: string | Date): Date[] {
    const fom = kalenderdag(from)
    const tom = kalenderdag(to)

    // Ugyldige eller omvendte spenn ga tidligere en tom range (den gamle isBefore-sjekken over hoppet aldri løkken).
    // eachDayOfInterval kaster på ugyldig intervall, så vi bevarer den samme fail-safe atferden eksplisitt.
    if (!isValid(fom) || !isValid(tom) || isBefore(tom, fom)) {
        return []
    }

    return eachDayOfInterval({ start: fom, end: tom })
}

function dagErIPerioder(dag: Date, perioder: Soknadsperiode[] | null) {
    let iPeriode = false

    if (perioder === null) {
        return false
    }

    for (const periode of perioder) {
        const fom = kalenderdag(periode.fom)
        const tom = kalenderdag(periode.tom)
        if (dag >= fom && dag <= tom) {
            iPeriode = true
        }
    }
    return iPeriode
}

function sammenhengendeDagerTilPerioder(dager: Date[]): FomTom[] {
    if (dager.length === 0) {
        return []
    }

    dager.sort((a, b) => a.getTime() - b.getTime())
    const perioder: FomTom[] = []
    let fom = dager[0]
    let tom = dager[0]

    for (const dag of dager) {
        if (isEqual(tom, dag) || isEqual(addDays(tom, 1), dag)) {
            // Sammenhengende periode
            tom = dag
        } else {
            // Ny periode
            perioder.push({
                fom: format(fom, DATO_FORMAT),
                tom: format(tom, DATO_FORMAT),
            })
            fom = dag
            tom = dag
        }
    }

    perioder.push({
        fom: format(fom, DATO_FORMAT),
        tom: format(tom, DATO_FORMAT),
    })

    return perioder
}

export function overlappendePeriodeInnenforTimelineRad(sykmeldingGruppering: Map<string, SykmeldingGruppering>) {
    const overlappendeDager: string[] = []

    Array.from(sykmeldingGruppering.entries()).forEach(([sykId, syk]) => {
        // Finner dager som kommer til å overlappe i tidslinjen
        overlappendeDager.push(...sykmeldingOverlappendeDager(sykmeldingDager(sykId, syk)))
    })

    return sammenhengendeDagerTilPerioder(overlappendeDager.sort().map((dag) => kalenderdag(dag)))
}

export function sykmeldingDager(sykId: string, syk: SykmeldingGruppering) {
    const dager: string[] = [] // Alle dager som skal legges til i samme rad i tidslinjen

    syk.klippingAvSykmelding.forEach((klippSyk) => {
        dateRange(klippSyk.fom, klippSyk.tom).forEach((dag) => {
            dager.push(format(dag, DATO_FORMAT))
        })
    })

    syk.soknader.forEach((sok) => {
        if (!sykId.endsWith('_GHOST')) {
            dateRange(sok.soknad.fom!, sok.soknad.tom!).forEach((dag) => {
                dager.push(format(dag, DATO_FORMAT))
            })
        }
        sok.klippingAvSoknad.forEach((klippSok) => {
            dateRange(klippSok.fom, klippSok.tom).forEach((dag) => {
                dager.push(format(dag, DATO_FORMAT))
            })
        })
    })

    return dager
}

export function sykmeldingOverlappendeDager(dager: string[]) {
    // Finner dager som kommer til å overlappe i tidslinjen
    return dager.filter((item, index) => dager.indexOf(item) !== index)
}
