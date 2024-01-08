import React, { useState } from 'react'
import { Alert, Button, TextField } from '@navikt/ds-react'
import { useMutation } from '@tanstack/react-query'

import { initialProps } from '../initialprops/initialProps'
import { fetchMedRequestId } from '../utils/fetch'

const IdentPage = () => {
    const [soknadId, setSoknadId] = useState<string>()

    const addTagMutation = useMutation({
        mutationFn: async ({ id }: { id: string }) => {
            const fetchResultPromise = await fetchMedRequestId(
                '/api/sykepengesoknad-backend/api/v1/flex/republiser/' + id,
                {
                    method: 'POST',
                },
            )
            return { fetchResultPromise, id }
        },
    })
    return (
        <div className="flex-row space-y-4">
            <TextField
                type="text"
                label="Sykepengesøknad UUID"
                onChange={(e) => {
                    addTagMutation.reset()
                    setSoknadId(e.target.value)
                }}
            />
            <Button
                onClick={() => {
                    if (soknadId) {
                        addTagMutation.mutate({ id: soknadId })
                    }
                }}
            >
                Republiser
            </Button>

            {addTagMutation.isLoading && <Alert variant="info">Sender...</Alert>}

            {addTagMutation.data && (
                <Alert variant="success">Status: {addTagMutation.data?.fetchResultPromise.response.status}</Alert>
            )}
            {addTagMutation.isError && <Alert variant="error">{JSON.stringify(addTagMutation.error)}</Alert>}
        </div>
    )
}

export const getServerSideProps = initialProps

export default IdentPage
