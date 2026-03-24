import React, { Fragment } from 'react'
import { BodyShort, Timeline } from '@navikt/ds-react'

import { Sykmelding, SykmeldingStatusType } from '../../queryhooks/useSykmeldinger'
import { dagerMellomUtcDatoer, datostrengTilUtcDato } from '../../utils/dato'
import { filtrerPaFilter } from '../../utils/filterlogikk'
import { Detaljer } from '../Detaljer'
import { Filter } from '../Filter'

const sykmeldingStatus = (status?: SykmeldingStatusType): 'success' | 'warning' | 'info' => {
    if (!status) return 'info'
    if (['SENDT', 'BEKREFTET'].includes(status)) return 'success'
    if (['AVVIST', 'UTGATT', 'AVBRUTT'].includes(status)) return 'warning'
    return 'info'
}

const MIN_AAR = 1900
const MAKS_AAR = 2100
const MAKS_DAGER_I_PERIODE = 3660
const MAKS_DAGER_I_TIDSLINJE = 20000

type Visningsintervall = '3-mnd' | '7-mnd' | '9-mnd' | '2-ar'

type UgyldigPeriodeArsak =
    | 'mangler-fom-eller-tom'
    | 'ugyldig-datoformat'
    | 'aar-utenfor-grenser'
    | 'for-lang-eller-negativ-periode'

interface SykmeldingerPerArbeidsgiver {
    navn: string
    sykmeldinger: Sykmelding[]
    dagNokler: Set<string>
}

const finnUgyldigPeriodeArsak = (periode?: { fom?: string; tom?: string }): UgyldigPeriodeArsak | null => {
    if (!periode?.fom || !periode?.tom) return 'mangler-fom-eller-tom'

    const fom = datostrengTilUtcDato(periode.fom)
    const tom = datostrengTilUtcDato(periode.tom)

    if (!fom || !tom) return 'ugyldig-datoformat'

    const harGyldigAar =
        fom.getUTCFullYear() >= MIN_AAR &&
        fom.getUTCFullYear() <= MAKS_AAR &&
        tom.getUTCFullYear() >= MIN_AAR &&
        tom.getUTCFullYear() <= MAKS_AAR

    if (!harGyldigAar) return 'aar-utenfor-grenser'

    const dagerMellom = dagerMellomUtcDatoer(fom, tom)
    const harGyldigVarighet = Number.isInteger(dagerMellom) && dagerMellom >= 0 && dagerMellom <= MAKS_DAGER_I_PERIODE

    if (!harGyldigVarighet) return 'for-lang-eller-negativ-periode'

    return null
}

const hentDatospenn = (sykmeldinger: Sykmelding[]) => {
    const perioder = sykmeldinger.flatMap((sykmelding) => sykmelding.sykmeldingsperioder)

    if (perioder.length === 0) return null

    const fomDatoer = perioder.map((periode) => datostrengTilUtcDato(periode.fom))
    const tomDatoer = perioder.map((periode) => datostrengTilUtcDato(periode.tom))

    if (fomDatoer.some((dato) => !dato) || tomDatoer.some((dato) => !dato)) return null

    const gyldigeFomDatoer = fomDatoer.filter((dato): dato is Date => dato !== null)
    const gyldigeTomDatoer = tomDatoer.filter((dato): dato is Date => dato !== null)

    const startTid = Math.min(...gyldigeFomDatoer.map((dato) => dato.getTime()))
    const sluttTid = Math.max(...gyldigeTomDatoer.map((dato) => dato.getTime()))
    const startDato = new Date(startTid)
    const sluttDato = new Date(sluttTid)
    const antallDager = dagerMellomUtcDatoer(startDato, sluttDato)

    const harGyldigSpenn = Number.isInteger(antallDager) && antallDager >= 0 && antallDager <= MAKS_DAGER_I_TIDSLINJE
    if (!harGyldigSpenn) return null

    return { startDato, sluttDato }
}

const trekkFraMaanederUtc = (dato: Date, maneder: number): Date => {
    const nesteDato = new Date(dato.getTime())
    nesteDato.setUTCMonth(nesteDato.getUTCMonth() - maneder)
    return nesteDato
}

