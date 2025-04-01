import { useMutation, useQueryClient } from '@tanstack/react-query'

interface MutationProps {
    request: {
        fnr: string
        fom: string
        tom: string
    }
    callback: () => void
}

export function useNyttFriskmeldtVedtak() {
    const queryClient = useQueryClient()

    return useMutation<string, Error, MutationProps>({
        mutationFn: async (r) => {
            const rrr = await fetch(`/api/sykepengesoknad-backend/api/v1/flex/fta-vedtak-for-person/opprett`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(r.request),
            })
            await rrr.json()
            return 'ok'
        },
        onSuccess: async (_, r) => {
            queryClient
                .invalidateQueries({
                    queryKey: ['fta-vedtak-for-person', r.request.fnr],
                })
                .catch()
            r.callback()
        },
    })
}
