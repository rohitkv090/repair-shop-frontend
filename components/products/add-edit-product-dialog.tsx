import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Product } from '@/app/types/product'
import { productsApi } from '@/lib/products-api'
import { Loader2 } from 'lucide-react'

interface AddEditProductDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: (product: Product) => void
  product?: Product | null
}

export default function AddEditProductDialog({
  open,
  onClose,
  onSuccess,
  product
}: AddEditProductDialogProps) {
  const [formData, setFormData] = useState({
    name: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name
      })
    } else {
      setFormData({
        name: ''
      })
    }
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const productData = {
        name: formData.name
      }

      let response
      if (product) {
        response = await productsApi.updateProduct(product.id, productData)
      } else {
        response = await productsApi.createProduct(productData)
      }

      if (response.success && response.data) {
        onSuccess(response.data)
      }
    } catch (error) {
      console.error('Failed to save product:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter product name"
              required
            />
          </div>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}