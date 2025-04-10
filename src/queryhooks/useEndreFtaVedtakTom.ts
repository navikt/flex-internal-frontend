import { useMutation, useQueryClient } from '@tanstack/react-query'

interface EndreTomRequest {
    id: string
    tom: string
}

interface FriskTilArbeidVedtakDbRecord {
    id: string
    behandletStatus: string
    // legg til andre relevante felter dersom det er behov
}

interface MutationProps {
    request: EndreTomRequest
    fnr: string
    callback?: () => void
}

export function useEndreFtaVedtakTomMutation() {
    const queryClient = useQueryClient()

    return useMutation<FriskTilArbeidVedtakDbRecord, Error, MutationProps>({
        mutationFn: async ({ request }) => {
            const response = await fetch('/api/sykepengesoknad-backend/api/v1/flex/fta-vedtak/endre-tom', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Klarte ikke å endre tom')
            }
            return (await response.json()) as Promise<FriskTilArbeidVedtakDbRecord>
        },
        onSuccess: (_, { callback, fnr }) => {
            queryClient.invalidateQueries({ queryKey: ['fta-vedtak-for-person', fnr] })
            queryClient.invalidateQueries({ queryKey: ['ubehandlede-fta-vedtak'] })
            if (callback) callback()
        },
    })
}
