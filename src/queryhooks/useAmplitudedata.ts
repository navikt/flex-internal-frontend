import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { fetchJsonMedRequestId } from '../utils/fetch'

export function useAmplitudedata(
    amplitudeId: string | undefined,
    enabled = true,
): UseQueryResult<AmplitudeResponse, Error> {
    return useQuery<AmplitudeResponse, Error>({
        queryKey: ['amplitiude', amplitudeId],
        enabled: enabled,
        queryFn: () => {
            return fetchJsonMedRequestId(`/api/amplitude/${amplitudeId}`, {
                method: 'GET',
                credentials: 'include',
            })
        },
    })
}

export interface AmplitudeResponse {
    userData: AmplitudeUserdata
    events: AmplitudeEvent[]
}

export interface AmplitudeUserdata {
    user_id: string
    first_used: string
    last_used: string
}

export interface AmplitudeEvent {
    event_id: string
    event_type: string
    client_event_time: string
    event_properties: EventProperties
}

export interface EventProperties {
    soknadstype?: string
    spørsmål?: string
    svar?: boolean | string
    dagerSidenSisteUtbetaling?: number
    dagerTilMaksdato?: number
    url: string
    component?: string
    komponent?: string
    tittel?: string
    composition?: string
    tekst?: string
    destinasjon?: string
}
