import dayjs from 'dayjs'

import { Sortering } from '../components/soknad/ValgtSortering'

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
        if (dayjs.isDayjs(a) && dayjs.isDayjs(b)) return a.valueOf() > b.valueOf()
        return false
    }

    const maximum = (previousValue: unknown, currentValue: unknown): unknown => {
        if (isGreater(currentValue, previousValue)) return currentValue
        else return previousValue
    }

    const tilDayjsVerdi = (verdi: unknown): dayjs.Dayjs => {
        if (dayjs.isDayjs(verdi)) return verdi
        if (typeof verdi === 'string') return dayjs(verdi)
        return dayjs(0)
    }

    switch (sortering) {
        case 'sykmelding skrevet': {
            const verdiA = mapTilSoknadProp(aSykmeldingGruppering, 'sykmeldingUtskrevet').reduce(maximum, dayjs(0))
            const verdiB = mapTilSoknadProp(bSykmeldingGruppering, 'sykmeldingUtskrevet').reduce(maximum, dayjs(0))
            return isGreater(verdiA, verdiB) ? -1 : 1
        }
        case 'opprettet': {
            const verdiA = aSykmeldingId.endsWith('_GHOST')
                ? mapTilKlippProp(aSykmeldingGruppering, 'timestamp').reduce(maximum, dayjs(0))
                : mapTilSoknadProp(aSykmeldingGruppering, 'opprettetDato').reduce(maximum, dayjs(0))
            const verdiB = bSykmeldingId.endsWith('_GHOST')
                ? mapTilKlippProp(bSykmeldingGruppering, 'timestamp').reduce(maximum, dayjs(0))
                : mapTilSoknadProp(bSykmeldingGruppering, 'opprettetDato').reduce(maximum, dayjs(0))
            return isGreater(verdiA, verdiB) ? -1 : 1
        }
        default:
        case 'tom': {
            const verdiA = aSykmeldingId.endsWith('_GHOST')
                ? mapTilKlippProp(aSykmeldingGruppering, 'tom').map(tilDayjsVerdi).reduce(maximum, dayjs('2000-01-01'))
                : mapTilSoknadProp(aSykmeldingGruppering, 'tom').map(tilDayjsVerdi).reduce(maximum, dayjs('2000-01-01'))
            const verdiB = bSykmeldingId.endsWith('_GHOST')
                ? mapTilKlippProp(bSykmeldingGruppering, 'tom').map(tilDayjsVerdi).reduce(maximum, dayjs('2000-01-01'))
                : mapTilSoknadProp(bSykmeldingGruppering, 'tom').map(tilDayjsVerdi).reduce(maximum, dayjs('2000-01-01'))
            return isGreater(verdiA, verdiB) ? -1 : 1
        }
    }
}
