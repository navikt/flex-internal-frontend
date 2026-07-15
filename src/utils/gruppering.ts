import { logger } from '@navikt/next-logger'

import { KlippetSykepengesoknadRecord, Soknad } from '../queryhooks/useSoknader'
import { Filter } from '../components/Filter'

import { sortert } from './soknadSortering'
import { Klipp, maxTom, minFom, perioderSomMangler, sykmeldingDager } from './overlapp'
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
            const key = sok.sykmeldingId ?? `${sok.id}_UTEN_SYKMELDING`
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
            let soknadFunnet = false
            let sykmeldingMedSammeId: SykmeldingGruppering | undefined

            sykmeldingGruppering.forEach((sykmelding, sykId) => {
                if (sykmelding.soknader.has(k.sykepengesoknadUuid)) {
                    sykmelding.soknader.get(k.sykepengesoknadUuid)?.klippingAvSoknad.push(...perioderSomErKlippet)
                    soknadFunnet = true
                }
                if (sykId === k.sykmeldingUuid || sykId.startsWith(k.sykmeldingUuid + '_KORRIGERT')) {
                    sykmeldingMedSammeId = sykmelding
                }
            })

            if (!soknadFunnet) {
                if (alleSoknaderIds.has(k.sykepengesoknadUuid)) {
                    return
                }

                // Erstatningssøknad med annen UUID finnes på samme sykmelding — vis klippehistorikk der
                if (sykmeldingMedSammeId) {
                    sykmeldingMedSammeId.klippingAvSykmelding.push(...perioderSomErKlippet)
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
        const nySykmeldingDager = new Set(sykmeldingDager(sykId, syk))
        let iterationCount = 0
        const maxIterations = 20
        while (!sykmeldingBleLagtTil && iterationCount < maxIterations) {
            iterationCount++

            if (!gruppering.has(grupperingOrgnummer)) {
                gruppering.set(grupperingOrgnummer, { sykmeldinger: new Map<string, SykmeldingGruppering>() })
            }
            const arbeidsgiver = gruppering.get(grupperingOrgnummer)!

            const eksisterendeDager = new Set<string>()
            Array.from(arbeidsgiver.sykmeldinger.entries()).forEach(([sId, s]) => {
                sykmeldingDager(sId, s).forEach((dag) => eksisterendeDager.add(dag))
            })

            const harOverlapp = [...nySykmeldingDager].some((dag) => eksisterendeDager.has(dag))
            if (harOverlapp) {
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
