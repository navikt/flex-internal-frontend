import React, { useState } from 'react'
import { Alert, BodyShort, Box, Label, Loader, Search } from '@navikt/ds-react'

import { initialProps } from '../initialprops/initialProps'
import { useSyketilfellebiter } from '../queryhooks/useVentetid'
import { handterFnrValidering } from '../utils/inputValidering'

const SyketilfellebiterPage = () => {
    const [fnr, setFnr] = useState<string>()
    const { data, isError, error, isLoading } = useSyketilfellebiter(fnr, fnr !== undefined)

    return (
        <div className="flex-row space-y-4">
            <Search
                htmlSize="20"
                label="Fødselsnummer"
                onSearchClick={(input) => {
                    handterFnrValidering(input, setFnr)
                }}
                onKeyDown={(evt) => {
                    if (evt.key === 'Enter') {
                        handterFnrValidering(evt.currentTarget.value, setFnr)
                    }
                }}
            />
            {isError && <Alert variant="error">Feil ved henting av ventetid: {String(error)}</Alert>}

            {!isError &&
                (isLoading ? (
                    <div className="flex items-center gap-2">
                        <Loader size="small" title="Laster" aria-live="polite" />
                        <BodyShort>Henter ventetid...</BodyShort>
                    </div>
                ) : data ? (
                    <Box>
                        {data && (
                            <div className="mt-4">
                                <Label>Syketilfellebiter:</Label>
                                <div className="mt-2 rounded-sm bg-ax-neutral-200 p-3">
                                    <pre className="whitespace-pre-wrap font-mono text-xs">
                                        {JSON.stringify(data, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </Box>
                ) : null)}
        </div>
    )
}

export const getServerSideProps = initialProps

export default SyketilfellebiterPage
