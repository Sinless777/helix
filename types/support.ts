export type SupportTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'ESCALATED'

export type SupportTicket = {
  id: string
  userId: string
  title: string
  description: string
  status: SupportTicketStatus
  createdAt: number
  updatedAt: number
  assigneeId?: string | null
}
