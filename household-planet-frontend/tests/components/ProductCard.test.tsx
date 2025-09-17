import { render, screen } from '@testing-library/react'
import { ProductCard } from '@/components/products/ProductCard'

const mockProduct = {
  id: 1,
  name: 'Test Product',
  slug: 'test-product',
  shortDescription: 'Test short description',
  description: 'Test description',
  sku: 'TEST-001',
  price: 1000,
  originalPrice: 1200,
  image: '/test-image.jpg',
  images: ['/test-image.jpg'],
  categoryId: 1,
  brandId: 1,
  inStock: true,
  stockQuantity: 10
} as any

describe('ProductCard', () => {
  it('renders product information', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('KSh 1,000')).toBeInTheDocument()
  })

  it('handles add to cart click', () => {
    const mockAddToCart = jest.fn()
    render(<ProductCard product={mockProduct as any} />)
    
    screen.getByText('Add to Cart').click()
    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct)
  })
})