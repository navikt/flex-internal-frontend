import { useMutation, useQueryClient } from '@tanstack/react-query'

interface OppdaterFomRequest {
    id: string
    vedtaksperiodeFom: string
}

interface MutationProps {
    request: OppdaterFomRequest
    fnr: string
    callback?: () => void
}

export function useOppdaterArbeidssokerperiodeFomMutation() {
    const queryClient = useQueryClient()

    return useMutation<void, Error, MutationProps>({
        mutationFn: async ({ request }) => {
            const response = await fetch(
                '/api/flex-arbeidssokerregister-oppdatering/api/v1/flex/arbeidssokerperioder/oppdater-fom',
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(request),
                },
            )

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Arbeidssokerperiode ikke funnet')
                }
                throw new Error('Klarte ikke å oppdatere vedtaksperiodeFom')
            }
        },
        onSuccess: (_, { callback, fnr }) => {
            queryClient.invalidateQueries({ queryKey: ['arbeidssokerperioder', fnr] })
            if (callback) callback()
        },
    })
}
