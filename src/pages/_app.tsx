import '../style/global.css'

import type { AppProps } from 'next/app'
import React, { useState } from 'react'
import Head from 'next/head'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Dropdown, InternalHeader, Spacer } from '@navikt/ds-react'
import { useRouter } from 'next/router'

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
    const router = useRouter()

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
                    <Spacer />
                    <Dropdown>
                        <InternalHeader.UserButton as={Dropdown.Toggle} name="Velg en underside" />
                        <Dropdown.Menu>
                            <Dropdown.Menu.List>
                                <Dropdown.Menu.List.Item
                                    onClick={() => {
                                        router.push('/')
                                    }}
                                >
                                    Tidslinje av søknader
                                </Dropdown.Menu.List.Item>
                                <Dropdown.Menu.List.Item
                                    onClick={() => {
                                        router.push('/ident')
                                    }}
                                >
                                    Slå opp fnr og aktor id
                                </Dropdown.Menu.List.Item>
                                <Dropdown.Menu.List.Item
                                    onClick={() => {
                                        router.push('/republiser')
                                    }}
                                >
                                    Republiser søknad
                                </Dropdown.Menu.List.Item>
                            </Dropdown.Menu.List>
                        </Dropdown.Menu>
                    </Dropdown>
                </InternalHeader>
                <div id="root" className="mx-auto p-4 pb-32">
                    <Component {...pageProps} />
                </div>
            </QueryClientProvider>
        </>
    )
}

export default MyApp
