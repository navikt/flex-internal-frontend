import { Sortering } from '../components/soknad/ValgtSortering'

import { toDate } from './dato-utils'
import { SykmeldingGruppering } from './gruppering'

export const sortert = (
    a: [string, SykmeldingGruppering],
    b: [string, SykmeldingGruppering],
    sortering: Sortering,
): number => {
    const aSykmeldingId = a.at(0) as string
    const aSykmeldingGruppering = a.at(1) as SykmeldingGruppering
    const bSykmeldingId = b.at(0) as string
    const bSykmeldingGruppering = b.at(1) as SykmeldingGruppering

    const mapTilSoknadProp = (syk: SykmeldingGruppering, prop: string): unknown[] =>
        Array.from(syk.soknader.values()).map((sok) => (sok.soknad as unknown as Record<string, unknown>)[prop])

    const mapTilKlippProp = (syk: SykmeldingGruppering, prop: string): unknown[] =>
        Array.from(syk.soknader.values())
            .flatMap((sok) => sok.klippingAvSoknad)
            .concat(syk.klippingAvSykmelding)
            .map((klipp) => (klipp as unknown as Record<string, unknown>)[prop])

    const isGreater = (a: unknown, b: unknown): boolean => {
        if (typeof a === 'string' && typeof b === 'string') return a > b
        if (a instanceof Date && b instanceof Date) return a.getTime() > b.getTime()
        return false
    }

    const maximum = (previousValue: unknown, currentValue: unknown): unknown => {
        if (isGreater(currentValue, previousValue)) return currentValue
        else return previousValue
    }

    /** Normaliserer klipp (streng, 'YYYY-MM-DD') og søknad (Date) til samme Date-representasjon for sammenligning. */
    const tilDateVerdi = (verdi: unknown): Date => {
        if (verdi instanceof Date) return verdi
        if (typeof verdi === 'string') return toDate(verdi)
        return new Date(0)
    }

    switch (sortering) {
        case 'sykmelding skrevet': {
            const verdiA = mapTilSoknadProp(aSykmeldingGruppering, 'sykmeldingUtskrevet').reduce(maximum, new Date(0))
            const verdiB = mapTilSoknadProp(bSykmeldingGruppering, 'sykmeldingUtskrevet').reduce(maximum, new Date(0))
            return isGreater(verdiA, verdiB) ? -1 : 1
        }
        case 'opprettet': {
            const verdiA = aSykmeldingId.endsWith('_GHOST')
                ? mapTilKlippProp(aSykmeldingGruppering, 'timestamp').reduce(maximum, new Date(0))
                : mapTilSoknadProp(aSykmeldingGruppering, 'opprettetDato').reduce(maximum, new Date(0))
            const verdiB = bSykmeldingId.endsWith('_GHOST')
                ? mapTilKlippProp(bSykmeldingGruppering, 'timestamp').reduce(maximum, new Date(0))
                : mapTilSoknadProp(bSykmeldingGruppering, 'opprettetDato').reduce(maximum, new Date(0))
            return isGreater(verdiA, verdiB) ? -1 : 1
        }
        default:
        case 'tom': {
            const verdiA = aSykmeldingId.endsWith('_GHOST')
                ? mapTilKlippProp(aSykmeldingGruppering, 'tom').map(tilDateVerdi).reduce(maximum, toDate('2000-01-01'))
                : mapTilSoknadProp(aSykmeldingGruppering, 'tom').map(tilDateVerdi).reduce(maximum, toDate('2000-01-01'))
            const verdiB = bSykmeldingId.endsWith('_GHOST')
                ? mapTilKlippProp(bSykmeldingGruppering, 'tom').map(tilDateVerdi).reduce(maximum, toDate('2000-01-01'))
                : mapTilSoknadProp(bSykmeldingGruppering, 'tom').map(tilDateVerdi).reduce(maximum, toDate('2000-01-01'))
            return isGreater(verdiA, verdiB) ? -1 : 1
        }
    }
}