const trekkFraAarUtc = (dato: Date, aar: number): Date => {
    const nesteDato = new Date(dato.getTime())
    nesteDato.setUTCFullYear(nesteDato.getUTCFullYear() - aar)
    return nesteDato
}

const startDatoForIntervall = (sluttDato: Date, intervall: Visningsintervall): Date => {
    if (intervall === '3-mnd') return trekkFraMaanederUtc(sluttDato, 3)
    if (intervall === '7-mnd') return trekkFraMaanederUtc(sluttDato, 7)
    if (intervall === '9-mnd') return trekkFraMaanederUtc(sluttDato, 9)
    return trekkFraAarUtc(sluttDato, 2)
}

const validerSykmeldingsDatoer = (sykmeldinger: Sykmelding[]): Sykmelding[] => {
    return sykmeldinger.filter((sykmelding) => {
        if (!Array.isArray(sykmelding.sykmeldingsperioder) || sykmelding.sykmeldingsperioder.length === 0) {
            return false
        }

        return sykmelding.sykmeldingsperioder.every((periode) => finnUgyldigPeriodeArsak(periode) === null)
    })
}

const filtrerGyldigeSykmeldinger = (sykmeldinger: Sykmelding[]): Sykmelding[] => {
    return sykmeldinger.filter((s) => s?.id && Array.isArray(s.sykmeldingsperioder) && s.sykmeldingsperioder.length > 0)
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

interface TidslinjeSykmeldingerProps {
    sykmeldinger: Sykmelding[]
    filter: Filter[]
    setFilter: React.Dispatch<React.SetStateAction<Filter[]>>
}
const TidslinjeSykmeldinger = ({ sykmeldinger, filter, setFilter }: TidslinjeSykmeldingerProps) => {
    const sykmeldingsliste = Array.isArray(sykmeldinger) ? sykmeldinger : []
    const gyldigeSykmeldinger = filtrerGyldigeSykmeldinger(validerSykmeldingsDatoer(sykmeldingsliste))
    const filtrerteSykmeldinger = filtrerPaFilter(gyldigeSykmeldinger, filter)
    const datospenn = hentDatospenn(filtrerteSykmeldinger)
    const valgtIntervall: Visningsintervall = '9-mnd'
    const sykmeldingerGruppertPaArbeidsgiver = grupperSykmeldingerPaArbeidsgiver(filtrerteSykmeldinger)

    const visningsstartDato = !datospenn ? null : startDatoForIntervall(datospenn.sluttDato, valgtIntervall)

    if (filtrerteSykmeldinger.length === 0 || !datospenn || !visningsstartDato) return <Fragment />

    return (
        <div className="min-w-[800px] min-h-[2000px] overflow-x-auto">
            <BodyShort className="mb-2 font-semibold">{`${filtrerteSykmeldinger.length} sykmelding(er)`}</BodyShort>

            <Timeline key={`${valgtIntervall}-${datospenn.sluttDato.toISOString()}`}>
                {Array.from(sykmeldingerGruppertPaArbeidsgiver.entries()).map(([arbeidsgiverId, arbeidsgiver]) => {
                    const label = arbeidsgiverId.includes('(') ? `${arbeidsgiver.navn} (overlapp)` : arbeidsgiver.navn

                    return (
                        <Timeline.Row key={arbeidsgiverId} label={label}>
                            {arbeidsgiver.sykmeldinger.flatMap((sykmelding) => {
                                const status = sykmeldingStatus(sykmelding.sykmeldingStatus?.statusEvent)

                                return sykmelding.sykmeldingsperioder.map((periode, idx) => {
                                    const startDato = datostrengTilUtcDato(periode.fom)
                                    const sluttDato = datostrengTilUtcDato(periode.tom)

                                    if (!startDato || !sluttDato || sluttDato < startDato) {
                                        return <Fragment key={`${sykmelding.id}-${idx}`} />
                                    }

                                    return (
                                        <Timeline.Period
                                            start={startDato}
                                            end={sluttDato}
                                            status={status}
                                            key={`${sykmelding.id}-${idx}-${startDato.toISOString()}-${sluttDato.toISOString()}`}
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
