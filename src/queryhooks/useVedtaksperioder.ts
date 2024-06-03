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
): UseQueryResult<FullVedtaksperiodeBehandling[], Error> {
    return useQuery<FullVedtaksperiodeBehandling[], Error>({
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

interface VedtaksperiodeBehandlingStatusDbRecord {
    id: string | null
    vedtaksperiodeBehandlingId: string
    opprettetDatabase: string
    tidspunkt: string
    status: StatusVerdi
    brukervarselId: string | null
    dittSykefravaerMeldingId: string | null
}

type StatusVerdi = string
