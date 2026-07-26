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
                return { vedtaksperioder: [], inntektsmeldinger: [], forelagteOpplysninger: [] }
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
    forelagteOpplysninger: ForelagteOpplysningerDbRecord[]
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
    sisteSpleisstatusTidspunkt: string
    sisteVarslingstatusTidspunkt: string | null
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

type StatusVerdi =
    | 'VARSLET_MANGLER_INNTEKTSMELDING_FØRSTE'
    | 'VARSLET_MANGLER_INNTEKTSMELDING_FØRSTE_DONE'
    | 'VARSLET_MANGLER_INNTEKTSMELDING_ANDRE'
    | 'VARSLET_MANGLER_INNTEKTSMELDING_ANDRE_DONE'
    | 'VARSLET_VENTER_PÅ_SAKSBEHANDLER_FØRSTE'
    | 'VARSLET_VENTER_PÅ_SAKSBEHANDLER_FØRSTE_DONE'
    | 'OPPRETTET'
    | 'VENTER_PÅ_ARBEIDSGIVER'
    | 'VENTER_PÅ_SAKSBEHANDLER'
    | 'VENTER_PÅ_ANNEN_PERIODE'
    | 'FERDIG'
    | 'BEHANDLES_UTENFOR_SPEIL'
    | 'REVARSLET_VENTER_PÅ_SAKSBEHANDLER'
    | 'REVARSLET_VENTER_PÅ_SAKSBEHANDLER_DONE'
    | 'VARSLER_IKKE_GRUNNET_FULL_REFUSJON'
    | 'VARSLET_FORSINKET_PA_ANNEN_ORGNUMMER'
    | 'VARSLET_MANGLER_INNTEKTSMELDING'
    | 'VARSLET_MANGLER_INNTEKTSMELDING_DONE'
    | 'VARSLET_VENTER_PÅ_SAKSBEHANDLER'
    | 'VARSLET_MANGLER_INNTEKTSMELDING_15'
    | 'VARSLET_MANGLER_INNTEKTSMELDING_15_DONE'
    | 'VARSLET_MANGLER_INNTEKTSMELDING_28'
    | 'VARSLET_MANGLER_INNTEKTSMELDING_28_DONE'
    | 'VARSLET_VENTER_PÅ_SAKSBEHANDLER_28'
    | 'VARSLET_VENTER_PÅ_SAKSBEHANDLER_28_DONE'

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

export interface ForelagteOpplysningerDbRecord {
    id: string | null
    vedtaksperiodeId: string
    behandlingId: string
    forelagteOpplysningerMelding: ForelagteOpplysningerMelding | null
    opprettet: string
    opprinneligOpprettet: string
    status: ForelagtStatus
    statusEndret: string | null
}

export type ForelagtStatus = 'NY' | 'SENDT' | 'AVBRUTT'

export interface ForelagteOpplysningerMelding {
    vedtaksperiodeId: string
    behandlingId: string
    tidsstempel: string
    omregnetÅrsinntekt: number
    skatteinntekter: Skatteinntekt[]
}

interface Skatteinntekt {
    måned: string
    beløp: number
}
