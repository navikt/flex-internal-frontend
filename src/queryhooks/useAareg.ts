import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { fetchJsonMedRequestId } from '../utils/fetch'

export function useAareg(fnr: string | undefined, enabled = true): UseQueryResult<AaregResponse | null, Error> {
    return useQuery<AaregResponse | null, Error>({
        queryKey: ['aareg', fnr],
        enabled: enabled,
        queryFn: () => {
            if (fnr === undefined) {
                return null
            }
            return fetchJsonMedRequestId('/api/sykepengesoknad-backend/api/v1/flex/aareg', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fnr: fnr }),
            })
        },
    })
}

export type AaregResponse = Arbeidsforhold[]

export interface Arbeidsforhold {
    type: Type
    arbeidstaker: Arbeidstaker
    arbeidssted: Arbeidssted
    opplysningspliktig: Opplysningspliktig
    ansettelsesperiode: Ansettelsesperiode
}

export interface Ansettelsesperiode {
    startdato: string
    sluttdato: string | null
}

export interface Type {
    kode: string
    beskrivelse: string
}

export interface Arbeidstaker {
    identer: Identer[]
}

export interface Identer {
    type: string
    ident: string
    gjeldende: boolean
}

export interface Arbeidssted {
    type: string
    identer: Identer2[]
}

export interface Identer2 {
    type: string
    ident: string
    gjeldende: any
}

export interface Opplysningspliktig {
    type: string
    identer: Identer3[]
}

export interface Identer3 {
    type: string
    ident: string
    gjeldende: any
}

export interface Yrke {
    kode: string
    beskrivelse: string
}
