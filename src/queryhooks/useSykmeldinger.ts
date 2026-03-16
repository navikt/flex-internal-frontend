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
            return fetchJsonMedRequestId<Sykmelding[]>(
                '/api/sykepengesoknad-backend/api/v1/flex/sykmeldinger',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fnr }),
                },
            )
        },
    })
}

export interface Sykmelding {
    id: string
    pasientFnr: string
    behandlerNavn?: string
    arbeidsgiver?: string
    fom: string
    tom: string
    status: SykmeldingStatusType
    diagnose?: string
}

export type SykmeldingStatusType =
    | 'NY'
    | 'APEN'
    | 'SENDT'
    | 'AVVIST'
    | 'UTGATT'
    | 'BEKREFTET'
    | 'AVBRUTT'
