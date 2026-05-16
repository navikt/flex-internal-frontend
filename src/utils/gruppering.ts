import dayjs from 'dayjs'
import { logger } from '@navikt/next-logger'

import { KlippetSykepengesoknadRecord, Soknad } from '../queryhooks/useSoknader'
import { Sortering } from '../components/soknad/ValgtSortering'
import { Filter } from '../components/Filter'

import { Klipp, maxTom, minFom, perioderSomMangler, sykmeldingDager, sykmeldingOverlappendeDager } from './overlapp'
import { passerAlleFilter } from './filterlogikk'

export interface SoknadGruppering {
    soknad: Soknad
    klippingAvSoknad: Klipp[]
}

export interface SykmeldingGruppering {
    soknader: Map<string, SoknadGruppering>
    klippingAvSykmelding: Klipp[]
}

export interface ArbeidsgiverGruppering {
    sykmeldinger: Map<string, SykmeldingGruppering>
}

function filtrer(filter: Filter[], soknader: Soknad[]) {
    return soknader.filter((sok: Soknad) => passerAlleFilter(sok, filter))
}

function grupperPaSykmelding(
    soknader: Soknad[],
    klipp: KlippetSykepengesoknadRecord[],
    alleSoknader: Soknad[],
    filter: Filter[],
) {
    const sykmeldingGruppering = new Map<string, SykmeldingGruppering>()
    const alleSoknaderIds = new Set(alleSoknader.map((s) => s.id))

    soknader
        .sort((a, b) => (a.opprettetDato?.valueOf() ?? 0) - (b.opprettetDato?.valueOf() ?? 0))
        .forEach((sok) => {
            const key = sok.sykmeldingId!
            let sykmeldingKey = key

            if (sok.status === 'KORRIGERT') {
                let korrigeringIndex = 0
                let ledigKorrigeringKey = false

                while (!ledigKorrigeringKey) {
                    korrigeringIndex += 1
                    sykmeldingKey = `${key}_KORRIGERT_(${korrigeringIndex})`
                    if (!sykmeldingGruppering.has(sykmeldingKey)) {
                        ledigKorrigeringKey = true
                    }
                }
            }

            if (!sykmeldingGruppering.has(sykmeldingKey)) {
                sykmeldingGruppering.set(sykmeldingKey, {
                    soknader: new Map<string, SoknadGruppering>(),
                    klippingAvSykmelding: [],
                })
            }

            sykmeldingGruppering.get(sykmeldingKey)?.soknader.set(sok.id, { soknad: sok, klippingAvSoknad: [] })
        })

    const fullstendigKlipp = klipp.filter((k) => k.periodeEtter === null)
    fullstendigKlipp.forEach((k) => {
        const perioderSomErKlippet = perioderSomMangler(k)

        if (k.klippVariant.startsWith('SYKMELDING')) {
            if (filter.length > 0) {
                return
            }
            // Sykmeldingen ble klippet før vi opprettet søknader for den
            sykmeldingGruppering.set(k.sykmeldingUuid, {
                soknader: new Map<string, SoknadGruppering>(),
                klippingAvSykmelding: [...perioderSomErKlippet],
            })
        }
        if (k.klippVariant.startsWith('SOKNAD')) {
            let sykmeldingEksisterte = false

            // Noen ganger er hele søknaden klippet bort, men sykmelding var lang og vi finner fremdeles sykmeldingen
            sykmeldingGruppering.forEach((sykmelding) => {
                // TODO: Vi finner aldri denne søknaden, og vi kjenner heller ikke sykmelding id'n, så i disse tilfellene klarer vi ikke koble sammen klipping av søknad med riktig sykmelding
                if (sykmelding.soknader.has(k.sykepengesoknadUuid)) {
                    sykmelding.soknader.get(k.sykepengesoknadUuid)?.klippingAvSoknad.push(...perioderSomErKlippet)
                    sykmeldingEksisterte = true
                }
            })

            // Når hele søknaden er klippet bort og det ikke fantes flere søknader på samme sykmelding
            if (!sykmeldingEksisterte) {
                if (alleSoknaderIds.has(k.sykepengesoknadUuid)) {
                    return
                }

                const ghostSoknad = new Soknad({
                    soknadPerioder: [],
                    status: 'SENDT',
                    id: k.sykepengesoknadUuid,
                    sykmeldingId: k.sykmeldingUuid + '_GHOST',
                    soknadstype: 'ARBEIDSTAKERE',
                    arbeidssituasjon: 'ARBEIDSTAKER',
                    fom: minFom(perioderSomErKlippet),
                    tom: maxTom(perioderSomErKlippet),
                })

                if (!sykmeldingGruppering.has(ghostSoknad.sykmeldingId!)) {
                    sykmeldingGruppering.set(ghostSoknad.sykmeldingId!, {
                        soknader: new Map<string, SoknadGruppering>(),
                        klippingAvSykmelding: [],
                    })
                }

                if (!passerAlleFilter(ghostSoknad, filter)) {
                    return
                }

                sykmeldingGruppering.get(ghostSoknad.sykmeldingId!)?.soknader.set(k.sykepengesoknadUuid, {
                    soknad: ghostSoknad,
                    klippingAvSoknad: [...perioderSomErKlippet],
                })
            }
        }
    })

    const delvisKlipp = klipp.filter((k) => k.periodeEtter !== null)
    delvisKlipp.forEach((k) => {
        const perioderSomErKlippet = perioderSomMangler(k)

        if (k.klippVariant.startsWith('SYKMELDING')) {
            sykmeldingGruppering.get(k.sykmeldingUuid)?.klippingAvSykmelding.push(...perioderSomErKlippet)
        }
        if (k.klippVariant.startsWith('SOKNAD')) {
            sykmeldingGruppering.forEach((sykmelding) => {
                sykmelding.soknader.get(k.sykepengesoknadUuid)?.klippingAvSoknad.push(...perioderSomErKlippet)
            })
        }
    })

    return sykmeldingGruppering
}

