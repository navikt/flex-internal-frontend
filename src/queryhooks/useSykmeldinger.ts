import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { fetchJsonMedRequestId } from '../utils/fetch'

interface SykmeldingerResponse {
    sykmeldinger: Sykmelding[]
}

export function useSykmeldinger(fnr: string | undefined, enabled = true): UseQueryResult<Sykmelding[], Error> {
    return useQuery<Sykmelding[], Error>({
        queryKey: ['sykmeldinger', fnr],
        enabled: enabled,
        queryFn: () => {
            if (fnr === undefined) {
                return []
            }
            return fetchJsonMedRequestId<SykmeldingerResponse>(
                '/api/flex-sykmeldinger-backend/api/v1/flex/sykmeldinger',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fnr }),
                },
            ).then((data) => data.sykmeldinger)
        },
    })
}

export interface Sykmelding {
    arbeidsgiver: Arbeidsgiver
    behandletTidspunkt: string
    behandlingsutfall: Behandlingsutfall
    egenmeldt: boolean
    harRedusertArbeidsgiverperiode: boolean
    id: string
    kontaktMedPasient: KontaktMedPasient
    merknader: Merknad[] | null
    mottattTidspunkt: string
    papirsykmelding: boolean
    pasient: Pasient
    signaturDato: string | null
    skjermesForPasient: boolean
    syketilfelleStartDato: string | null
    sykmeldingStatus: SykmeldingStatus
    sykmeldingsperioder: Sykmeldingsperiode[]
    utenlandskSykmelding: UtenlandskSykmelding | null
}

export interface Pasient {
    fnr: string | null
    overSyttiAar: boolean | null
}

export interface Behandlingsutfall {
    status: RegelStatus
    ruleHits: Regelinfo[]
    erUnderBehandling: boolean
}

export type RegelStatus = 'OK' | 'MANUAL_PROCESSING' | 'INVALID'

export interface Regelinfo {
    messageForSender: string
    messageForUser: string
    ruleName: string
    ruleStatus: RegelStatus | null
}

export interface Arbeidsgiver {
    navn: string | null
    stillingsprosent: number | null
}

export interface Sykmeldingsperiode {
    fom: string
    tom: string
    gradert: GradertPeriode | null
    behandlingsdager: number | null
    innspillTilArbeidsgiver: string | null
    type: Periodetype
    aktivitetIkkeMulig: AktivitetIkkeMulig | null
    reisetilskudd: boolean
}

export type Periodetype = 'AKTIVITET_IKKE_MULIG' | 'AVVENTENDE' | 'BEHANDLINGSDAGER' | 'GRADERT' | 'REISETILSKUDD'

export interface GradertPeriode {
    grad: number
    reisetilskudd: boolean
}

export interface AktivitetIkkeMulig {
    medisinskArsak: MedisinskArsak | null
    arbeidsrelatertArsak: ArbeidsrelatertArsak | null
}

export interface MedisinskArsak {
    beskrivelse: string | null
    arsak: string[]
}

export interface ArbeidsrelatertArsak {
    beskrivelse: string | null
    arsak: string[]
}

export interface SykmeldingStatus {
    statusEvent: SykmeldingStatusType
    timestamp: string
    arbeidsgiver: ArbeidsgiverStatus | null
    brukerSvar: BrukerSvar | null
}

export type SykmeldingStatusType = 'NY' | 'APEN' | 'SENDT' | 'AVVIST' | 'UTGATT' | 'BEKREFTET' | 'AVBRUTT'

export interface ArbeidsgiverStatus {
    orgnummer: string
    juridiskOrgnummer: string | null
    orgNavn: string
}

export interface BrukerSvar {
    erOpplysningeneRiktige: FormSporsmalSvar<string> | null
    arbeidssituasjon: FormSporsmalSvar<string> | null
    uriktigeOpplysninger: FormSporsmalSvar<string[]> | null
    arbeidsgiverOrgnummer: FormSporsmalSvar<string> | null
    arbeidsledig: unknown | null
    riktigNarmesteLeder: FormSporsmalSvar<string> | null
    harBruktEgenmelding: FormSporsmalSvar<string> | null
    egenmeldingsperioder: FormSporsmalSvar<unknown[]> | null
    harForsikring: FormSporsmalSvar<string> | null
    egenmeldingsdager: FormSporsmalSvar<string[]> | null
    harBruktEgenmeldingsdager: FormSporsmalSvar<string> | null
    fisker: unknown | null
}

export interface FormSporsmalSvar<T> {
    sporsmaltekst: string
    svar: T
}

export interface KontaktMedPasient {
    kontaktDato: string | null
    begrunnelseIkkeKontakt: string | null
}

export interface Merknad {
    type: string
    beskrivelse: string | null
}

export interface UtenlandskSykmelding {
    land: string
}
