"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Save } from "lucide-react"

interface DoctorNotesProps {
  patientId: string
  patientName: string
  onSave?: (notes: string) => void
}

export function DoctorNotes({ patientId, patientName, onSave }: DoctorNotesProps) {
  const [notes, setNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!notes.trim()) return
    
    setIsSaving(true)
    try {
      // Here you would typically save to a doctor_notes table
      // For now, we'll just call the onSave callback
      if (onSave) {
        await onSave(notes)
      }
      setNotes("")
    } catch (error) {
      console.error('Error saving notes:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Doctor Notes
        </CardTitle>
        <CardDescription>
          Add notes or prescriptions for {patientName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Enter your notes, observations, or prescriptions here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[120px]"
        />
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={!notes.trim() || isSaving}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Notes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
