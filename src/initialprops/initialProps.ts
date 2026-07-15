import { GetServerSidePropsResult } from 'next'

import { beskyttetSide } from '../auth/beskyttetSide'
import { isMockBackend } from '../utils/environment'

export const initialProps = beskyttetSide(async (): Promise<GetServerSidePropsPrefetchResult> => {
    return {
        props: {
            tidspunkt: new Date().getDate(),
            erMockBackend: isMockBackend(),
        },
    }
})

export interface PrefetchResults {
    tidspunkt: number
    erMockBackend: boolean
}

export type GetServerSidePropsPrefetchResult = GetServerSidePropsResult<PrefetchResults>