function grupperPaArbeidsgiver(gruppertPaSykmelding: Map<string, SykmeldingGruppering>) {
    const gruppering = new Map<string, ArbeidsgiverGruppering>()
    const sykmeldingArray = Array.from(gruppertPaSykmelding.entries()).sort((a, b) => sortert(a, b, 'opprettet'))

    sykmeldingArray.forEach(([sykId, syk]) => {
        let arbeidsgiverIndex = 0
        let sykmeldingBleLagtTil = false
        const soknader = Array.from(syk.soknader.values()).map((sok) => sok.soknad)
        const orgnummer = soknader.find((soknad) => soknad.arbeidsgiverOrgnummer !== undefined)?.arbeidsgiverOrgnummer
        const harNaeringsdrivende = soknader.some((soknad) => soknad.arbeidssituasjon === 'NAERINGSDRIVENDE')

        const grupperingNokkel = orgnummer ?? (harNaeringsdrivende ? 'naeringsdrivende' : 'arbeidsgiver_GHOST')
        let grupperingOrgnummer = grupperingNokkel
        let iterationCount = 0
        const maxIterations = 20
        while (!sykmeldingBleLagtTil && iterationCount < maxIterations) {
            iterationCount++

            if (!gruppering.has(grupperingOrgnummer)) {
                gruppering.set(grupperingOrgnummer, { sykmeldinger: new Map<string, SykmeldingGruppering>() })
            }
            const arbeidsgiver = gruppering.get(grupperingOrgnummer)!

            const alleDager = []
            alleDager.push(...sykmeldingDager(sykId, syk))
            Array.from(arbeidsgiver.sykmeldinger.entries()).forEach(([sId, s]) => {
                alleDager.push(...sykmeldingDager(sId, s))
            })

            const overlappendeDager = sykmeldingOverlappendeDager(alleDager)
            if (overlappendeDager.length > 0) {
                arbeidsgiverIndex += 1
                grupperingOrgnummer = `${grupperingNokkel}(${arbeidsgiverIndex})`
            } else {
                arbeidsgiver.sykmeldinger.set(sykId, syk)
                sykmeldingBleLagtTil = true
            }
        }
        if (iterationCount >= maxIterations) {
            logger.error('Evig løkke unngått: nådd maksimal iterasjoner')
        }
    })

    return gruppering
}

export function sortert(a: [string, SykmeldingGruppering], b: [string, SykmeldingGruppering], sortering: Sortering) {
    const aSykmeldingId = a.at(0) as string
    const aSykmeldingGruppering = a.at(1) as SykmeldingGruppering
    const bSykmeldingId = b.at(0) as string
    const bSykmeldingGruppering = b.at(1) as SykmeldingGruppering

    function mapTilSoknadProp(syk: SykmeldingGruppering, prop: string) {
        return Array.from(syk.soknader.values()).map((sok) => (sok.soknad as unknown as Record<string, unknown>)[prop])
    }

    function mapTilKlippProp(syk: SykmeldingGruppering, prop: string) {
        return Array.from(syk.soknader.values())
            .flatMap((sok) => sok.klippingAvSoknad)
            .concat(syk.klippingAvSykmelding)
            .map((klipp) => (klipp as unknown as Record<string, unknown>)[prop])
    }

    function isGreater(a: unknown, b: unknown): boolean {
        if (typeof a === 'string' && typeof b === 'string') return a > b
        if (dayjs.isDayjs(a) && dayjs.isDayjs(b)) return a.valueOf() > b.valueOf()
        return false
    }

    function maximum(previousValue: unknown, currentValue: unknown) {
        if (isGreater(currentValue, previousValue)) return currentValue
        else return previousValue
    }

    const tilDayjsVerdi = (verdi: unknown) => {
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

function leggTilOppholdUtland(soknader: Soknad[], filter: Filter[], gruppering: Map<string, ArbeidsgiverGruppering>) {
    const oppholdUtlandSoknader = soknader.filter(
        (sok) => sok.soknadstype === 'OPPHOLD_UTLAND' && passerAlleFilter(sok, filter),
    )

    if (oppholdUtlandSoknader.length === 0) return

    const sykmeldinger = new Map<string, SykmeldingGruppering>()
    oppholdUtlandSoknader.forEach((sok) => {
        sykmeldinger.set(sok.id, {
            soknader: new Map([[sok.id, { soknad: sok, klippingAvSoknad: [] }]]),
            klippingAvSykmelding: [],
        })
    })

    gruppering.set('opphold_utland', { sykmeldinger })
}

export default function gruppertOgFiltrert(
    filter: Filter[],
    soknader: Soknad[],
    klipp: KlippetSykepengesoknadRecord[],
): Map<string, ArbeidsgiverGruppering> {
    const vanligeSoknader = soknader.filter((sok) => sok.soknadstype !== 'OPPHOLD_UTLAND')
    const filtrerteSoknader = filtrer(filter, vanligeSoknader)
    const gruppertPaSykmelding = grupperPaSykmelding(filtrerteSoknader, klipp, vanligeSoknader, filter)
    const gruppering = grupperPaArbeidsgiver(gruppertPaSykmelding)
    leggTilOppholdUtland(soknader, filter, gruppering)
    return gruppering
}
