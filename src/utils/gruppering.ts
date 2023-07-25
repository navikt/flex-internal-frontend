import { KlippetSykepengesoknadRecord, Soknad } from '../queryhooks/useSoknader'
import { Sortering } from '../components/ValgtSortering'
import { Filter } from '../components/Filter'

import { Klipp, perioderSomMangler } from './overlapp'

export interface SoknadGruppering {
    soknad: Soknad
    klippingAvSoknad: Klipp[]
}

export interface SykmeldingGruppering {
    soknader: Map<string, SoknadGruppering>
    klippingAvSykmelding: Klipp[]
}

function filtrer(filter: Filter[], soknader: Soknad[]) {
    let filtrerteSoknader = soknader
    filter.forEach((f: Filter) => {
        filtrerteSoknader = filtrerteSoknader.filter((sok: any) => {
            return (
                (f.inkluder && f.verdi === JSON.stringify(sok[f.prop])) ||
                (!f.inkluder && f.verdi !== JSON.stringify(sok[f.prop]))
            )
        })
    })
    return filtrerteSoknader
}

function gruppering(soknader: Soknad[], klipp: KlippetSykepengesoknadRecord[]) {
    const sykmeldingGruppering = new Map<string, SykmeldingGruppering>()

    soknader.forEach((sok) => {
        const key = sok.sykmeldingId!

        if (!sykmeldingGruppering.has(key)) {
            sykmeldingGruppering.set(key, {
                soknader: new Map<string, SoknadGruppering>(),
                klippingAvSykmelding: [],
            })
        }

        sykmeldingGruppering.get(key)?.soknader.set(sok.id, { soknad: sok, klippingAvSoknad: [] })
    })

    const fullstendigKlipp = klipp.filter((k) => k.periodeEtter === null)
    fullstendigKlipp.forEach((k) => {
        const perioderSomErKlippet = perioderSomMangler(k)

        if (k.klippVariant.startsWith('SYKMELDING')) {
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
                const ghostSoknad = new Soknad({
                    id: k.sykepengesoknadUuid,
                    sykmeldingId: k.sykmeldingUuid + '_GHOST',
                    soknadstype: 'ARBEIDSTAKERE',
                    arbeidssituasjon: 'ARBEIDSTAKER',
                })

                if (!sykmeldingGruppering.has(ghostSoknad.sykmeldingId!)) {
                    sykmeldingGruppering.set(ghostSoknad.sykmeldingId!, {
                        soknader: new Map<string, SoknadGruppering>(),
                        klippingAvSykmelding: [],
                    })
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

export function sortert(a: [string, SykmeldingGruppering], b: [string, SykmeldingGruppering], sortering: Sortering) {
    const aSykmeldingId = a.at(0) as string
    const aSykmeldingGruppering = a.at(1) as SykmeldingGruppering
    const bSykmeldingId = b.at(0) as string
    const bSykmeldingGruppering = b.at(1) as SykmeldingGruppering

    function mapTilSoknadProp(syk: SykmeldingGruppering, prop: string) {
        return Array.from(syk.soknader.values()).map((sok) => (sok.soknad as any)[prop])
    }

    function mapTilKlippProp(syk: SykmeldingGruppering, prop: string) {
        return Array.from(syk.soknader.values())
            .flatMap((sok) => sok.klippingAvSoknad)
            .concat(syk.klippingAvSykmelding)
            .map((klipp) => (klipp as any)[prop])
    }

    function maximum(previousValue: any, currentValue: any) {
        if (currentValue > previousValue) return currentValue
        else return previousValue
    }

    switch (sortering) {
        case 'sykmelding skrevet': {
            const verdiA = mapTilSoknadProp(aSykmeldingGruppering, 'sykmeldingUtskrevet').reduce(maximum, new Date(0))
            const verdiB = mapTilSoknadProp(bSykmeldingGruppering, 'sykmeldingUtskrevet').reduce(maximum, new Date(0))
            return verdiA > verdiB ? -1 : 1
        }
        case 'opprettet': {
            const verdiA = aSykmeldingId.endsWith('_GHOST')
                ? mapTilKlippProp(aSykmeldingGruppering, 'timestamp').reduce(maximum, new Date(0))
                : mapTilSoknadProp(aSykmeldingGruppering, 'opprettetDato').reduce(maximum, new Date(0))
            const verdiB = bSykmeldingId.endsWith('_GHOST')
                ? mapTilKlippProp(bSykmeldingGruppering, 'timestamp').reduce(maximum, new Date(0))
                : mapTilSoknadProp(bSykmeldingGruppering, 'opprettetDato').reduce(maximum, new Date(0))
            return verdiA > verdiB ? -1 : 1
        }
        default:
        case 'tom': {
            const verdiA = aSykmeldingId.endsWith('_GHOST')
                ? mapTilKlippProp(aSykmeldingGruppering, 'tom').reduce(maximum, '2000-01-01')
                : mapTilSoknadProp(aSykmeldingGruppering, 'tom').reduce(maximum, '2000-01-01')
            const verdiB = bSykmeldingId.endsWith('_GHOST')
                ? mapTilKlippProp(bSykmeldingGruppering, 'tom').reduce(maximum, '2000-01-01')
                : mapTilSoknadProp(bSykmeldingGruppering, 'tom').reduce(maximum, '2000-01-01')
            return verdiA > verdiB ? -1 : 1
        }
    }
}

export default function gruppertOgFiltrert(
    filter: Filter[],
    soknader: Soknad[],
    klipp: KlippetSykepengesoknadRecord[],
): Map<string, SykmeldingGruppering> {
    const filtrerteSoknader = filtrer(filter, soknader)
    return gruppering(filtrerteSoknader, klipp)
}
