import React, { Component, ReactNode } from 'react'

interface ErrorBoundaryState {
    harFeil: boolean
    feilmelding?: string
}

interface ErrorBoundaryProps {
    children: ReactNode
}

export default class TidslinjeErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { harFeil: false }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        if (error.message?.includes('Invalid array length')) {
            return {
                harFeil: true,
                feilmelding: 'Tidslinje har for stort dataspenn. Prøv å begrense datoområdet.',
            }
        }

        return {
            harFeil: true,
            feilmelding: 'Feil ved lasting av tidslinje',
        }
    }

    render() {
        if (this.state.harFeil) {
            return (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                    <h3 className="text-red-800 font-semibold mb-2">Feil ved visning av tidslinje</h3>
                    <p className="text-red-700">{this.state.feilmelding}</p>
                </div>
            )
        }

        return this.props.children
    }
}
