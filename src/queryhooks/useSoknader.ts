import { useQuery, UseQueryResult } from '@tanstack/react-query'
import dayjs from 'dayjs'
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
            return fetchJsonMedRequestId('/api/sykepengesoknad-backend/api/v1/flex/sykepengesoknader', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fnr: fnr }),
            }).then((jsonResponse: any) => {
                const response: SoknaderResponse = {
                    sykepengesoknadListe: [],
                    klippetSykepengesoknadRecord: [],
                }
                jsonResponse.sykepengesoknadListe
                    .filter((soknad: any) => soknad.soknadstype !== 'OPPHOLD_UTLAND')
                    .map((soknad: any) => response.sykepengesoknadListe.push(new Soknad(soknad)))
                jsonResponse.klippetSykepengesoknadRecord.map((klipp: any) =>
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

export class KlippetSykepengesoknadRecord {
    id: string
    sykepengesoknadUuid: string
    sykmeldingUuid: string
    klippVariant: KlippVariant
    periodeFor: RSSoknadsperiode[]
    periodeEtter: RSSoknadsperiode[]
    timestamp?: Date

    constructor(json: any) {
        this.id = json.id
        this.sykepengesoknadUuid = json.sykepengesoknadUuid
        this.sykmeldingUuid = json.sykmeldingUuid
        this.klippVariant = json.klippVariant
        this.periodeFor = JSON.parse(json.periodeFor)
        this.periodeEtter = JSON.parse(json.periodeEtter)
        this.timestamp = dayjsToDate(json.timestamp)
    }
}

export class Soknad {
    id: string
    sykmeldingId?: string
    soknadstype: RSSoknadstypeType
    status: RSSoknadstatusType
    arbeidssituasjon?: RSArbeidssituasjonType
    fom?: string
    tom?: string
    korrigerer?: string
    korrigertAv?: string
    avbruttDato?: string
    sykmeldingUtskrevet?: Date
    sykmeldingSignaturDato?: Date
    startSykeforlop?: string
    opprettetDato?: Date
    sendtTilNAVDato?: Date
    sendtTilArbeidsgiverDato?: Date
    arbeidsgiverNavn?: string
    arbeidsgiverOrgnummer?: string
    soknadPerioder: RSSoknadsperiode[]
    merknaderFraSykmelding?: RSMerknad[]

    constructor(json: any) {
        this.id = json.id
        this.sykmeldingId = json.sykmeldingId
        this.soknadstype = json.soknadstype
        this.status = json.status
        this.arbeidssituasjon = json.arbeidssituasjon
        this.fom = json.fom
        this.tom = json.tom
        this.korrigerer = json.korrigerer
        this.korrigertAv = json.korrigertAv
        this.avbruttDato = json.avbruttDato
        this.sykmeldingUtskrevet = dayjsToDate(json.sykmeldingUtskrevet)
        this.sykmeldingSignaturDato = dayjsToDate(json.sykmeldingSignaturDato)
        this.startSykeforlop = json.startSykeforlop
        this.opprettetDato = dayjsToDate(json.opprettetDato)
        this.sendtTilNAVDato = dayjsToDate(json.sendtTilNAVDato)
        this.sendtTilArbeidsgiverDato = dayjsToDate(json.sendtTilArbeidsgiverDato)
        this.arbeidsgiverNavn = json.arbeidsgiverNavn
        this.arbeidsgiverOrgnummer = json.arbeidsgiverOrgnummer
        this.soknadPerioder = json.soknadPerioder
        this.merknaderFraSykmelding = json.merknaderFraSykmelding
    }
}

export const dayjsToDate = (dato: string): Date | undefined => {
    return dato !== null ? dayjs(dato).toDate() : undefined
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

export type RSSoknadstypeType =
    | 'SELVSTENDIGE_OG_FRILANSERE'
    | 'OPPHOLD_UTLAND'
    | 'ARBEIDSTAKERE'
    | 'ARBEIDSLEDIG'
    | 'BEHANDLINGSDAGER'
    | 'ANNET_ARBEIDSFORHOLD'
    | 'REISETILSKUDD'
    | 'GRADERT_REISETILSKUDD'
    | 'FRISKMELDT_TIL_ARBEIDSFORMIDLING'

export type RSSoknadstatusType =
    | 'NY'
    | 'SENDT'
    | 'FREMTIDIG'
    | 'UTKAST_TIL_KORRIGERING'
    | 'KORRIGERT'
    | 'AVBRUTT'
    | 'SLETTET'
    | 'UTGAATT'

export type RSArbeidssituasjonType = 'NAERINGSDRIVENDE' | 'FRILANSER' | 'ARBEIDSTAKER' | 'ARBEIDSLEDIG' | 'ANNET'

export interface RSSoknadsperiode {
    fom: string
    tom: string
    grad: number
    sykmeldingstype: string
}

export interface RSMerknad {
    type: string
    beskrivelse?: string
}
