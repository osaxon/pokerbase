import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/squads/')({
  component: () => <div>Hello /squads/!</div>
})