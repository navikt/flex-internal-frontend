import '../style/global.css'

import type { AppProps } from 'next/app'
import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { InternalHeader, Modal } from '@navikt/ds-react'

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        /* Setting this to true causes the request to be immediately executed after initial
                           mount Even if the query had data hydrated from the server side render */
                        refetchOnMount: false,
                        refetchOnWindowFocus: false,
                    },
                },
            }),
    )

    useEffect(() => {
        Modal.setAppElement('#__next')
    }, [])

    return (
        <>
            <Head>
                <title>Flex internal frontend</title>
                <meta name="robots" content="noindex" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <QueryClientProvider client={queryClient}>
                <InternalHeader>
                    <InternalHeader.Title as="h1">Flex internal frontend</InternalHeader.Title>
                </InternalHeader>
                <div id="root" className="mx-auto p-4 pb-32">
                    <Component {...pageProps} />
                </div>
            </QueryClientProvider>
        </>
    )
}

export default MyApp
