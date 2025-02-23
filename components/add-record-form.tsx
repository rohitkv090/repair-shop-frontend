"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AddRecordForm() {
  const [customerName, setCustomerName] = useState("");
  const [expectedRepairDate, setExpectedRepairDate] = useState("");
  const [deviceTakenOn, setDeviceTakenOn] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [customerNumber, setCustomerNumber] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideo(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare the FormData object
    const formData = new FormData();
    formData.append("customerName", customerName);
    formData.append("expectedRepairDate", expectedRepairDate);
    formData.append("deviceTakenOn", deviceTakenOn);
    formData.append("description", description);
    formData.append("customerNumber", customerNumber);

    // Append images (can be multiple)
    images.forEach((image) => {
      formData.append("images", image);
    });

    // Append video (can be one or multiple, in case of multiple upload)
    if (video) {
      formData.append("videos", video);
    }

    // Make the API request
    try {
      const response = await fetch("http://localhost:4000/repair-records", {
        method: "POST",
        headers: {
          Authorization: "Bearer your-token-here", // Replace with your actual token
        },
        body: formData, // Send the FormData
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Record added successfully:", data);
      } else {
        console.error("Failed to add record:", data.message);
      }
    } catch (error) {
      console.error("Error submitting the form:", error);
    }

    // Reset form after submission
    setCustomerName("");
    setExpectedRepairDate("");
    setDeviceTakenOn("");
    setDescription("");
    setImages([]);
    setVideo(null);
    setCustomerNumber("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="customerName">Customer Name</Label>
        <Input
          id="customerName"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="customerNumber">Customer Mobile Number</Label>
        <Input
          id="customerNumber"
          value={customerNumber}
          onChange={(e) => setCustomerNumber(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="expectedRepairDate">Expected Repair Date</Label>
        <Input
          id="expectedRepairDate"
          type="date"
          value={expectedRepairDate}
          onChange={(e) => setExpectedRepairDate(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="deviceTakenOn">Device Taken On</Label>
        <Input
          id="deviceTakenOn"
          type="date"
          value={deviceTakenOn}
          onChange={(e) => setDeviceTakenOn(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
  );
}
