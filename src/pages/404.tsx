import { Page } from '@navikt/ds-react'
import React, { JSX } from 'react'

function NotFound(): JSX.Element {
    return (
        <Page>
            <Page.Block width="xl">
                <div>Fant ikke siden</div>
            </Page.Block>
        </Page>
    )
}

export default NotFound
