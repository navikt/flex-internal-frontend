import React, { useState } from 'react'
import { BodyShort, TextField } from '@navikt/ds-react'

import { initialProps } from '../initialprops/initialProps'
import { useSoknader } from '../queryhooks/useSoknader'

const Index = (): JSX.Element => {
    const [fnr, setFnr] = useState<string>()
    const { data: soknader } = useSoknader(fnr, fnr !== undefined)

    function fnrInput(fnrChange: string): void {
        setFnr(fnrChange.length == 11 ? fnrChange : undefined)
    }

    return (
        <>
            <TextField type="number" label="fnr" onChange={(e) => fnrInput(e.target.value)} />

            <BodyShort className="mt-4">Soknader for [ {fnr} ]:</BodyShort>

            <BodyShort as="ul">
                {soknader?.map((s, idx) => (
                    <BodyShort as="li" key={idx}>
                        {s.id}
                    </BodyShort>
                ))}
            </BodyShort>
        </>
    )
}

export const getServerSideProps = initialProps

export default Index
