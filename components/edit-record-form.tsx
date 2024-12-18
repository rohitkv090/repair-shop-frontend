'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface Record {
  id: number
  customerName: string
  expectedRepairDate: string
  deviceTakenOn: string
  description: string
}

interface EditRecordFormProps {
  record: Record
  onUpdate: (updatedRecord: Record) => void
  onCancel: () => void
}

export default function EditRecordForm({ record, onUpdate, onCancel }: EditRecordFormProps) {
  const [customerName, setCustomerName] = useState(record.customerName)
  const [expectedRepairDate, setExpectedRepairDate] = useState(record.expectedRepairDate)
  const [deviceTakenOn, setDeviceTakenOn] = useState(record.deviceTakenOn)
  const [description, setDescription] = useState(record.description)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const updatedRecord: Record = {
      ...record,
      customerName,
      expectedRepairDate,
      deviceTakenOn,
      description,
    }
    onUpdate(updatedRecord)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Record</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expectedRepairDate">Expected Repair Date</Label>
            <Input
              id="expectedRepairDate"
              type="date"
              value={expectedRepairDate}
              onChange={(e) => setExpectedRepairDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deviceTakenOn">Device Taken On</Label>
            <Input
              id="deviceTakenOn"
              type="date"
              value={deviceTakenOn}
              onChange={(e) => setDeviceTakenOn(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Update Record</Button>
        </CardFooter>
      </form>
    </Card>
  )
}

