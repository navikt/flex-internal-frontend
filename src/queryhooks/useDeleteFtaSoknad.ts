import { useMutation, useQueryClient } from '@tanstack/react-query'

interface DeleteFtaSoknadRequest {
    fnr: string
    sykepengesoknadId: string
}

interface MutationProps {
    request: DeleteFtaSoknadRequest
    fnr: string
    callback?: () => void
}

export function useDeleteFtaSoknadMutation() {
    const queryClient = useQueryClient()

    return useMutation<void, Error, MutationProps>({
        mutationFn: async ({ request }) => {
            const response = await fetch(`/api/sykepengesoknad-backend/api/v1/flex/fta-soknad`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
            })

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Søknad ikke funnet')
                }
                throw new Error('Klarte ikke å slette søknad')
            }
        },
        onSuccess: (_, { callback, fnr }) => {
            queryClient.invalidateQueries({ queryKey: ['soknad', fnr] })
            if (callback) callback()
        },
    })
}
