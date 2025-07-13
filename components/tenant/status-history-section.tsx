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
  Info,
  ArrowRight,
  Calendar
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
      return <CheckCircle className="h-5 w-5 text-green-600" />
    case 'ACTIVE':
      return <Play className="h-5 w-5 text-blue-600" />
    case 'SUSPENDED':
      return <Pause className="h-5 w-5 text-red-600" />
    case 'PENDING':
      return <Clock className="h-5 w-5 text-yellow-600" />
    case 'INACTIVE':
      return <XCircle className="h-5 w-5 text-gray-600" />
    default:
      return <Info className="h-5 w-5 text-gray-600" />
  }
}

const getStatusBadgeColor = (status: string) => {
  switch (status.toUpperCase()) {
    case 'CREATED':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'ACTIVE':
      return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'SUSPENDED':
      return 'bg-red-100 text-red-800 border-red-300'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'INACTIVE':
      return 'bg-gray-100 text-gray-800 border-gray-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

const getStatusDisplayName = (status: string) => {
  switch (status.toUpperCase()) {
    case 'CREATED':
      return 'Créé'
    case 'ACTIVE':
      return 'Actif'
    case 'SUSPENDED':
      return 'Suspendu'
    case 'PENDING':
      return 'En attente'
    case 'INACTIVE':
      return 'Inactif'
    default:
      return status
  }
}

const formatTimestamp = (timestamp: string): { date: string; time: string; relative: string } => {
  const date = isNaN(Number(timestamp)) 
    ? new Date(timestamp) 
    : new Date(Number(timestamp))
  
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  let relative = ""
  if (diffInMinutes < 1) {
    relative = "À l'instant"
  } else if (diffInMinutes < 60) {
    relative = `Il y a ${diffInMinutes}min`
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60)
    relative = `Il y a ${hours}h`
  } else {
    const days = Math.floor(diffInMinutes / 1440)
    relative = `Il y a ${days}j`
  }
  
  return {
    date: date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    time: date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    relative
  }
}

export function StatusHistorySection({ 
  statusHistory, 
  loading, 
  error, 
  onRefresh 
}: StatusHistorySectionProps) {
  
  // CORRECTION: Trier du plus récent au plus ancien
  const sortedHistory = [...statusHistory].sort((a, b) => {
    const timestampA = isNaN(Number(a.timestamp)) ? new Date(a.timestamp).getTime() : Number(a.timestamp)
    const timestampB = isNaN(Number(b.timestamp)) ? new Date(b.timestamp).getTime() : Number(b.timestamp)
    return timestampB - timestampA // Tri décroissant (plus récent en premier)
  })
  
  if (error) {
    return (
      <Card className="border-red-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-red-800">
              <AlertCircle className="h-5 w-5 mr-2" />
              Historique des Statuts
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onRefresh} className="border-red-200">
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
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-slate-800">
            <Clock className="h-5 w-5 mr-2 text-blue-600" />
            Historique des Statuts
            {sortedHistory.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-sm font-normal rounded-full">
                {sortedHistory.length} {sortedHistory.length === 1 ? 'entrée' : 'entrées'}
              </span>
            )}
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={loading}
            className="hover:bg-blue-50 hover:border-blue-300"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin mr-3 text-blue-600" />
            <span className="text-slate-600">Chargement de l'historique...</span>
          </div>
        ) : sortedHistory.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg font-medium mb-2">Aucun historique disponible</p>
            <p className="text-slate-400 text-sm">Les changements de statut apparaîtront ici</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedHistory.map((item, index) => {
              const timeInfo = formatTimestamp(item.timestamp)
              const isRecent = index < 3 // Marquer les 3 premiers comme récents
              
              return (
                <div 
                  key={index} 
                  className={`p-6 hover:bg-slate-50 transition-colors duration-200 ${
                    isRecent ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Timeline indicator */}
                    <div className="flex flex-col items-center">
                      <div className={`
                        flex items-center justify-center w-10 h-10 rounded-full border-2 
                        ${getStatusBadgeColor(item.newStatus)} border-current
                      `}>
                        {getStatusIcon(item.newStatus)}
                      </div>
                      {index < sortedHistory.length - 1 && (
                        <div className="w-0.5 h-8 bg-slate-200 mt-2"></div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-3">
                      {/* Status transition */}
                      <div className="flex items-center space-x-3 flex-wrap">
                        <Badge 
                          variant="outline" 
                          className={`${getStatusBadgeColor(item.previousStatus)} font-medium`}
                        >
                          {getStatusDisplayName(item.previousStatus)}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                        <Badge 
                          variant="outline" 
                          className={`${getStatusBadgeColor(item.newStatus)} font-medium`}
                        >
                          {getStatusDisplayName(item.newStatus)}
                        </Badge>
                        {isRecent && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            Récent
                          </span>
                        )}
                      </div>
                      
                      {/* Reason */}
                      <div className="bg-white border border-slate-200 rounded-lg p-3">
                        <p className="text-slate-900 font-medium text-sm mb-1">Raison du changement</p>
                        <p className="text-slate-700 text-sm leading-relaxed">{item.reason}</p>
                      </div>
                      
                      {/* Metadata */}
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span className="font-medium">{item.changedBy}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{timeInfo.date} à {timeInfo.time}</span>
                          </div>
                        </div>
                        <span className="bg-slate-100 px-2 py-1 rounded-full font-medium">
                          {timeInfo.relative}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}