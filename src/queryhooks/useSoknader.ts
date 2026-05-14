import { useQuery, UseQueryResult } from '@tanstack/react-query'
import dayjs, { Dayjs } from 'dayjs'
import nb from 'dayjs/locale/nb'

import { fetchJsonMedRequestId } from '../utils/fetch'

dayjs.locale({
    ...nb,
    weekStart: 1,
})

export function useSoknader(fnr: string | undefined, enabled = true): UseQueryResult<SoknaderResponse, Error> {
    return useQuery<SoknaderResponse, Error>({
        queryKey: ['soknad', fnr],
        enabled: enabled,
        queryFn: () => {
            if (fnr === undefined) {
                return {
                    sykepengesoknadListe: [],
                    klippetSykepengesoknadRecord: [],
                }
            }
            return fetchJsonMedRequestId<BackendSoknaderResponse>(
                '/api/sykepengesoknad-backend/api/v1/flex/sykepengesoknader',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fnr: fnr }),
                },
            ).then((jsonResponse) => {
                const response: SoknaderResponse = {
                    sykepengesoknadListe: [],
                    klippetSykepengesoknadRecord: [],
                }
                jsonResponse.sykepengesoknadListe
                    .filter((soknad) => soknad.soknadstype !== 'OPPHOLD_UTLAND')
                    .map((soknad) => response.sykepengesoknadListe.push(new Soknad(soknad)))
                jsonResponse.klippetSykepengesoknadRecord.map((klipp) =>
                    response.klippetSykepengesoknadRecord.push(new KlippetSykepengesoknadRecord(klipp)),
                )
                return response
            })
        },
    })
}

interface SoknaderResponse {
    sykepengesoknadListe: Soknad[]
    klippetSykepengesoknadRecord: KlippetSykepengesoknadRecord[]
}

interface BackendSoknaderResponse {
    sykepengesoknadListe: BackendSoknad[]
    klippetSykepengesoknadRecord: BackendKlippetSykepengesoknadRecord[]
}

export interface BackendKlippetSykepengesoknadRecord {
    id: string
    sykepengesoknadUuid: string
    sykmeldingUuid: string
    klippVariant: KlippVariant
    periodeFor: BackendSoknadsperiode[] | string
    periodeEtter: BackendSoknadsperiode[] | string | null
    timestamp?: string
}

export class KlippetSykepengesoknadRecord {
    id: string
    sykepengesoknadUuid: string
    sykmeldingUuid: string
    klippVariant: KlippVariant
    periodeFor: Soknadsperiode[]
    periodeEtter: Soknadsperiode[] | null
    timestamp?: Dayjs

    constructor(json: BackendKlippetSykepengesoknadRecord) {
        this.id = json.id
        this.sykepengesoknadUuid = json.sykepengesoknadUuid
        this.sykmeldingUuid = json.sykmeldingUuid
        this.klippVariant = json.klippVariant
        const periodeFor = typeof json.periodeFor === 'string' ? JSON.parse(json.periodeFor) : json.periodeFor
        const periodeEtter = typeof json.periodeEtter === 'string' ? JSON.parse(json.periodeEtter) : json.periodeEtter
        this.periodeFor = mapTilSoknadsperioder(periodeFor)
        this.periodeEtter = periodeEtter === null ? null : mapTilSoknadsperioder(periodeEtter)
        this.timestamp = tilDayjs(json.timestamp)
    }
}

export interface BackendSoknad {
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
    soknadPerioder: BackendSoknadsperiode[]
    merknaderFraSykmelding?: Merknad[]
    ventetidSykmeldingUuid?: string
    meldingTilNavDagerFraSykmelding?: BackendPeriode[]
}

export class Soknad {
    id: string
    sykmeldingId?: string
    soknadstype: Soknadstype
    status: Soknadstatus
    arbeidssituasjon?: Arbeidssituasjon
    fom?: Dayjs
    tom?: Dayjs
    korrigerer?: string
    korrigertAv?: string
    avbruttDato?: Dayjs
    sykmeldingUtskrevet?: Dayjs
    sykmeldingSignaturDato?: Dayjs
    startSykeforlop?: Dayjs
    opprettetDato?: Dayjs
    sendtTilNAVDato?: Dayjs
    sendtTilArbeidsgiverDato?: Dayjs
    arbeidsgiverNavn?: string
    arbeidsgiverOrgnummer?: string
    soknadPerioder: Soknadsperiode[]
    merknaderFraSykmelding?: Merknad[]
    ventetidSykmeldingUuid?: string
    meldingTilNavDagerFraSykmelding?: DatoPeriode[]

