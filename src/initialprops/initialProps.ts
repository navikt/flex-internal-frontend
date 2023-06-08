import { GetServerSidePropsResult } from 'next'

import { beskyttetSide } from '../auth/beskyttetSide'

export const initialProps = beskyttetSide(async (): Promise<GetServerSidePropsPrefetchResult> => {
    return {
        props: {
            tidspunkt: new Date().getDate(),
        },
    }
})

export interface PrefetchResults {
    tidspunkt: number
}

export type GetServerSidePropsPrefetchResult = GetServerSidePropsResult<PrefetchResults>
