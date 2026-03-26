import React from 'react'
import { allExpanded, defaultStyles, JsonView } from 'react-json-view-lite'

import FnrSokefelt from '../components/FnrSokefelt'
import { initialProps } from '../initialprops/initialProps'
import { useArbeidssoker } from '../queryhooks/useArbeidssoker'
import { useValgtFnr } from '../utils/useValgtFnr'

const ArbeidssokerPage = () => {
    const { fnr } = useValgtFnr()

    const { data: data } = useArbeidssoker(fnr, !!fnr && fnr.length == 11)

    return (
        <div className="flex-row space-y-4">
            <FnrSokefelt />
            <div>{data && <JsonView data={data} shouldExpandNode={allExpanded} style={defaultStyles} />}</div>
        </div>
    )
}

export const getServerSideProps = initialProps

export default ArbeidssokerPage
