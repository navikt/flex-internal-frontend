import { useQuery, UseQueryResult } from '@tanstack/react-query'
import dayjs from 'dayjs'
import nb from 'dayjs/locale/nb'

import { fetchJsonMedRequestId } from '../utils/fetch'

dayjs.locale({
    ...nb,
    weekStart: 1,
})

export function useVedtaksperioder(
    fnr: string | undefined,
    enabled = true,
): UseQueryResult<VedtaksperiodeResponse[], Error> {
    return useQuery<VedtaksperiodeResponse[], Error>({
        queryKey: ['vedtaksperioder', fnr],
        enabled: enabled,
        queryFn: () => {
            if (fnr === undefined) {
                return []
            }
            return fetchJsonMedRequestId('/api/flex-inntektsmelding-status/api/v1/vedtaksperioder', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    fnr: fnr,
                },
            })
        },
    })
}

export interface VedtaksperiodeResponse {
    orgnr: string
    statusHistorikk: StatusHistorikk[]
}

export interface StatusHistorikk {
    id: string
    fnr: string
    orgNr: string
    orgNavn: string
    opprettet: string
    vedtakFom: string
    vedtakTom: string
    eksternTimestamp: string
    eksternId: string
    statusHistorikk: StatusHistorikk2[]
}

export interface StatusHistorikk2 {
    id: string
    status: string
    opprettet: string
}
