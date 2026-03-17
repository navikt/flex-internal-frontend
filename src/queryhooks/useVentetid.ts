import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { fetchJsonMedRequestId } from '../utils/fetch'

export interface FomTomPeriode {
    fom: string
    tom: string
}

export interface Syketilfellebit {
    syketilfellebitId: string
    fnr: string
    opprettet: string
    inntruffet: string
    orgnummer: string | null
    tags: string
    ressursId: string
    korrigererSendtSoknad: string | null
    fom: string | null
    tom: string | null
    publisert: boolean
    slettet: string | null
    tombstonePublisert: string | null
}

export interface SyketilfellebitResponse {
    syketilfellebiter: Syketilfellebit[]
}

export interface VentetidInternalResponse {
    erUtenforVentetid: boolean
    ventetid: FomTomPeriode
    sykmeldingsperiode: FomTomPeriode
}

export function useVentetid(
    sykmeldingId: string | undefined,
    enabled: boolean,
): UseQueryResult<VentetidInternalResponse | null, Error> {
    return useQuery<VentetidInternalResponse | null, Error>({
        queryKey: ['ventetid', sykmeldingId],
        enabled: enabled,
        queryFn: () => {
            if (sykmeldingId === undefined) {
                return null
            }
            return fetchJsonMedRequestId(`/api/flex-syketilfelle/api/v1/flex/ventetid/${sykmeldingId}`, {
                method: 'GET',
                credentials: 'include',
            })
        },
    })
}

export function useSyketilfellebiter(
    fnr: string | undefined,
    enabled: boolean,
): UseQueryResult<SyketilfellebitResponse, Error> {
    return useQuery<SyketilfellebitResponse, Error>({
        queryKey: ['syketilfellebiter', fnr],
        enabled: enabled,
        queryFn: () => {
            if (fnr == null) {
                return Promise.resolve({ syketilfellebiter: [] })
            }
            return fetchJsonMedRequestId<SyketilfellebitResponse>(
                '/api/flex-syketilfelle/api/v1/flex/syketilfellebiter',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', fnr: fnr },
                },
            )
        },
    })
}
