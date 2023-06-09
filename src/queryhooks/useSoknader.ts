import { useQuery, UseQueryResult } from '@tanstack/react-query'
import dayjs from 'dayjs'

import { fetchJsonMedRequestId } from '../utils/fetch'

export function useSoknader(fnr: string | undefined, enabled = true): UseQueryResult<Soknad[], Error> {
    return useQuery<Soknad[], Error>({
        queryKey: ['soknad', fnr],
        enabled: enabled,
        queryFn: () => {
            if (fnr === undefined) {
                return []
            }
            return fetchJsonMedRequestId('/api/sykepengesoknad-backend/api/v1/flex/sykepengesoknader', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    fnr: fnr,
                },
            }).then((json: any) => json.map((soknad: any) => new Soknad(soknad)))
        },
    })
}

export const dayjsToDate = (dato: string): Date | undefined => {
    return dato !== null ? dayjs(dato).toDate() : undefined
}

export type RSSoknadstypeType =
    | 'SELVSTENDIGE_OG_FRILANSERE'
    | 'OPPHOLD_UTLAND'
    | 'ARBEIDSTAKERE'
    | 'ARBEIDSLEDIG'
    | 'BEHANDLINGSDAGER'
    | 'ANNET_ARBEIDSFORHOLD'
    | 'REISETILSKUDD'
    | 'GRADERT_REISETILSKUDD'

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

export interface Arbeidsgiver {
    navn: string
    orgnummer: string
}

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

export class Soknad {
    id: string
    sykmeldingId?: string
    soknadstype: RSSoknadstypeType
    status: RSSoknadstatusType
    arbeidssituasjon?: RSArbeidssituasjonType
    fom?: Date
    tom?: Date
    korrigerer?: string
    korrigertAv?: string
    egenmeldtSykmelding?: boolean
    avbruttDato?: Date
    sykmeldingUtskrevet?: Date
    startSykeforlop?: Date
    opprettetDato?: Date
    sendtTilNAVDato?: Date
    sendtTilArbeidsgiverDato?: Date
    arbeidsgiver?: Arbeidsgiver
    soknadPerioder: RSSoknadsperiode[]
    merknaderFraSykmelding?: RSMerknad[]
    opprettetAvInntektsmelding: boolean

    constructor(json: any) {
        this.id = json.id
        this.sykmeldingId = json.sykmeldingId
        this.soknadstype = json.soknadstype
        this.status = json.status
        this.arbeidssituasjon = json.arbeidssituasjon
        this.fom = dayjsToDate(json.fom)
        this.tom = dayjsToDate(json.tom)
        this.korrigerer = json.korrigerer
        this.korrigertAv = json.korrigertAv
        this.egenmeldtSykmelding = json.egenmeldtSykmelding
        this.avbruttDato = dayjsToDate(json.avbruttDato)
        this.sykmeldingUtskrevet = dayjsToDate(json.sykmeldingUtskrevet)
        this.startSykeforlop = dayjsToDate(json.startSykeforlop)
        this.opprettetDato = dayjsToDate(json.opprettetDato)
        this.sendtTilNAVDato = dayjsToDate(json.sendtTilNAVDato)
        this.sendtTilArbeidsgiverDato = dayjsToDate(json.sendtTilArbeidsgiverDato)
        if (json.arbeidsgiver) {
            this.arbeidsgiver = {
                navn: json.arbeidsgiver.navn,
                orgnummer: json.arbeidsgiver.orgnummer,
            }
        }
        this.soknadPerioder = json.soknadPerioder
        this.merknaderFraSykmelding = json.merknaderFraSykmelding
        this.opprettetAvInntektsmelding = json.opprettetAvInntektsmelding
    }
}
