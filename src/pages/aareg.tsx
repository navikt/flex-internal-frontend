import React, { useState } from 'react'
import { ReadMore, TextField } from '@navikt/ds-react'
import { allExpanded, defaultStyles, JsonView } from 'react-json-view-lite'

import { initialProps } from '../initialprops/initialProps'
import { useAareg } from '../queryhooks/useAareg'
import { TidslinjeAareg } from '../components/TidslinjeAareg'

const AaregPage = () => {
    const [fnr, setFnr] = useState<string>()

    const { data: data } = useAareg(fnr, fnr !== undefined)

    return (
        <div className="flex-row space-y-4">
            <TextField
                label="Fnr"
                onChange={(e) => (e.target.value.length == 11 ? setFnr(e.target.value) : setFnr(undefined))}
            />
            {data && <TidslinjeAareg aaregresponse={data} />}
            {data && (
                <ReadMore header="rådata">
                    <JsonView data={data} shouldExpandNode={allExpanded} style={defaultStyles} />
                </ReadMore>
            )}
        </div>
    )
}

export const getServerSideProps = initialProps

export default AaregPage
