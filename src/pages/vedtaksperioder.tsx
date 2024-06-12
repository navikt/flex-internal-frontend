import React, { useState } from 'react'
import { Alert, Button } from '@navikt/ds-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'

import { initialProps } from '../initialprops/initialProps'
import FnrInput from '../components/FnrInput'
import { useVedtaksperioder } from '../queryhooks/useVedtaksperioder'
import { TidslinjeVedtaksperioder } from '../components/TidslinjeVedtaksperioder'
import { fetchJsonMedRequestId } from '../utils/fetch'
import { useInntektsmeldinger } from '../queryhooks/useInntektsmeldinger'
import { InntektsmeldingView } from '../components/Inntektsmeldinger'
import { isNotProd } from '../utils/environment'

const Vedtaksperioder = () => {
    const [fnr, setFnr] = useState<string>()

    const enabled = fnr !== undefined
    const { data: data, isLoading, isRefetching } = useVedtaksperioder(fnr, enabled)
    const { data: inntetksmeldinger, isRefetching: isRefetchingIm } = useInntektsmeldinger(fnr, enabled)
    const queryClient = useQueryClient()

    const cronJobMutation = useMutation<object, any, dayjs.Dayjs>({
        mutationFn: async (dato) => {
            return await fetchJsonMedRequestId<object>(
                `/api/flex-inntektsmelding-status/api/v1/cronjob?now=${dato.toISOString()}`,
                {
                    method: 'POST',
                },
            )
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['vedtaksperioder', fnr],
            })
            await queryClient.invalidateQueries({
                queryKey: ['inntektsmeldinger', fnr],
            })
        },
    })
    const DayButton = ({ days }: { days: number }) => (
        <Button
            size="small"
            variant="secondary"
            loading={cronJobMutation.isLoading}
            onClick={() => cronJobMutation.mutate(dayjs().add(days, 'day'))}
        >
            {days} dager
        </Button>
    )
    return (
        <div className="flex-row space-y-4">
            <FnrInput setFnr={setFnr} />
            <div className="space-x-2">
                <Button
                    size="small"
                    variant="secondary"
                    loading={isRefetching}
                    onClick={async () => {
                        await queryClient.invalidateQueries({
                            queryKey: ['vedtaksperioder', fnr],
                        })
                        await queryClient.invalidateQueries({
                            queryKey: ['inntektsmeldinger', fnr],
                        })
                    }}
                >
                    Reload
                </Button>
                {isNotProd() && (
                    <>
                        <DayButton days={0} />
                        <DayButton days={1} />
                        <DayButton days={14} />
                        <DayButton days={15} />
                        <DayButton days={27} />
                        <DayButton days={28} />
                    </>
                )}
            </div>
            {cronJobMutation.data && (
                <Alert
                    variant="info"
                    closeButton={true}
                    onClose={() => {
                        cronJobMutation.reset()
                    }}
                >
                    <pre>{JSON.stringify(cronJobMutation.data, null, 2)}</pre>
                </Alert>
            )}
            {isRefetching && enabled && <span>Oppdaterer...</span>}
            {isLoading && enabled && <span>Laster...</span>}
            {!isRefetching && data && data.length === 0 && <span>Ingen vedtaksperioder</span>}
            {!isRefetchingIm && typeof inntetksmeldinger !== 'undefined' && (
                <InntektsmeldingView inntektsmeldinger={inntetksmeldinger} />
            )}
            {!isRefetching && data && data.length > 0 && <TidslinjeVedtaksperioder vedtaksperioder={data} />}
        </div>
    )
}

export const getServerSideProps = initialProps

export default Vedtaksperioder
