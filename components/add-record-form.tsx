'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function AddRecordForm() {
  const [customerName, setCustomerName] = useState('')
  const [expectedRepairDate, setExpectedRepairDate] = useState('')
  const [deviceTakenOn, setDeviceTakenOn] = useState('')
  const [description, setDescription] = useState('')
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
    // Simulate API call to add record
    console.log('Adding new record:', { customerName, expectedRepairDate, deviceTakenOn, description, images, video })
    // Reset form after submission
    setCustomerName('')
    setExpectedRepairDate('')
    setDeviceTakenOn('')
    setDescription('')
    setImages([])
    setVideo(null)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="customerName">Customer Name</Label>
        <Input
          id="customerName"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="expectedRepairDate">Expected Repair Date</Label>
        <Input
          id="expectedRepairDate"
          type="date"
          value={expectedRepairDate}
          onChange={(e) => setExpectedRepairDate(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="deviceTakenOn">Device Taken On</Label>
        <Input
          id="deviceTakenOn"
          type="date"
          value={deviceTakenOn}
          onChange={(e) => setDeviceTakenOn(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="images">Images (optional)</Label>
        <Input
          id="images"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
        />
      </div>
      <div>
        <Label htmlFor="video">Video (optional)</Label>
        <Input
          id="video"
          type="file"
          accept="video/*"
          onChange={handleVideoUpload}
        />
      </div>
      <Button type="submit">Add Record</Button>
    </form>
  )
}

