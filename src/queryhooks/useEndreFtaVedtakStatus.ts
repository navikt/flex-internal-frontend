import { useMutation, useQueryClient } from '@tanstack/react-query'

interface EndreStatusRequest {
    id: string
    status: 'NY' | 'OVERLAPP_OK'
}

interface FriskTilArbeidVedtakDbRecord {
    id: string
    behandletStatus: string
    // legg til andre relevante felter dersom det er behov
}

interface MutationProps {
    request: EndreStatusRequest
    fnr: string
    callback?: () => void
}

export function useEndreStatusMutation() {
    const queryClient = useQueryClient()

    return useMutation<FriskTilArbeidVedtakDbRecord, Error, MutationProps>({
        mutationFn: async ({ request }) => {
            const response = await fetch('/api/sykepengesoknad-backend/api/v1/flex/fta-vedtak/endre-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Klarte ikke å endre status')
            }
            return (await response.json()) as Promise<FriskTilArbeidVedtakDbRecord>
        },
        onSuccess: (_, { callback, fnr }) => {
            queryClient.invalidateQueries({ queryKey: ['fta-vedtak', fnr] })
            queryClient.invalidateQueries({ queryKey: ['ubehandlede-fta-vedtak'] })
            if (callback) callback()
        },
    })
}
