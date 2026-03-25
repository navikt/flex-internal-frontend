import type { Sykmelding } from '../queryhooks/useSykmeldinger'

import { dagerMellomUtcDatoer, datostrengTilUtcDato } from './dato'

const MIN_AAR = 1900
const MAKS_AAR = 2100
const MAKS_DAGER_I_PERIODE = 3660
const MAKS_DAGER_I_TIDSLINJE = 20000

export type UgyldigPeriodeArsak =
    | 'mangler-fom-eller-tom'
    | 'ugyldig-datoformat'
    | 'aar-utenfor-grenser'
    | 'for-lang-eller-negativ-periode'

export const finnUgyldigPeriodeArsak = (periode?: { fom?: string; tom?: string }): UgyldigPeriodeArsak | null => {
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
