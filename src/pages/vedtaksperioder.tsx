import React, { useState } from 'react'

import { initialProps } from '../initialprops/initialProps'
import FnrInput from '../components/FnrInput'
import { useVedtaksperioder } from '../queryhooks/useVedtaksperioder'
import { TidslinjeVedtaksperioder } from '../components/TidslinjeVedtaksperioder'

const Vedtaksperioder = () => {
    const [fnr, setFnr] = useState<string>()

    const enabled = fnr !== undefined
    const { data: data, isLoading } = useVedtaksperioder(fnr, enabled)

    return (
        <div className="flex-row space-y-4">
            <FnrInput setFnr={setFnr} />
            {isLoading && enabled && <span>Laster...</span>}
            {data && data.length === 0 && <span>Ingen vedtaksperioder</span>}
            {data && data.length > 0 && <TidslinjeVedtaksperioder vedtaksperioder={data} />}
        </div>
    )
}

export const getServerSideProps = initialProps

export default Vedtaksperioder
