// REMPLACER COMPLÈTEMENT le contenu de components/modals/subscription-modal.tsx

"use client"

import { AssignPlanModal } from "./assign-plan-modal"

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  tenantId: string
  tenantName: string
  onSubscriptionAssigned: () => void
}

export function SubscriptionModal(props: SubscriptionModalProps) {
  return <AssignPlanModal {...props} onPlanAssigned={props.onSubscriptionAssigned} />
}