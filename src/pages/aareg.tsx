import React from 'react'
import { ReadMore } from '@navikt/ds-react'
import { allExpanded, defaultStyles, JsonView } from 'react-json-view-lite'

import FnrSokefelt from '../components/FnrSokefelt'
import { initialProps } from '../initialprops/initialProps'
import { useAareg } from '../queryhooks/useAareg'
import { TidslinjeAareg } from '../components/TidslinjeAareg'
import { useValgtFnr } from '../utils/useValgtFnr'

const AaregPage = () => {
    const { fnr } = useValgtFnr()

    const { data: data } = useAareg(fnr, fnr !== undefined)

    return (
        <div className="flex-row space-y-4">
            <FnrSokefelt />
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
