import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { fetchJsonMedRequestId } from '../utils/fetch'

export function useSykmeldinger(fnr: string | undefined, enabled = true): UseQueryResult<Sykmelding[], Error> {
    return useQuery<Sykmelding[], Error>({
        queryKey: ['sykmeldinger', fnr],
        enabled: enabled,
        queryFn: () => {
            if (fnr === undefined) {
                return []
            }
            return fetchJsonMedRequestId<Sykmelding[]>('/api/flex-sykmeldinger-backend/api/v1/flex/sykmeldinger', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fnr }),
            })
        },
    })
}

export interface Sykmelding {
    id: string
    pasient: Pasient
    mottattTidspunkt: string
    behandlingsutfall: Behandlingsutfall
    legekontorOrgnummer: string | null
    arbeidsgiver: Arbeidsgiver
    sykmeldingsperioder: Sykmeldingsperiode[]
    sykmeldingStatus: SykmeldingStatus
    medisinskVurdering: MedisinskVurdering | null
    skjermesForPasient: boolean
    prognose: Prognose | null
    utdypendeOpplysninger: Record<string, Record<string, SporsmalSvar>>
    tiltakArbeidsplassen: string | null
    tiltakNAV: string | null
    andreTiltak: string | null
    meldingTilNAV: MeldingTilNAV | null
    meldingTilArbeidsgiver: string | null
    kontaktMedPasient: KontaktMedPasient
    behandletTidspunkt: string
    behandler: Behandler | null
    syketilfelleStartDato: string | null
    navnFastlege: string | null
    egenmeldt: boolean
    papirsykmelding: boolean
    harRedusertArbeidsgiverperiode: boolean
    merknader: Merknad[] | null
    rulesetVersion: string | null
    utenlandskSykmelding: UtenlandskSykmelding | null
}

export interface Pasient {
    fnr: string | null
    fornavn: string | null
    mellomnavn: string | null
    etternavn: string | null
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

export interface MedisinskVurdering {
    hovedDiagnose: Diagnose | null
    biDiagnoser: Diagnose[]
    annenFraversArsak: AnnenFraversArsak | null
    svangerskap: boolean
    yrkesskade: boolean
    yrkesskadeDato: string | null
}

export interface Diagnose {
    kode: string
    system: string
    tekst: string | null
}

export interface AnnenFraversArsak {
    beskrivelse: string | null
    grunn: string[]
}

export interface Prognose {
    arbeidsforEtterPeriode: boolean
    hensynArbeidsplassen: string | null
    erIArbeid: ErIArbeid | null
    erIkkeIArbeid: ErIkkeIArbeid | null
}

export interface ErIArbeid {
    egetArbeidPaSikt: boolean
    annetArbeidPaSikt: boolean
    arbeidFOM: string | null
    vurderingsdato: string | null
}

export interface ErIkkeIArbeid {
    arbeidsforPaSikt: boolean
    arbeidsforFOM: string | null
    vurderingsdato: string | null
}

export interface SporsmalSvar {
    sporsmal: string | null
    svar: string
    restriksjoner: string[]
}

export interface MeldingTilNAV {
    bistandUmiddelbart: boolean
    beskrivBistand: string | null
}

export interface KontaktMedPasient {
    kontaktDato: string | null
    begrunnelseIkkeKontakt: string | null
}

export interface Behandler {
    fornavn: string
    mellomnavn: string | null
    etternavn: string
    adresse: Adresse
    tlf: string | null
}

export interface Adresse {
    gate: string | null
    postnummer: number | null
    kommune: string | null
    postboks: string | null
    land: string | null
}

export interface Merknad {
    type: string
    beskrivelse: string | null
}

export interface UtenlandskSykmelding {
    land: string
}
