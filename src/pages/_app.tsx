import '../style/global.css'
import 'react-json-view-lite/dist/index.css'

import type { AppProps } from 'next/app'
import React, { useState } from 'react'
import Head from 'next/head'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Dropdown, InternalHeader } from '@navikt/ds-react'
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

    const sider = {
        '/': 'Vis tidslinje av søknader',
        '/ident': 'Slå opp fnr og aktor-ID',
        '/soknad-til-fnr': 'Konverter søknad til fnr',
        '/soknad-kafkaformat': 'Vis sykepengesøknad på Kafka-format',
        '/friskmeldt': 'Friskmeldt Til Arbeidsformidling',
        '/aareg': 'Se rådata fra Aa-registeret',
        '/sigrun': 'Se rådata fra Sigrun',
        '/arbeidssoker': 'Se rådata fra arbeidssøkerregisteret',
        '/vedtaksperioder': 'Vis vedtaksperioder fra flex-inntektsmelding-status',
        '/ventetid': 'Vis ventetid fra flex-syketilfelle',
        '/amplitude': 'Amplitude',
    }

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
                    <InternalHeader.Title as="h2">{sider[router.pathname as keyof typeof sider]}</InternalHeader.Title>

                    <Dropdown>
                        <InternalHeader.UserButton as={Dropdown.Toggle} name="Velg en underside" className="ml-auto" />
                        <Dropdown.Menu>
                            <Dropdown.Menu.List>
                                {Object.entries(sider).map(([url, side]) => (
                                    <Dropdown.Menu.List.Item
                                        key={url}
                                        onClick={() => {
                                            router.push(url)
                                        }}
                                    >
                                        {side}
                                    </Dropdown.Menu.List.Item>
                                ))}
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
