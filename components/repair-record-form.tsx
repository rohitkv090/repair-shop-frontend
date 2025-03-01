'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react"
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'
import { MediaCapture } from './MediaCapture'
import AddEditItemDialog from './items/add-edit-item-dialog'
import { Item } from '@/app/types/item'

interface RepairItem {
  itemId: number;
  quantity: number;
  description?: string;
  price: number;
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function RepairRecordForm() {
  const [isMounted, setIsMounted] = useState(false);
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const { token } = useAuth();
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerNumber: '',
    expectedRepairDate: formatDateForInput(new Date()),
    deviceTakenOn: formatDateForInput(new Date()),
    deviceCompany: '',
    deviceModel: '',
    deviceColor: '',
    devicePassword: '',
    deviceIssue: '',
    description: '',
    estimatedCost: '',
    advanceAmount: '',
    assignedToId: '',
  })

  // Helper function to format date for datetime-local input
  function formatDateForInput(date: Date): string {
    if (!isMounted) return '';
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  }

  useEffect(() => {
    setIsMounted(true);
    // Update dates after mounting to ensure client-side formatting
    if (!formData.expectedRepairDate || !formData.deviceTakenOn) {
      setFormData(prev => ({
        ...prev,
        expectedRepairDate: formatDateForInput(new Date()),
        deviceTakenOn: formatDateForInput(new Date()),
      }));
    }

    // Fetch available items
    const fetchItems = async () => {
      try {
        const response = await fetch('http://localhost:4000/items', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setAvailableItems(data.data);
        } else {
          console.error('Failed to fetch items:', data.message);
        }
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    if (token) {
      fetchItems();
    }
  }, [token]);

  const [showDeviceInfo, setShowDeviceInfo] = useState(false)
  const [repairItems, setRepairItems] = useState<RepairItem[]>([])
  const [images, setImages] = useState<File[]>([])
  const [videos, setVideos] = useState<File[]>([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateFile = (file: File, type: 'image' | 'video'): boolean => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File ${file.name} is too large. Maximum size is 10MB`);
      return false;
    }

    // Check file type
    const acceptedTypes = type === 'image' ? ACCEPTED_IMAGE_TYPES : ACCEPTED_VIDEO_TYPES;
    if (!acceptedTypes.includes(file.type)) {
      toast.error(`File ${file.name} has unsupported format. Accepted formats: ${acceptedTypes.join(', ')}`);
      return false;
    }

    return true;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'images' | 'videos') => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(file => validateFile(file, type === 'images' ? 'image' : 'video'));
      if (type === 'images') {
        setImages(prev => [...prev, ...files]);
      } else {
        setVideos(prev => [...prev, ...files]);
      }
    }
  };

  const handleMediaCapture = (file: File, type: 'image' | 'video') => {
    if (validateFile(file, type)) {
      if (type === 'image') {
        setImages(prev => [...prev, file]);
      } else {
        setVideos(prev => [...prev, file]);
      }
    }
  };

  const addRepairItem = () => {
    setRepairItems(prev => [...prev, { itemId: 0, quantity: 1, price: 0 }])
  }

  const updateRepairItem = (index: number, field: keyof RepairItem, value: any) => {
    setRepairItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ))
  }

  const removeRepairItem = (index: number) => {
    setRepairItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleAddNewItem = (newItem: Item) => {
    // Add the newly created item to the available items list
    setAvailableItems(prev => [...prev, newItem]);
    toast.success('New item created successfully');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formDataToSend = new FormData()
    
    // Add basic fields
    formDataToSend.append('customerName', formData.customerName)
    formDataToSend.append('customerNumber', formData.customerNumber)
    formDataToSend.append('expectedRepairDate', formData.expectedRepairDate.split('T')[0])
    formDataToSend.append('deviceTakenOn', formData.deviceTakenOn.split('T')[0])
    
    if (formData.deviceCompany) formDataToSend.append('deviceCompany', formData.deviceCompany)
    if (formData.deviceModel) formDataToSend.append('deviceModel', formData.deviceModel)
    if (formData.deviceColor) formDataToSend.append('deviceColor', formData.deviceColor)
    if (formData.devicePassword) formDataToSend.append('devicePassword', formData.devicePassword)
    if (formData.deviceIssue) formDataToSend.append('deviceIssue', formData.deviceIssue)
    if (formData.description) formDataToSend.append('description', formData.description)
    if (formData.estimatedCost) formDataToSend.append('estimatedCost', formData.estimatedCost)
    if (formData.advanceAmount) formDataToSend.append('advanceAmount', formData.advanceAmount)
    
    // Add repair items including price
    const filteredRepairItems = repairItems.filter(item => item.itemId > 0).map(item => ({
      itemId: item.itemId,
      quantity: item.quantity,
      description: item.description,
      price: item.price
    }))
    if (filteredRepairItems.length > 0) {
      formDataToSend.append('repairItems', JSON.stringify(filteredRepairItems))
    }
    
    // Add files
    images.forEach(image => {
      formDataToSend.append('images', image)
    })
    
    videos.forEach(video => {
      formDataToSend.append('videos', video)
    })

    try {
      const response = await fetch('http://localhost:4000/repair-records', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Remove Content-Type header - it will be automatically set with correct boundary for FormData
        },
        body: formDataToSend
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Repair record created successfully');
        // Reset form
        setFormData({
          customerName: '',
          customerNumber: '',
          expectedRepairDate: formatDateForInput(new Date()),
          deviceTakenOn: formatDateForInput(new Date()),
          deviceCompany: '',
          deviceModel: '',
          deviceColor: '',
          devicePassword: '',
          deviceIssue: '',
          description: '',
          estimatedCost: '',
          advanceAmount: '',
          assignedToId: '',
        });
        setRepairItems([]);
        setImages([]);
        setVideos([]);
      } else {
        toast.error(data.message || 'Failed to create repair record');
      }
    } catch (error) {
      console.error('Error submitting repair record:', error);
      toast.error('Failed to create repair record');
    }
  }

  if (!isMounted) {
    return null; // or a loading state
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Required Information Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="customerName">Customer Name*</Label>
          <Input
            id="customerName"
            name="customerName"
            value={formData.customerName}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="customerNumber">Customer Number*</Label>
          <Input
            id="customerNumber"
            name="customerNumber"
            value={formData.customerNumber}
            onChange={handleInputChange}
            required
            pattern="[6-9][0-9]{9}"
            title="Please enter a valid 10-digit Indian phone number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectedRepairDate">Expected Repair Date*</Label>
          <Input
            id="expectedRepairDate"
            name="expectedRepairDate"
            type="datetime-local"
            value={formData.expectedRepairDate}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="deviceTakenOn">Device Taken On*</Label>
          <Input
            id="deviceTakenOn"
            name="deviceTakenOn"
            type="datetime-local"
            value={formData.deviceTakenOn}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="deviceIssue">Device Issue*</Label>
          <Textarea
            id="deviceIssue"
            name="deviceIssue"
            value={formData.deviceIssue}
            onChange={handleInputChange}
            required
            className="min-h-[100px]"
          />
        </div>
      </div>

      {/* Device Information Section */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <button
          type="button"
          className="flex items-center justify-between w-full text-left"
          onClick={() => setShowDeviceInfo(!showDeviceInfo)}
        >
          <span className="text-sm font-medium">Additional Device Information</span>
          {showDeviceInfo ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {showDeviceInfo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="deviceCompany">Device Company</Label>
              <Input
                id="deviceCompany"
                name="deviceCompany"
                value={formData.deviceCompany}
                onChange={handleInputChange}
                placeholder="e.g., Apple, Samsung"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deviceModel">Device Model</Label>
              <Input
                id="deviceModel"
                name="deviceModel"
                value={formData.deviceModel}
                onChange={handleInputChange}
                placeholder="e.g., iPhone 13, Galaxy S21"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deviceColor">Device Color</Label>
              <Input
                id="deviceColor"
                name="deviceColor"
                value={formData.deviceColor}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="devicePassword">Device Password</Label>
              <Input
                id="devicePassword"
                name="devicePassword"
                type="password"
                value={formData.devicePassword}
                onChange={handleInputChange}
                placeholder="Device unlock password"
              />
            </div>
          </div>
        )}
      </div>

      {/* Updated Repair Items Section */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <Label>Repair Items</Label>
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => setIsAddItemDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" /> Create New Item
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={addRepairItem}>
              Add Item
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          {repairItems.map((item, index) => (
            <div key={index} className="flex gap-4 items-end">
              <div className="flex-1">
                <Label>Item</Label>
                <Select 
                  value={item.itemId.toString()} 
                  onValueChange={(value) => {
                    const selectedItemId = Number(value);
                    updateRepairItem(index, 'itemId', selectedItemId);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableItems.map(item => (
                      <SelectItem 
                        key={item.id} 
                        value={item.id.toString()}
                      >
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {item.itemId > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {availableItems.find(i => parseInt(i.id) === item.itemId)?.description}
                  </p>
                )}
              </div>
              <div className="w-32">
                <Label>Price (₹)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.price}
                  onChange={(e) => updateRepairItem(index, 'price', Number(e.target.value))}
                  required
                />
              </div>
              <div className="w-24">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateRepairItem(index, 'quantity', Number(e.target.value))}
                />
              </div>
              <div className="flex-1">
                <Label>Notes</Label>
                <Input
                  value={item.description || ''}
                  onChange={(e) => updateRepairItem(index, 'description', e.target.value)}
                  placeholder="Optional notes about this item"
                />
              </div>
              <Button 
                type="button" 
                variant="destructive"
                size="sm"
                onClick={() => removeRepairItem(index)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="estimatedCost">Estimated Cost</Label>
          <Input
            id="estimatedCost"
            name="estimatedCost"
            type="number"
            min="0"
            value={formData.estimatedCost}
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="advanceAmount">Advance Amount</Label>
          <Input
            id="advanceAmount"
            name="advanceAmount"
            type="number"
            min="0"
            value={formData.advanceAmount}
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* Media Upload Section */}
      <div className="space-y-4">
        <Label>Media</Label>
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Images (JPG, PNG, WebP - max 10MB)</Label>
                <Input
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(',')}
                  multiple
                  onChange={(e) => handleFileUpload(e, 'images')}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Videos (MP4, WebM - max 10MB)</Label>
                <Input
                  type="file"
                  accept={ACCEPTED_VIDEO_TYPES.join(',')}
                  multiple
                  onChange={(e) => handleFileUpload(e, 'videos')}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Or use camera</Label>
              <MediaCapture onCapture={handleMediaCapture} />
            </div>

            {/* Preview section */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Image Preview</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {images.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label>Video Preview</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {videos.map((file, index) => (
                    <div key={index} className="relative group">
                      <video
                        src={URL.createObjectURL(file)}
                        className="w-full h-32 object-cover rounded-lg"
                        controls
                      />
                      <button
                        type="button"
                        onClick={() => setVideos(prev => prev.filter((_, i) => i !== index))}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Additional Notes</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Any additional information about the repair"
          className="min-h-[100px]"
        />
      </div>

      <Button type="submit" className="w-full">Create Repair Record</Button>

      {/* Add New Item Dialog */}
      <AddEditItemDialog
        open={isAddItemDialogOpen}
        onClose={() => setIsAddItemDialogOpen(false)}
        onSuccess={handleAddNewItem}
        item={null}
      />
    </form>
  )
}

