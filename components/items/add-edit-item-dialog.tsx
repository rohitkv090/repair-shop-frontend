import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Item, CreateItemDto, UpdateItemDto } from '@/app/types/item'
import { itemsApi } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface AddEditItemDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: (item: Item) => void
  item?: Item | null
}

export default function AddEditItemDialog({
  open,
  onClose,
  onSuccess,
  item
}: AddEditItemDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description
      })
    } else {
      setFormData({
        name: '',
        description: ''
      })
    }
  }, [item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const itemData = {
        name: formData.name,
        description: formData.description
      }

      let response
      if (item) {
        // Update existing item
        response = await itemsApi.updateItem(item.id, itemData as UpdateItemDto)
      } else {
        // Create new item
        response = await itemsApi.createItem(itemData as CreateItemDto)
      }

      if (response.success && response.data) {
        onSuccess(response.data)
        onClose()
      }
    } catch (error) {
      toast.error(item ? 'Failed to update item' : 'Failed to create item')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              type="button" 
              disabled={isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? 'Saving...' : item ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}