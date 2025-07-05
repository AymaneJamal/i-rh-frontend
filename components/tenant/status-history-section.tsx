// components/tenant/status-history-section.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { StatusHistoryItem } from "@/lib/api/tenant-status"
import { formatDate } from "@/lib/formatters"
import {
  RefreshCw,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Info
} from "lucide-react"

interface StatusHistorySectionProps {
  statusHistory: StatusHistoryItem[]
  loading: boolean
  error: string | null
  onRefresh: () => void
}

const getStatusIcon = (status: string) => {
  switch (status.toUpperCase()) {
    case 'CREATED':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'ACTIVE':
      return <Play className="h-4 w-4 text-blue-600" />
    case 'SUSPENDED':
      return <Pause className="h-4 w-4 text-red-600" />
    case 'PENDING':
      return <Clock className="h-4 w-4 text-yellow-600" />
    case 'INACTIVE':
      return <XCircle className="h-4 w-4 text-gray-600" />
    default:
      return <Info className="h-4 w-4 text-gray-600" />
  }
}

const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case 'CREATED':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'ACTIVE':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'SUSPENDED':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'INACTIVE':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const formatTimestamp = (timestamp: string): string => {
  // Handle both ISO string and timestamp formats
  const date = isNaN(Number(timestamp)) 
    ? new Date(timestamp) 
    : new Date(Number(timestamp))
  
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function StatusHistorySection({ 
  statusHistory, 
  loading, 
  error, 
  onRefresh 
}: StatusHistorySectionProps) {
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Historique des Statuts
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Historique des Statuts
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Chargement de l'historique...</span>
          </div>
        ) : statusHistory.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun historique de statut disponible</p>
          </div>
        ) : (
          <div className="space-y-4">
            {statusHistory.map((item, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                {/* Status Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(item.newStatus)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(item.previousStatus)}
                        >
                          {item.previousStatus}
                        </Badge>
                        <span className="text-gray-400">→</span>
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(item.newStatus)}
                        >
                          {item.newStatus}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-900 mb-1">
                        <strong>Raison:</strong> {item.reason}
                      </p>
                      
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {item.changedBy}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimestamp(item.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}