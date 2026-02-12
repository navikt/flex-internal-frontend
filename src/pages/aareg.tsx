import React, { useState } from 'react'
import { ReadMore, Search } from '@navikt/ds-react'
import { allExpanded, defaultStyles, JsonView } from 'react-json-view-lite'

import { initialProps } from '../initialprops/initialProps'
import { useAareg } from '../queryhooks/useAareg'
import { TidslinjeAareg } from '../components/TidslinjeAareg'
import { handterFnrValidering } from '../utils/inputValidering'

const AaregPage = () => {
    const [fnr, setFnr] = useState<string>()

    const { data: data } = useAareg(fnr, fnr !== undefined)

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
