'use client'

import { useEffect, useState } from 'react'
import { Item } from '@/app/types/item'
import { itemsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import ItemsList from '@/components/items/items-list'
import { useAuth } from '@/components/AuthContext'
import { UserRole } from '@/enums/enum'
import AddEditItemDialog from '@/components/items/add-edit-item-dialog'
import { toast } from 'react-hot-toast'

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const { user } = useAuth()
  const isAdmin = user?.role === UserRole.ADMIN

  const fetchItems = async () => {
    try {
      const response = await itemsApi.getAllItems()
      if (response.success) {
        setItems(response.data || [])
      }
    } catch (error) {
      toast.error('Failed to fetch items')
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleAddItem = async (newItem: Item) => {
    await fetchItems()
    setIsAddDialogOpen(false)
    toast.success('Item added successfully')
  }

  const handleEditItem = (item: Item) => {
    setSelectedItem(item)
    setIsAddDialogOpen(true)
  }

  const handleDeleteItem = async (id: string) => {
    try {
      await itemsApi.deleteItem(id)
      toast.success('Item deleted successfully')
      await fetchItems()
    } catch (error) {
      toast.error('Failed to delete item')
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Items Management</h1>
        {isAdmin && (
          <Button
            onClick={() => {
              setSelectedItem(null)
              setIsAddDialogOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        )}
      </div>

      <ItemsList 
        items={items}
        onEdit={isAdmin ? handleEditItem : undefined}
        onDelete={isAdmin ? handleDeleteItem : undefined}
      />

      <AddEditItemDialog
        open={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false)
          setSelectedItem(null)
        }}
        onSuccess={handleAddItem}
        item={selectedItem}
      />
    </div>
  )
}