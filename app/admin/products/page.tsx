'use client'

import { useEffect, useState } from 'react'
import { Product } from '@/app/types/product'
import { productsApi } from '@/lib/products-api'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import ProductsList from '@/components/products/products-list'
import { useAuth } from '@/components/AuthContext'
import { UserRole } from '@/enums/enum'
import AddEditProductDialog from '@/components/products/add-edit-product-dialog'
import { toast } from 'react-hot-toast'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { user } = useAuth()
  const isAdmin = user?.role === UserRole.ADMIN

  const fetchProducts = async () => {
    try {
      const response = await productsApi.getAllProducts()
      if (response.success) {
        setProducts(response.data || [])
      }
    } catch (error) {
      toast.error('Failed to fetch products')
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleAddProduct = async (newProduct: Product) => {
    await fetchProducts()
    setIsAddDialogOpen(false)
    toast.success('Product added successfully')
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsAddDialogOpen(true)
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      await productsApi.deleteProduct(id)
      toast.success('Product deleted successfully')
      await fetchProducts()
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products Management</h1>
        {isAdmin && (
          <Button
            onClick={() => {
              setSelectedProduct(null)
              setIsAddDialogOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        )}
      </div>

      <ProductsList 
        products={products}
        onEdit={isAdmin ? handleEditProduct : undefined}
        onDelete={isAdmin ? handleDeleteProduct : undefined}
      />

      <AddEditProductDialog
        open={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false)
          setSelectedProduct(null)
        }}
        onSuccess={handleAddProduct}
        product={selectedProduct}
      />
    </div>
  )
}