    constructor(json: BackendSoknad) {
        this.id = json.id
        this.sykmeldingId = json.sykmeldingId
        this.soknadstype = json.soknadstype
        this.status = json.status
        this.arbeidssituasjon = json.arbeidssituasjon
        this.fom = tilDayjs(json.fom)
        this.tom = tilDayjs(json.tom)
        this.korrigerer = json.korrigerer
        this.korrigertAv = json.korrigertAv
        this.avbruttDato = tilDayjs(json.avbruttDato)
        this.sykmeldingUtskrevet = tilDayjs(json.sykmeldingUtskrevet)
        this.sykmeldingSignaturDato = tilDayjs(json.sykmeldingSignaturDato)
        this.startSykeforlop = tilDayjs(json.startSykeforlop)
        this.opprettetDato = tilDayjs(json.opprettetDato)
        this.sendtTilNAVDato = tilDayjs(json.sendtTilNAVDato)
        this.sendtTilArbeidsgiverDato = tilDayjs(json.sendtTilArbeidsgiverDato)
        this.arbeidsgiverNavn = json.arbeidsgiverNavn
        this.arbeidsgiverOrgnummer = json.arbeidsgiverOrgnummer
        this.soknadPerioder = mapTilSoknadsperioder(json.soknadPerioder)
        this.merknaderFraSykmelding = json.merknaderFraSykmelding
        this.ventetidSykmeldingUuid = json.ventetidSykmeldingUuid
        this.meldingTilNavDagerFraSykmelding = mapTilDatoPerioder(json.meldingTilNavDagerFraSykmelding)
    }
}

export const tilDayjs = (dato?: string | null): Dayjs | undefined => {
    if (!dato) return undefined
    const dayjsDato = dayjs(dato)
    return dayjsDato.isValid() ? dayjsDato : undefined
}

export const dayjsToDate = (dato?: string | Dayjs | null): Date | undefined =>
    typeof dato === 'string' ? tilDayjs(dato)?.toDate() : dato?.toDate()

const mapTilSoknadsperioder = (perioder?: BackendSoknadsperiode[] | null): Soknadsperiode[] => {
    if (!perioder) return []
    return perioder
        .map((periode) => {
            const fom = tilDayjs(periode.fom)
            const tom = tilDayjs(periode.tom)
            if (!fom || !tom) return undefined
            return {
                ...periode,
                fom,
                tom,
            }
        })
        .filter((periode): periode is Soknadsperiode => periode !== undefined)
}

const mapTilDatoPerioder = (perioder?: BackendPeriode[] | null): DatoPeriode[] | undefined => {
    if (!perioder) return undefined
    return perioder
        .map((periode) => {
            const fom = tilDayjs(periode.fom)
            const tom = tilDayjs(periode.tom)
            if (!fom || !tom) return undefined
            return { fom, tom }
        })
        .filter((periode): periode is DatoPeriode => periode !== undefined)
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
    | 'NY'
    | 'SENDT'
    | 'FREMTIDIG'
    | 'UTKAST_TIL_KORRIGERING'
    | 'KORRIGERT'
    | 'AVBRUTT'
    | 'SLETTET'
    | 'UTGAATT'

export type Arbeidssituasjon = 'NAERINGSDRIVENDE' | 'FRILANSER' | 'ARBEIDSTAKER' | 'ARBEIDSLEDIG' | 'ANNET'

export interface BackendSoknadsperiode {
    fom: string
    tom: string
    grad: number
    sykmeldingstype: string
}

export interface Soknadsperiode {
    fom: Dayjs
    tom: Dayjs
    grad: number
    sykmeldingstype: string
}

export interface Merknad {
    type: string
    beskrivelse?: string
}

export interface BackendPeriode {
    fom: string
    tom: string
}

export interface DatoPeriode {
    fom: Dayjs
    tom: Dayjs
}

