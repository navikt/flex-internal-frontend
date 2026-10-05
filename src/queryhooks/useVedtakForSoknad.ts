import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { fetchJsonMedRequestId } from '../utils/fetch'

interface VedtakDokument {
    dokumentId: string
    type: string
}

export interface Utbetalingsdag {
    dato: string
    type: string
    begrunnelser: string[]
    beløpTilArbeidsgiver?: number | null
    beløpTilSykmeldt?: number | null
    sykdomsgrad?: number | null
}

interface VedtakUtbetaling {
    utbetalingId?: string | null
    utbetalingType?: string
    utbetalingsdager?: Utbetalingsdag[] | null
    [key: string]: unknown
}

interface VedtakData {
    dokumenter: VedtakDokument[]
    utbetaling: VedtakUtbetaling
    fom?: string
    tom?: string
    vedtakFattetTidspunkt?: string | null
    organisasjonsnummer?: string
    [key: string]: unknown
}

export interface RSVedtakWrapper {
    id: string
    vedtak: VedtakData
    orgnavn?: string
    annullert?: boolean
    revurdert?: boolean
    sykepengebelopArbeidsgiver?: number
    sykepengebelopSykmeldt?: number
    [key: string]: unknown
}

interface HentVedtakRequest {
    fnr: string
    soknadId: string
}

interface VedtakForSoknadResponse {
    vedtak: RSVedtakWrapper[]
}

export function useVedtakForSoknad(
    fnr: string | undefined,
    soknadId: string,
): UseQueryResult<RSVedtakWrapper[], Error> {
    return useQuery<RSVedtakWrapper[], Error>({
        queryKey: ['vedtak-for-soknad', fnr, soknadId],
        enabled: false,
        staleTime: 0,
        queryFn: () => {
            if (!fnr) {
                throw new Error('Mangler fnr for vedtaksoppslag')
            }

            const requestBody: HentVedtakRequest = { fnr, soknadId }
            return fetchJsonMedRequestId<VedtakForSoknadResponse>('/api/spinnsyn-backend/api/v1/flex/vedtak/soknad', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            }).then((response) => response.vedtak)
        },
    })
}
