import React, { Fragment } from 'react'
import { BodyShort, Timeline } from '@navikt/ds-react'

import type { Sykmelding, SykmeldingStatusType } from '../../queryhooks/useSykmeldinger'
import { datostrengTilUtcDato } from '../../utils/dato'
import { filtrerPaFilter } from '../../utils/filterlogikk'
import { hentDatospenn, validerSykmeldingsDatoer } from '../../utils/sykmeldingValidering'
import { Detaljer } from '../Detaljer'
import { Filter } from '../Filter'

const sykmeldingStatus = (status?: SykmeldingStatusType): 'success' | 'warning' | 'info' => {
    if (!status) return 'info'
    if (['SENDT', 'BEKREFTET'].includes(status)) return 'success'
    if (['AVVIST', 'UTGATT', 'AVBRUTT'].includes(status)) return 'warning'
    return 'info'
}

interface SykmeldingerPerArbeidsgiver {
    navn: string
    sykmeldinger: Sykmelding[]
    dagNokler: Set<string>
}

interface PeriodeMedDatoer {
    fom: string
    tom: string
    startDato: Date
    sluttDato: Date
}

const arbeidssituasjonForSykmelding = (sykmelding: Sykmelding): string | null => {
    const arbeidssituasjon = sykmelding.sykmeldingStatus?.brukerSvar?.arbeidssituasjon?.svar
    if (typeof arbeidssituasjon !== 'string') return null

    const trimmetArbeidssituasjon = arbeidssituasjon.trim()
    return trimmetArbeidssituasjon.length > 0 ? trimmetArbeidssituasjon : null
}

const arbeidssituasjonLabel = (arbeidssituasjon: string): string => {
    const label = arbeidssituasjon.toLowerCase().replaceAll('_', ' ')
    return label.charAt(0).toUpperCase() + label.slice(1)
}

const arbeidsgiverIdForSykmelding = (sykmelding: Sykmelding): string => {
    const orgnummer = sykmelding.sykmeldingStatus?.arbeidsgiver?.orgnummer?.trim() ?? ''
    const arbeidsgiverNavn = sykmelding.arbeidsgiver?.navn?.trim() ?? ''
    const arbeidssituasjon = arbeidssituasjonForSykmelding(sykmelding)

    if (orgnummer || arbeidsgiverNavn) {
        return `${orgnummer}__${arbeidsgiverNavn}`
    }

    if (arbeidssituasjon) {
        return `arbeidssituasjon__${arbeidssituasjon}`
    }

    return 'arbeidsgiver_ukjent'
}

const arbeidsgiverNavnForSykmelding = (sykmelding: Sykmelding): string => {
    const arbeidsgiverNavn = sykmelding.arbeidsgiver?.navn?.trim()
    if (arbeidsgiverNavn) return arbeidsgiverNavn

    const orgnummer = sykmelding.sykmeldingStatus?.arbeidsgiver?.orgnummer
    if (orgnummer) return orgnummer

    const arbeidssituasjon = arbeidssituasjonForSykmelding(sykmelding)
    if (arbeidssituasjon) return arbeidssituasjonLabel(arbeidssituasjon)

    return 'Ukjent arbeidsgiver'
}

const dagNoklerForSykmelding = (sykmelding: Sykmelding): Set<string> => {
    const dagNokler = new Set<string>()

    sykmelding.sykmeldingsperioder.forEach((periode) => {
        const fom = datostrengTilUtcDato(periode.fom)
        const tom = datostrengTilUtcDato(periode.tom)

        if (!fom || !tom || tom < fom) return

        const dag = new Date(fom.getTime())
        while (dag <= tom) {
            dagNokler.add(dag.toISOString().slice(0, 10))
            dag.setUTCDate(dag.getUTCDate() + 1)
        }
    })

    return dagNokler
}

const harOverlappendeDag = (eksisterende: Set<string>, kandidat: Set<string>): boolean => {
    for (const dagNokkel of kandidat) {
        if (eksisterende.has(dagNokkel)) return true
    }
    return false
}

