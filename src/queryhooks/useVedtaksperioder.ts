import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { fetchJsonMedRequestId } from '../utils/fetch'

export function useVedtaksperioder(
    fnr: string | undefined,
    vedtaksperiodeId: string | undefined,
    enabled = true,
): UseQueryResult<FullVedtaksperiodeBehandling[], Error> {
    return useQuery<FullVedtaksperiodeBehandling[], Error>({
        queryKey: ['vedtaksperioder'],
        enabled: enabled,
        queryFn: () => {
            if (fnr === undefined && vedtaksperiodeId === undefined) {
                return []
            }
            return fetchJsonMedRequestId('/api/flex-inntektsmelding-status/api/v1/vedtaksperioder', {
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify({ fnr, vedtaksperiodeId }),
                headers: {
                    'Content-Type': 'application/json',
                },
            })
        },
    })
}

export interface FullVedtaksperiodeBehandling {
    soknader: Sykepengesoknad[]
    vedtaksperiode: VedtaksperiodeBehandlingDbRecord
    statuser: VedtaksperiodeBehandlingStatusDbRecord[]
}

interface Sykepengesoknad {
    id: string | null
    sykepengesoknadUuid: string
    orgnummer: string | null
    soknadstype: string
    startSyketilfelle: string
    fom: string
    tom: string
    fnr: string
    sendt: string
    opprettetDatabase: string
}

interface VedtaksperiodeBehandlingDbRecord {
    id: string | null
    opprettetDatabase: string
    oppdatert: string
    sisteSpleisstatus: StatusVerdi
    sisteVarslingstatus: StatusVerdi | null
    vedtaksperiodeId: string
    behandlingId: string
    sykepengesoknadUuid: string
}

export interface VedtaksperiodeBehandlingStatusDbRecord {
    id: string | null
    vedtaksperiodeBehandlingId: string
    opprettetDatabase: string
    tidspunkt: string
    status: StatusVerdi
    brukervarselId: string | null
    dittSykefravaerMeldingId: string | null
}

type StatusVerdi = string
