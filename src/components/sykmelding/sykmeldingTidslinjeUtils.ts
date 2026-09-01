import { addDays, differenceInCalendarDays, format, isAfter, isBefore, isValid, startOfDay } from 'date-fns'

import type { Sykmelding, SykmeldingStatusType } from '../../queryhooks/useSykmeldinger'

export interface SykmeldingerPerArbeidsgiver {
    label: string
    sykmeldinger: Sykmelding[]
    dagNokler: Set<string>
}

export interface PeriodeMedDatoer {
    fom: string
    tom: string
    startDato: Date
    sluttDato: Date
}

/** Bygger en UTC-midnatt-forankret kalenderdato fra en Oslo-forankret Date (f.eks. fra toDate/toDatePaakrevd). */
const tilUtcKalenderdato = (dato: Date): Date => new Date(Date.UTC(dato.getFullYear(), dato.getMonth(), dato.getDate()))

export const sykmeldingStatus = (status?: SykmeldingStatusType): 'success' | 'warning' | 'info' => {
    if (!status) return 'info'
    if (['SENDT', 'BEKREFTET'].includes(status)) return 'success'
    if (['AVVIST', 'UTGATT', 'AVBRUTT'].includes(status)) return 'warning'
    return 'info'
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
    const orgnummer = sykmelding.sykmeldingStatus?.arbeidsgiver?.orgnummer?.trim()
    if (orgnummer) return orgnummer

    const arbeidsgiverNavn = sykmelding.arbeidsgiver?.navn?.trim()
    if (arbeidsgiverNavn) return arbeidsgiverNavn

    const arbeidssituasjon = arbeidssituasjonForSykmelding(sykmelding)
    if (arbeidssituasjon) return arbeidssituasjonLabel(arbeidssituasjon)

    return 'Ukjent arbeidsgiver'
}

const dagNoklerForSykmelding = (sykmelding: Sykmelding): Set<string> => {
    const dagNokler = new Set<string>()

    sykmelding.sykmeldingsperioder.forEach((periode) => {
        const fom = startOfDay(periode.fom)
        const tom = startOfDay(periode.tom)

        if (!isValid(fom) || !isValid(tom) || isBefore(tom, fom)) return

        for (let dag = fom; !isAfter(dag, tom); dag = addDays(dag, 1)) {
            dagNokler.add(format(dag, 'yyyy-MM-dd'))
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

export const grupperSykmeldingerPaArbeidsgiver = (
    sykmeldinger: Sykmelding[],
): Map<string, SykmeldingerPerArbeidsgiver> => {
    const sykmeldingerGruppertPaArbeidsgiver = new Map<string, SykmeldingerPerArbeidsgiver>()

    sykmeldinger
        .slice()
        .sort((a, b) => a.mottattTidspunkt.valueOf() - b.mottattTidspunkt.valueOf())
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
                    const arbeidsgiverLabel =
                        arbeidsgiverIndex > 0 ? `${arbeidsgiverNavn} (overlapp)` : arbeidsgiverNavn

                    sykmeldingerGruppertPaArbeidsgiver.set(grupperingId, {
                        label: arbeidsgiverLabel,
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

export const perioderMedDatoer = (sykmelding: Sykmelding): PeriodeMedDatoer[] => {
    return sykmelding.sykmeldingsperioder.flatMap((periode) => {
        if (!isValid(periode.fom) || !isValid(periode.tom)) return []
        return [
            {
                fom: format(periode.fom, 'yyyy-MM-dd'),
                tom: format(periode.tom, 'yyyy-MM-dd'),
                startDato: tilUtcKalenderdato(periode.fom),
                sluttDato: tilUtcKalenderdato(periode.tom),
            },
        ]
    })
}

export const sorterPerioder = (perioder: PeriodeMedDatoer[]): PeriodeMedDatoer[] => {
    return perioder.slice().sort((a, b) => a.startDato.getTime() - b.startDato.getTime())
}

export const formaterDato = (dato: Date): string =>
    new Intl.DateTimeFormat('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(dato)

export const formaterDatoMedTid = (dato: Date): string =>
    new Intl.DateTimeFormat('nb-NO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).format(dato)

export const antallKalenderdager = (fra: Date, til: Date): number => {
    return differenceInCalendarDays(til, fra) + 1
}
