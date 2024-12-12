import React, { useState } from 'react'
import { TextField } from '@navikt/ds-react'

import { initialProps } from '../initialprops/initialProps'
import { useAareg } from '../queryhooks/useAareg'

const AaregPage = () => {
    const [fnr, setFnr] = useState<string>()

    const { data: data } = useAareg(fnr, fnr !== undefined)

    return (
        <div className="flex-row space-y-4">
            <TextField
                label="Fnr"
                onChange={(e) => (e.target.value.length == 11 ? setFnr(e.target.value) : setFnr(undefined))}
            />
            {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
        </div>
    )
}

export const getServerSideProps = initialProps

export default AaregPage
