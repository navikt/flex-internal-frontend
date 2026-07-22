export interface SoknaderResponse {
    sykepengesoknadListe: Soknad[]
    klippetSykepengesoknadRecord: KlippetSykepengesoknadRecord[]
}

export interface KlippetSykepengesoknadRecord {
    id: string
    sykepengesoknadUuid: string
    sykmeldingUuid: string
    klippVariant: KlippVariant
    periodeFor: Soknadsperiode[] | string
    periodeEtter: Soknadsperiode[] | string | null
    timestamp?: string
}

export interface Soknad {
    id: string
    sykmeldingId?: string
    soknadstype: Soknadstype
    status: Soknadstatus
    arbeidssituasjon?: Arbeidssituasjon
    fom?: string
    tom?: string
    korrigerer?: string
    korrigertAv?: string
    avbruttDato?: string
    sykmeldingUtskrevet?: string
    sykmeldingSignaturDato?: string
    startSykeforlop?: string
    opprettetDato?: string
    sendtTilNAVDato?: string
    sendtTilArbeidsgiverDato?: string
    arbeidsgiverNavn?: string
    arbeidsgiverOrgnummer?: string
    soknadPerioder: Soknadsperiode[]
    merknaderFraSykmelding?: Merknad[]
    ventetidSykmeldingUuid?: string
    meldingTilNavDagerFraSykmelding?: Periode[]
}

export type KlippVariant =
    | 'SOKNAD_STARTER_FOR_SLUTTER_INNI'
    | 'SOKNAD_STARTER_INNI_SLUTTER_ETTER'
    | 'SOKNAD_STARTER_FOR_SLUTTER_ETTER'
    | 'SOKNAD_STARTER_INNI_SLUTTER_INNI'
    | 'SYKMELDING_STARTER_FOR_SLUTTER_INNI'
    | 'SYKMELDING_STARTER_INNI_SLUTTER_ETTER'
    | 'SYKMELDING_STARTER_INNI_SLUTTER_INNI'
    | 'SYKMELDING_STARTER_FOR_SLUTTER_ETTE'

export type Soknadstype =
    | 'SELVSTENDIGE_OG_FRILANSERE'
    | 'OPPHOLD_UTLAND'
    | 'ARBEIDSTAKERE'
    | 'ARBEIDSLEDIG'
    | 'BEHANDLINGSDAGER'
    | 'ANNET_ARBEIDSFORHOLD'
    | 'REISETILSKUDD'
    | 'GRADERT_REISETILSKUDD'
    | 'FRISKMELDT_TIL_ARBEIDSFORMIDLING'

export type Soknadstatus =
    'NY' | 'SENDT' | 'FREMTIDIG' | 'UTKAST_TIL_KORRIGERING' | 'KORRIGERT' | 'AVBRUTT' | 'SLETTET' | 'UTGAATT'

export type Arbeidssituasjon = 'NAERINGSDRIVENDE' | 'FRILANSER' | 'ARBEIDSTAKER' | 'ARBEIDSLEDIG' | 'ANNET'

export interface Soknadsperiode {
    fom: string
    tom: string
    grad: number
    sykmeldingstype: string
}

export interface Merknad {
    type: string
    beskrivelse?: string
}

export interface Periode {
    fom: string
    tom: string
}
