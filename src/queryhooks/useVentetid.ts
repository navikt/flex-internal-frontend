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

export interface VentetidInternalResponse {
    erUtenforVentetid: boolean
    ventetid: FomTomPeriode
    sykmeldingsperiode: FomTomPeriode
    syketilfellebiter: Syketilfellebit[]
}

export function useVentetid(
    sykmeldingId: string | undefined,
    enabled = true,
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
