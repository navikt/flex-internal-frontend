import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { fetchJsonMedRequestId } from '../utils/fetch'

export function useInntektsmeldinger(
    fnr: string | undefined,
    enabled = true,
): UseQueryResult<InntektsmeldingDbRecord[], Error> {
    return useQuery<InntektsmeldingDbRecord[], Error>({
        queryKey: ['inntektsmeldinger', fnr],
        enabled: enabled,
        queryFn: () => {
            if (fnr === undefined) {
                return []
            }
            return fetchJsonMedRequestId('/api/flex-inntektsmelding-status/api/v1/inntektsmeldinger', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    fnr: fnr,
                },
            })
        },
    })
}

export interface InntektsmeldingDbRecord {
    id: string | null
    inntektsmeldingId: string
    fnr: string
    arbeidsgivertype: string
    virksomhetsnummer: string | null
    fullRefusjon: boolean
    opprettet: string
    mottattDato: string
    foersteFravaersdag: string | null
    vedtaksperiodeId: string | null
}
