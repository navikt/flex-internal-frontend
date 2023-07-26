import dayjs, { Dayjs } from 'dayjs'

import { KlippetSykepengesoknadRecord, RSSoknadsperiode } from '../queryhooks/useSoknader'

import { SykmeldingGruppering } from './gruppering'

export interface FomTom {
    fom: string
    tom: string
}
export interface Klipp extends KlippetSykepengesoknadRecord, FomTom {}

export function perioderSomMangler(klipping: KlippetSykepengesoknadRecord) {
    const fom = minFom(klipping.periodeFor)
    const tom = maxTom(klipping.periodeFor)
    const range = dayjsRange(fom, tom)
    const dagerSomMangler: Dayjs[] = []

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

function minFom(perioder: RSSoknadsperiode[]) {
    let currentMin = '9999-12-31'
    perioder.forEach((p) => {
        if (p.fom < currentMin) {
            currentMin = p.fom
        }
    })
    return currentMin
}

function maxTom(perioder: RSSoknadsperiode[]) {
    let currentMax = '1111-01-01'
    perioder.forEach((p) => {
        if (p.tom > currentMax) {
            currentMax = p.tom
        }
    })
    return currentMax
}

function dayjsRange(from: string, to: string) {
    const fom = dayjs(from)
    const tom = dayjs(to)
    const range: Dayjs[] = []

    let current: dayjs.Dayjs
    for (current = fom; !tom.isBefore(current); current = current.add(1, 'days')) {
        range.push(current)
    }

    return range
}

function dagErIPerioder(dag: Dayjs, perioder: RSSoknadsperiode[]) {
    let iPeriode = false

    if (perioder === null) {
        return false
    }

    for (const periode of perioder) {
        const fom = dayjs(periode.fom)
        const tom = dayjs(periode.tom)
        if (dag >= fom && dag <= tom) {
            iPeriode = true
        }
    }
    return iPeriode
}

function sammenhengendeDagerTilPerioder(dager: Dayjs[]) {
    if (dager.length === 0) {
        return []
    }

    dager.sort((a, b) => a.diff(b))
    const perioder: FomTom[] = []
    let fom = dager[0]
    let tom = dager[0]

    for (const dag of dager) {
        if (tom.isSame(dag, 'day') || tom.add(1, 'day').isSame(dag)) {
            // Sammenhengende periode
            tom = dag
        } else {
            // Ny periode
            perioder.push({
                fom: fom.format('YYYY-MM-DD'),
                tom: tom.format('YYYY-MM-DD'),
            })
            fom = dag
            tom = dag
        }
    }

    perioder.push({
        fom: fom.format('YYYY-MM-DD'),
        tom: tom.format('YYYY-MM-DD'),
    })

    return perioder
}

export function overlappendePeriodeInnenforTimelineRad(sykmeldingGruppering: Map<string, SykmeldingGruppering>) {
    const overlappendeDager: string[] = []

    Array.from(sykmeldingGruppering.entries()).forEach(([sykId, syk]) => {
        // Finner dager som kommer til å overlappe i tidslinjen
        overlappendeDager.push(...sykmeldingOverlappendeDager(sykmeldingDager(sykId, syk)))
    })

    return sammenhengendeDagerTilPerioder(overlappendeDager.sort().map((dag) => dayjs(dag)))
}

export function sykmeldingDager(sykId: string, syk: SykmeldingGruppering) {
    const dager: string[] = [] // Alle dager som skal legges til i samme rad i tidslinjen

    syk.klippingAvSykmelding.forEach((klippSyk) => {
        dayjsRange(klippSyk.fom, klippSyk.tom).forEach((dag) => {
            dager.push(dag.format('YYYY-MM-DD'))
        })
    })

    syk.soknader.forEach((sok) => {
        if (!sykId.endsWith('_GHOST')) {
            dayjsRange(sok.soknad.fom!, sok.soknad.tom!).forEach((dag) => {
                dager.push(dag.format('YYYY-MM-DD'))
            })
        }
        sok.klippingAvSoknad.forEach((klippSok) => {
            dayjsRange(klippSok.fom, klippSok.tom).forEach((dag) => {
                dager.push(dag.format('YYYY-MM-DD'))
            })
        })
    })

    return dager
}

export function sykmeldingOverlappendeDager(dager: string[]) {
    // Finner dager som kommer til å overlappe i tidslinjen
    return dager.filter((item, index) => dager.indexOf(item) !== index)
}
