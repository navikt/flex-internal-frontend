import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { Dayjs } from 'dayjs'

import { fetchJsonMedRequestId } from '../utils/fetch'
import { tilDayjs, tilDayjsPaakrevd } from '../utils/dayjsValidering'

interface BackendSykmeldingerResponse {
    sykmeldinger: BackendSykmelding[]
}

export function useSykmeldinger(fnr: string | undefined, enabled = true): UseQueryResult<Sykmelding[], Error> {
    return useQuery<Sykmelding[], Error>({
        queryKey: ['sykmeldinger', fnr],
        enabled: enabled,
        queryFn: () => {
            if (fnr === undefined) {
                return []
            }
            return fetchJsonMedRequestId<BackendSykmeldingerResponse>(
                '/api/flex-sykmeldinger-backend/api/v1/flex/sykmeldinger',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fnr }),
                },
            ).then((data) => data.sykmeldinger.map(mapTilSykmelding))
        },
    })
}

export const mapTilSykmelding = (sykmelding: BackendSykmelding): Sykmelding => {
    return {
        ...sykmelding,
        mottattTidspunkt: tilDayjsPaakrevd(sykmelding.mottattTidspunkt, 'mottattTidspunkt'),
        behandletTidspunkt: tilDayjsPaakrevd(sykmelding.behandletTidspunkt, 'behandletTidspunkt'),
        syketilfelleStartDato: tilDayjs(sykmelding.syketilfelleStartDato, 'YYYY-MM-DD'),
        signaturDato: tilDayjs(sykmelding.signaturDato),
        kontaktMedPasient: {
            ...sykmelding.kontaktMedPasient,
            kontaktDato: tilDayjs(sykmelding.kontaktMedPasient?.kontaktDato, 'YYYY-MM-DD'),
        },
        sykmeldingStatus: {
            ...sykmelding.sykmeldingStatus,
            timestamp: tilDayjsPaakrevd(sykmelding.sykmeldingStatus.timestamp, 'sykmeldingStatus.timestamp'),
        },
        sykmeldingsperioder: sykmelding.sykmeldingsperioder.map((periode) => ({
            ...periode,
            fom: tilDayjsPaakrevd(periode.fom, 'sykmeldingsperioder.fom', 'YYYY-MM-DD'),
            tom: tilDayjsPaakrevd(periode.tom, 'sykmeldingsperioder.tom', 'YYYY-MM-DD'),
        })),
        hendelser: (sykmelding.hendelser ?? []).map((hendelse) => ({
            ...hendelse,
            hendelseOpprettet: tilDayjsPaakrevd(hendelse.hendelseOpprettet, 'hendelser.hendelseOpprettet'),
            lokaltOpprettet: tilDayjsPaakrevd(hendelse.lokaltOpprettet, 'hendelser.lokaltOpprettet'),
        })),
    }
}

export interface BackendSykmelding {
    arbeidsgiver: Arbeidsgiver
    behandletTidspunkt: string
    behandlingsutfall: Behandlingsutfall
    egenmeldt: boolean
    id: string
    kontaktMedPasient: BackendKontaktMedPasient
    merknader: Merknad[] | null
    mottattTidspunkt: string
    papirsykmelding: boolean
    pasient: Pasient
    signaturDato: string | null
    skjermesForPasient: boolean
    syketilfelleStartDato: string | null
    sykmeldingStatus: BackendSykmeldingStatus
    sykmeldingsperioder: BackendSykmeldingsperiode[]
    hendelser: BackendHendelse[]
    utenlandskSykmelding: UtenlandskSykmelding | null
}

export interface Sykmelding {
    arbeidsgiver: Arbeidsgiver
    behandletTidspunkt: Dayjs
    behandlingsutfall: Behandlingsutfall
    egenmeldt: boolean
    id: string
    kontaktMedPasient: KontaktMedPasient
    merknader: Merknad[] | null
    mottattTidspunkt: Dayjs
    papirsykmelding: boolean
    pasient: Pasient
    signaturDato?: Dayjs
    skjermesForPasient: boolean
    syketilfelleStartDato?: Dayjs
    sykmeldingStatus: SykmeldingStatus
    sykmeldingsperioder: Sykmeldingsperiode[]
    hendelser: Hendelse[]
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

export interface BackendSykmeldingsperiode {
    fom: string
    tom: string
    gradert: GradertPeriode | null
    behandlingsdager: number | null
    innspillTilArbeidsgiver: string | null
    type: Periodetype
    aktivitetIkkeMulig: AktivitetIkkeMulig | null
    reisetilskudd: boolean
}

export interface Sykmeldingsperiode {
    fom: Dayjs
    tom: Dayjs
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
    timestamp: Dayjs
    arbeidsgiver: ArbeidsgiverStatus | null
    brukerSvar: BrukerSvar | null
}

export interface BackendSykmeldingStatus {
    statusEvent: SykmeldingStatusType
    timestamp: string
    arbeidsgiver: ArbeidsgiverStatus | null
    brukerSvar: BrukerSvar | null
}

export type SykmeldingStatusType = 'NY' | 'APEN' | 'SENDT' | 'AVVIST' | 'UTGATT' | 'BEKREFTET' | 'AVBRUTT'

export type HendelseStatus =
    | 'APEN'
    | 'AVBRUTT'
    | 'SENDT_TIL_NAV'
    | 'SENDT_TIL_ARBEIDSGIVER'
    | 'BEKREFTET_AVVIST'
    | 'UTGATT'

export interface BackendHendelse {
    status: HendelseStatus
    brukerSvar: unknown | null
    tilleggsinfo: unknown | null
    source: string | null
    hendelseOpprettet: string
    lokaltOpprettet: string
}

export interface Hendelse {
    status: HendelseStatus
    brukerSvar: unknown | null
    tilleggsinfo: unknown | null
    source: string | null
    hendelseOpprettet: Dayjs
    lokaltOpprettet: Dayjs
}

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
    kontaktDato?: Dayjs
    begrunnelseIkkeKontakt: string | null
}

export interface BackendKontaktMedPasient {
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
