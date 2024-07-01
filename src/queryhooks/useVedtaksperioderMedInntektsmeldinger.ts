import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { fetchJsonMedRequestId } from '../utils/fetch'

export function useVedtaksperioderMedInntektsmeldinger(
    fnr: string | undefined,
    vedtaksperiodeId: string | undefined,
    enabled = true,
): UseQueryResult<VedtakspoerioderOgImResponse, Error> {
    return useQuery<VedtakspoerioderOgImResponse, Error>({
        queryKey: ['vedtaksperioder'],
        enabled: enabled,
        queryFn: () => {
            if (fnr === undefined && vedtaksperiodeId === undefined) {
                return { vedtaksperioder: [], inntektsmeldinger: [] }
            }
            return fetchJsonMedRequestId('/api/flex-inntektsmelding-status/api/v1/vedtak-og-inntektsmeldinger', {
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

export interface VedtakspoerioderOgImResponse {
    vedtaksperioder: FullVedtaksperiodeBehandling[]
    inntektsmeldinger: InntektsmeldingDbRecord[]
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
