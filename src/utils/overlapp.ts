import { RSSoknadsperiode } from '../queryhooks/useSoknader'
import dayjs, { Dayjs } from 'dayjs'

export function perioderSomMangler(perioderFor: RSSoknadsperiode[], perioderEtter: RSSoknadsperiode[]) {
    const fom = minFom(perioderFor)
    const tom = maxTom(perioderFor)
    const range = dayjsRange(fom, tom)
    let dagerSomMangler: Dayjs[] = []

    for(const dag of range) {
        const iPerioderFor = dagErIPerioder(dag, perioderFor)
        const iPerioderEtter = dagErIPerioder(dag, perioderEtter)
        if (iPerioderFor && !iPerioderEtter) {
            dagerSomMangler.push(dag)
        }
    }

    return sammenhengendeDagerTilPerioder(dagerSomMangler)
}

function minFom(perioder: RSSoknadsperiode[]) {
    let currentMin = '9999-12-31'
    perioder.forEach((p) =>  {
        if (p.fom < currentMin) {
            currentMin = p.fom
        }
    })
    return currentMin
}

function maxTom(perioder: RSSoknadsperiode[]) {
    let currentMax = '1111-01-01'
    perioder.forEach((p) =>  {
        if (p.tom > currentMax) {
            currentMax = p.tom
        }
    })
    return currentMax
}

function dayjsRange(from: string, to: string) {
    const fom = dayjs(from)
    const tom = dayjs(to)
    let range: Dayjs[] = []

    let current: dayjs.Dayjs
    for (current = fom; !tom.isBefore(current); current = current.add(1, 'days')) {
        range.push(current)
    }

    return range
}

function dagErIPerioder(dag: Dayjs, perioder: RSSoknadsperiode[]) {
    let iPeriode = false
    for(const periode of perioder) {
        const fom = dayjs(periode.fom)
        const tom = dayjs(periode.tom)
        if (dag >= fom && dag <= tom) {
            iPeriode = true
        }
    }
    return iPeriode
}

function sammenhengendeDagerTilPerioder(dager: Dayjs[]) {
    let perioder = []
    let fom = dager[0]
    let tom = dager[0]

    for (const dag of dager) {
        if (tom.isSame(dag, 'day') || tom.add(1, 'day').isSame(dag)) {
            tom = dag
        } else {
            perioder.push({
                fom: fom,
                tom: tom
            })
            fom = dag.add(1, 'days')
            tom = fom
        }
    }

    if (dager.length > 1 && !fom.isSame(tom, 'day')) {
        perioder.push({
            fom: fom.toDate(),
            tom: tom.toDate()
        })
    }

    return perioder
}
