import React, { useState } from 'react'
import { Alert, Button, Heading, Textarea } from '@navikt/ds-react'

import { initialProps } from '../initialprops/initialProps'

const FtaImportPage = () => {
    const [body, setBody] = useState<string>('')
    const [laster, setLaster] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [suksess, setSuksess] = useState<string | null>(null)

    return (
        <>
            <Heading size="small" spacing level="1">
                Import av pågående friskmeldt til arbeid ved prodsetting
            </Heading>
            <Textarea
                onChange={(e) => {
                    setBody(e.target.value)
                    setError(null)
                    setSuksess(null)
                }}
                maxRows={10}
                value={body}
                label="Request"
            />

            <Button
                style={{ marginTop: '1em' }}
                loading={laster}
                onClick={async () => {
                    setLaster(true)

                    const res = await fetch(`/api/sykepengesoknad-backend/api/v1/flex/fta-vedtak`, {
                        method: 'POST',
                        body: body,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })
                    const response = await res.text()
                    if (res.ok) {
                        setSuksess(response)
                    } else {
                        setError(response)
                    }
                    setLaster(false)
                }}
            >
                Send melding
            </Button>

            {error && (
                <Alert style={{ marginTop: '1em' }} variant="error">
                    {error}
                </Alert>
            )}
            {suksess && (
                <Alert style={{ marginTop: '1em' }} variant="success">
                    {suksess}
                </Alert>
            )}
        </>
    )
}

export const getServerSideProps = initialProps

export default FtaImportPage
