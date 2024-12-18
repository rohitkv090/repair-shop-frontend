'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export default function RepairRecordForm() {
  const [customerName, setCustomerName] = useState('')
  const [expectedRepairDate, setExpectedRepairDate] = useState('')
  const [deviceTakenOn, setDeviceTakenOn] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [video, setVideo] = useState<File | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files))
    }
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideo(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically make an API call to create the repair record
    // For this example, we'll just log the data
    console.log('Submitting repair record:', {
      customerName,
      expectedRepairDate,
      deviceTakenOn,
      images,
      video
    })
    // Reset form after submission
    setCustomerName('')
    setExpectedRepairDate('')
    setDeviceTakenOn('')
    setImages([])
    setVideo(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Repair Record</CardTitle>
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
            <Label htmlFor="images">Images (optional)</Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="video">Video (optional)</Label>
            <Input
              id="video"
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">Create Repair Record</Button>
        </CardFooter>
      </form>
    </Card>
  )
}

