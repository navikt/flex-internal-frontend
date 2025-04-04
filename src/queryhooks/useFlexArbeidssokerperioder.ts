import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { fetchJsonMedRequestId } from '../utils/fetch'

export interface FlexInternalResponse {
    arbeidssokerperioder: ArbeidssokerperiodeResponse[]
}

export interface ArbeidssokerperiodeResponse {
    id: string
    fnr: string
    vedtaksperiodeId: string
    vedtaksperiodeFom: string // ISO-formatert dato (YYYY-MM-DD)
    vedtaksperiodeTom: string // ISO-formatert dato (YYYY-MM-DD)
    opprettet: string // ISO-formatert dato/tid (f.eks. ISO 8601)
    arbeidssokerperiodeId?: string
    sendtPaaVegneAv?: string
    avsluttetMottatt?: string
    avsluttetTidspunkt?: string
    sendtAvsluttet?: string
    avsluttetAarsak?: string // Dersom dette er et enum, kan du eventuelt definere et eget enum her
    periodebekreftelser?: PeriodebekreftelseResponse[]
}

export interface PeriodebekreftelseResponse {
    id: string
    arbeidssokerperiodeId: string
    sykepengesoknadId: string
    fortsattArbeidssoker?: boolean
    inntektUnderveis?: boolean
    opprettet: string // ISO-formatert dato/tid
    avsluttendeSoknad: boolean
}

export function useFlexArbeidssokerperioder(fnr: string): UseQueryResult<FlexInternalResponse, Error> {
    return useQuery<FlexInternalResponse, Error>({
        queryKey: ['arbeidssokerperioder', fnr],
        queryFn: () => {
            return fetchJsonMedRequestId('/api/v1/internal/arbeidssokerperioder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fnr }),
            })
        },
    })
}
