import { Component } from 'react'
import { RotateCwIcon, TriangleAlertIcon } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@renderer/components/ui/empty'

// Keeps a failing page from leaving the window blank: the failure is shown with a way to reload.
// The texts come in as properties because the boundary must work even when a provider failed.
export class PageErrorBoundary extends Component<
  { title: string; action: string; children: React.ReactNode },
  { message: string | null }
> {
  state = { message: null as string | null }

  static getDerivedStateFromError(error: unknown): { message: string } {
    return { message: error instanceof Error ? error.message : String(error) }
  }

  render(): React.ReactNode {
    if (this.state.message === null) return this.props.children
    return (
      <div className="p-4 md:p-6">
        <Empty className="min-h-72 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TriangleAlertIcon />
            </EmptyMedia>
            <EmptyTitle>{this.props.title}</EmptyTitle>
            <EmptyDescription>{this.state.message}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => window.location.reload()}>
              <RotateCwIcon data-icon="inline-start" />
              {this.props.action}
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }
}
