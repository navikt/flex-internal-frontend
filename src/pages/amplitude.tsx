import React from 'react'
import dynamic from 'next/dynamic'

import { initialProps } from '../initialprops/initialProps'

const Amplitude = () => {
    const AmplitudeEvents = dynamic(() => import('../components/AmplitudeEvents'), {
        ssr: false,
    })
    return <AmplitudeEvents />
}

export const getServerSideProps = initialProps

export default Amplitude
