import { Dayjs } from 'dayjs'

import type { Sykmelding } from '../queryhooks/useSykmeldinger'

const MIN_AAR = 1900
const MAKS_AAR = 2100
const MAKS_DAGER_I_PERIODE = 3660
const MAKS_DAGER_I_TIDSLINJE = 20000
const MILLISEKUNDER_PER_DAG = 24 * 60 * 60 * 1000

const utcTidForDato = (dato: Dayjs): number => Date.UTC(dato.year(), dato.month(), dato.date())

export type UgyldigPeriodeArsak =
    | 'mangler-fom-eller-tom'
    | 'ugyldig-datoformat'
    | 'aar-utenfor-grenser'
    | 'for-lang-eller-negativ-periode'

export const finnUgyldigPeriodeArsak = (periode?: { fom?: Dayjs; tom?: Dayjs }): UgyldigPeriodeArsak | null => {
    if (!periode?.fom || !periode?.tom) return 'mangler-fom-eller-tom'

    const fom = periode.fom.startOf('day')
    const tom = periode.tom.startOf('day')

    if (!fom.isValid() || !tom.isValid()) return 'ugyldig-datoformat'

    const harGyldigAar =
        fom.year() >= MIN_AAR && fom.year() <= MAKS_AAR && tom.year() >= MIN_AAR && tom.year() <= MAKS_AAR

    if (!harGyldigAar) return 'aar-utenfor-grenser'

    const dagerMellom = Math.floor((utcTidForDato(tom) - utcTidForDato(fom)) / MILLISEKUNDER_PER_DAG)
    const harGyldigVarighet = Number.isInteger(dagerMellom) && dagerMellom >= 0 && dagerMellom <= MAKS_DAGER_I_PERIODE

    if (!harGyldigVarighet) return 'for-lang-eller-negativ-periode'

    return null
}

export const validerSykmeldingsDatoer = (sykmeldinger: Sykmelding[]): Sykmelding[] => {
    return sykmeldinger.filter((sykmelding) => {
        if (!sykmelding?.id?.trim()) return false
        if (!Array.isArray(sykmelding.sykmeldingsperioder) || sykmelding.sykmeldingsperioder.length === 0) return false

        return sykmelding.sykmeldingsperioder.every((periode) => finnUgyldigPeriodeArsak(periode) === null)
    })
}

export const hentDatospenn = (sykmeldinger: Sykmelding[]) => {
    const perioder = sykmeldinger.flatMap((sykmelding) => sykmelding.sykmeldingsperioder)

    if (perioder.length === 0) return null

    const harUgyldigPeriode = perioder.some((periode) => !periode.fom.isValid() || !periode.tom.isValid())
    if (harUgyldigPeriode) return null

    const fomDatoer = perioder.map((periode) => periode.fom).filter((dato) => dato.isValid())
    const tomDatoer = perioder.map((periode) => periode.tom).filter((dato) => dato.isValid())

    if (fomDatoer.length === 0 || tomDatoer.length === 0) return null

    const startTid = Math.min(...fomDatoer.map((dato) => utcTidForDato(dato)))
    const sluttTid = Math.max(...tomDatoer.map((dato) => utcTidForDato(dato)))
    const startDato = new Date(startTid)
    const sluttDato = new Date(sluttTid)
    const antallDager = Math.floor((sluttTid - startTid) / MILLISEKUNDER_PER_DAG)

    const harGyldigSpenn = Number.isInteger(antallDager) && antallDager >= 0 && antallDager <= MAKS_DAGER_I_TIDSLINJE
    if (!harGyldigSpenn) return null

    return { startDato, sluttDato }
}
