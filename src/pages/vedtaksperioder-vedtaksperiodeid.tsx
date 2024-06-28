import React, { useState } from 'react'
import { Button, TextField } from '@navikt/ds-react'
import { useQueryClient } from '@tanstack/react-query'

import { initialProps } from '../initialprops/initialProps'
import { useVedtaksperioder } from '../queryhooks/useVedtaksperioder'
import { TidslinjeVedtaksperioder } from '../components/TidslinjeVedtaksperioder'

const Vedtaksperioder = () => {
    const [vedtaksperiodeId, setVedtaksperiodeId] = useState<string>()

    const enabled = vedtaksperiodeId !== undefined
    const { data: data, isLoading, isRefetching } = useVedtaksperioder(undefined, vedtaksperiodeId, enabled)
    const queryClient = useQueryClient()

    function VedtaksperiodeInput({ vedtaksperiodeId }: { vedtaksperiodeId: (fnr: any) => void }) {
        return (
            <TextField
                label="vedtaksperiode"
                onChange={(e) => {
                    e.target.value.length == 36 ? vedtaksperiodeId(e.target.value) : vedtaksperiodeId(undefined)
                }}
            />
        )
    }

    return (
        <div className="flex-row space-y-4">
            <VedtaksperiodeInput vedtaksperiodeId={setVedtaksperiodeId} />

            <div className="space-x-2">
                <Button
                    size="small"
                    variant="secondary"
                    loading={isRefetching}
                    onClick={async () => {
                        await queryClient.invalidateQueries({
                            queryKey: ['vedtaksperioder', vedtaksperiodeId],
                        })
                        await queryClient.invalidateQueries({
                            queryKey: ['inntektsmeldinger', vedtaksperiodeId],
                        })
                    }}
                >
                    Reload
                </Button>
            </div>

            {isRefetching && enabled && <span>Oppdaterer...</span>}
            {isLoading && enabled && <span>Laster...</span>}
            {!isRefetching && data && data.length === 0 && <span>Ingen vedtaksperioder</span>}

            {!isRefetching && data && data.length > 0 && <TidslinjeVedtaksperioder vedtaksperioder={data} />}
        </div>
    )
}

export const getServerSideProps = initialProps

export default Vedtaksperioder
