import { differenceInCalendarDays, getYear, isValid, startOfDay } from 'date-fns'

import type { Sykmelding } from '../queryhooks/useSykmeldinger'

const MIN_AAR = 1900
const MAKS_AAR = 2100
const MAKS_DAGER_I_PERIODE = 3660
const MAKS_DAGER_I_TIDSLINJE = 20000

export type UgyldigPeriodeArsak =
    'mangler-fom-eller-tom' | 'ugyldig-datoformat' | 'aar-utenfor-grenser' | 'for-lang-eller-negativ-periode'

export const finnUgyldigPeriodeArsak = (periode?: { fom?: Date; tom?: Date }): UgyldigPeriodeArsak | null => {
    if (!periode?.fom || !periode?.tom) return 'mangler-fom-eller-tom'

    if (!isValid(periode.fom) || !isValid(periode.tom)) return 'ugyldig-datoformat'

    const fom = startOfDay(periode.fom)
    const tom = startOfDay(periode.tom)

    const harGyldigAar =
        getYear(fom) >= MIN_AAR && getYear(fom) <= MAKS_AAR && getYear(tom) >= MIN_AAR && getYear(tom) <= MAKS_AAR

    if (!harGyldigAar) return 'aar-utenfor-grenser'

    // differenceInCalendarDays regner i hele kalenderdager (Oslo-dato), ikke rå millisekunder.
    // Det holder tellingen korrekt over sommertid-overganger der ett døgn kun har 23 eller 25 timer.
    const dagerMellom = differenceInCalendarDays(tom, fom)
    const harGyldigVarighet = dagerMellom >= 0 && dagerMellom <= MAKS_DAGER_I_PERIODE

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

    const harUgyldigPeriode = perioder.some((periode) => !isValid(periode.fom) || !isValid(periode.tom))
    if (harUgyldigPeriode) return null

    const fomDatoer = perioder.map((periode) => periode.fom).filter((dato) => isValid(dato))
    const tomDatoer = perioder.map((periode) => periode.tom).filter((dato) => isValid(dato))

    if (fomDatoer.length === 0 || tomDatoer.length === 0) return null

    const startDato = new Date(Math.min(...fomDatoer.map((dato) => dato.getTime())))
    const sluttDato = new Date(Math.max(...tomDatoer.map((dato) => dato.getTime())))

    // differenceInCalendarDays regner i hele kalenderdager (Oslo-dato), ikke rå millisekunder.
    const antallDager = differenceInCalendarDays(sluttDato, startDato)

    const harGyldigSpenn = antallDager >= 0 && antallDager <= MAKS_DAGER_I_TIDSLINJE
    if (!harGyldigSpenn) return null

    return { startDato, sluttDato }
}
