import { render, screen } from '@testing-library/react'
import { ProductCard } from '@/components/products/ProductCard'

const mockProduct = {
  id: 1,
  name: 'Test Product',
  price: 1000,
  image: '/test-image.jpg',
  description: 'Test description'
}

describe('ProductCard', () => {
  it('renders product information', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('KSh 1,000')).toBeInTheDocument()
  })

  it('handles add to cart click', () => {
    const mockAddToCart = jest.fn()
    render(<ProductCard product={mockProduct} onAddToCart={mockAddToCart} />)
    
    screen.getByText('Add to Cart').click()
    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct)
  })
})