const grupperSykmeldingerPaArbeidsgiver = (sykmeldinger: Sykmelding[]): Map<string, SykmeldingerPerArbeidsgiver> => {
    const sykmeldingerGruppertPaArbeidsgiver = new Map<string, SykmeldingerPerArbeidsgiver>()

    sykmeldinger
        .slice()
        .sort((a, b) => a.mottattTidspunkt.localeCompare(b.mottattTidspunkt))
        .forEach((sykmelding) => {
            const arbeidsgiverId = arbeidsgiverIdForSykmelding(sykmelding)
            const arbeidsgiverNavn = arbeidsgiverNavnForSykmelding(sykmelding)
            const dagNokler = dagNoklerForSykmelding(sykmelding)

            let arbeidsgiverIndex = 0
            let grupperingId = arbeidsgiverId
            let sykmeldingBleLagtTil = false

            while (!sykmeldingBleLagtTil) {
                const eksisterendeArbeidsgiver = sykmeldingerGruppertPaArbeidsgiver.get(grupperingId)

                if (!eksisterendeArbeidsgiver) {
                    sykmeldingerGruppertPaArbeidsgiver.set(grupperingId, {
                        navn: arbeidsgiverNavn,
                        sykmeldinger: [sykmelding],
                        dagNokler: new Set(dagNokler),
                    })
                    sykmeldingBleLagtTil = true
                    continue
                }

                if (harOverlappendeDag(eksisterendeArbeidsgiver.dagNokler, dagNokler)) {
                    arbeidsgiverIndex += 1
                    grupperingId = `${arbeidsgiverId}(${arbeidsgiverIndex})`
                    continue
                }

                eksisterendeArbeidsgiver.sykmeldinger.push(sykmelding)
                dagNokler.forEach((dagNokkel) => eksisterendeArbeidsgiver.dagNokler.add(dagNokkel))
                sykmeldingBleLagtTil = true
            }
        })

    return sykmeldingerGruppertPaArbeidsgiver
}

const perioderMedDatoer = (sykmelding: Sykmelding): PeriodeMedDatoer[] => {
    return sykmelding.sykmeldingsperioder.flatMap((periode) => {
        const startDato = datostrengTilUtcDato(periode.fom)
        const sluttDato = datostrengTilUtcDato(periode.tom)

        if (!startDato || !sluttDato) return []

        return [{ fom: periode.fom, tom: periode.tom, startDato, sluttDato }]
    })
}

interface TidslinjeSykmeldingerProps {
    sykmeldinger: Sykmelding[]
    filter: Filter[]
    setFilter: React.Dispatch<React.SetStateAction<Filter[]>>
}
const TidslinjeSykmeldinger = ({ sykmeldinger, filter, setFilter }: TidslinjeSykmeldingerProps) => {
    const gyldigeSykmeldinger = validerSykmeldingsDatoer(sykmeldinger)
    const filtrerteSykmeldinger = filtrerPaFilter(gyldigeSykmeldinger, filter)
    const datospenn = hentDatospenn(filtrerteSykmeldinger)
    const sykmeldingerGruppertPaArbeidsgiver = grupperSykmeldingerPaArbeidsgiver(filtrerteSykmeldinger)

    if (filtrerteSykmeldinger.length === 0 || !datospenn) return <Fragment />

    return (
        <div className="min-w-[800px] min-h-[2000px] overflow-x-auto">
            <BodyShort className="mb-2 font-semibold">{`${filtrerteSykmeldinger.length} sykmelding(er)`}</BodyShort>

            <Timeline key={datospenn.sluttDato.toISOString()}>
                {Array.from(sykmeldingerGruppertPaArbeidsgiver.entries()).map(([arbeidsgiverId, arbeidsgiver]) => {
                    const label = arbeidsgiverId.includes('(') ? `${arbeidsgiver.navn} (overlapp)` : arbeidsgiver.navn

                    return (
                        <Timeline.Row key={arbeidsgiverId} label={label}>
                            {arbeidsgiver.sykmeldinger.flatMap((sykmelding) => {
                                const status = sykmeldingStatus(sykmelding.sykmeldingStatus?.statusEvent)

                                return perioderMedDatoer(sykmelding).map((periode, idx) => {
                                    return (
                                        <Timeline.Period
                                            start={periode.startDato}
                                            end={periode.sluttDato}
                                            status={status}
                                            key={`${sykmelding.id}-${idx}-${periode.fom}-${periode.tom}`}
                                        >
                                            <Detaljer objekt={sykmelding} filter={filter} setFilter={setFilter} />
                                        </Timeline.Period>
                                    )
                                })
                            })}
                        </Timeline.Row>
                    )
                })}
                <Timeline.Zoom>
                    <Timeline.Zoom.Button label="3 mnd" interval="month" count={3} />
                    <Timeline.Zoom.Button label="7 mnd" interval="month" count={7} />
                    <Timeline.Zoom.Button label="9 mnd" interval="month" count={9} />
                    <Timeline.Zoom.Button label="2 år" interval="year" count={2} />
                </Timeline.Zoom>
            </Timeline>
        </div>
    )
}

export default TidslinjeSykmeldinger
