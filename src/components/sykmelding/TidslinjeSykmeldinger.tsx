import React, { Fragment, useState } from 'react'
import { BodyShort, Button, HStack, Timeline } from '@navikt/ds-react'

import { Sykmelding, SykmeldingStatusType } from '../../queryhooks/useSykmeldinger'
import { dagerMellomUtcDatoer, datostrengTilUtcDato } from '../../utils/dato'
import { dayjsToDate } from '../../queryhooks/useSoknader'
import { SoknadDetaljer, timelinePeriodeStatus } from '../Tidslinje'

import TidslinjeErrorBoundary from './TidslinjeErrorBoundary'
import SykmeldingDetaljer from './SykmeldingDetaljer'

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

const visningsintervaller: { verdi: Visningsintervall; etikett: string }[] = [
    { verdi: '3-mnd', etikett: '3 mnd' },
    { verdi: '7-mnd', etikett: '7 mnd' },
    { verdi: '9-mnd', etikett: '9 mnd' },
    { verdi: '2-ar', etikett: '2 år' },
]

type UgyldigPeriodeArsak =
    | 'mangler-fom-eller-tom'
    | 'ugyldig-datoformat'
    | 'aar-utenfor-grenser'
    | 'for-lang-eller-negativ-periode'

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

const TidslinjeSykmeldinger = ({ sykmeldinger }: { sykmeldinger: Sykmelding[] }) => {
    const sykmeldingsliste = Array.isArray(sykmeldinger) ? sykmeldinger : []
    const gyldigeSykmeldinger = filtrerGyldigeSykmeldinger(validerSykmeldingsDatoer(sykmeldingsliste))
    const datospenn = hentDatospenn(gyldigeSykmeldinger)
    const [valgtIntervall, setValgtIntervall] = useState<Visningsintervall>('9-mnd')

    const visningsstartDato = !datospenn ? null : startDatoForIntervall(datospenn.sluttDato, valgtIntervall)

    if (gyldigeSykmeldinger.length === 0 || !datospenn || !visningsstartDato) return <Fragment />

    return (
        <div className="min-w-[800px] overflow-x-auto">
            <BodyShort className="mb-2 font-semibold">{`${gyldigeSykmeldinger.length} sykmelding(er)`}</BodyShort>

            <Timeline key={`${valgtIntervall}-${datospenn.sluttDato.toISOString()}`}>
                {gyldigeSykmeldinger.map((sykmelding) => {
                    const status = sykmeldingStatus(sykmelding.sykmeldingStatus?.statusEvent)

                    return (
                        <Timeline.Row
                            key={sykmelding.id}
                            label={sykmelding.arbeidsgiver?.navn ?? 'Ukjent arbeidsgiver'}
                        >
                            {sykmelding.sykmeldingsperioder.map((periode, idx) => {
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
                                        key={startDato.toString()}
                                    >
                                        <SykmeldingDetaljer sykmelding={sykmelding} />
                                    </Timeline.Period>
                                )
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
