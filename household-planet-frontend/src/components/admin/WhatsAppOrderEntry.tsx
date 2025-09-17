'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useDeliveryLocations } from '@/hooks/useDeliveryLocations';
import { useToast } from '@/hooks/useToast';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

const whatsappOrderSchema = z.object({
  customerPhone: z.string().min(10, 'Phone number is required'),
  customerName: z.string().min(2, 'Customer name is required'),
  customerEmail: z.string().email('Valid email is required').optional().or(z.literal('')),
  orderDetails: z.string().min(5, 'Order details are required'),
  deliveryLocation: z.string().optional(),
  deliveryCost: z.number().min(0, 'Delivery cost is required'),
  estimatedTotal: z.number().min(0).optional(),
  paymentMode: z.enum(['CASH', 'PAYBILL', 'BANK'], { message: 'Payment mode is required' }),
  deliveryType: z.enum(['PICKUP', 'DELIVERY'], { message: 'Delivery type is required' }),
  notes: z.string().optional(),
});

type WhatsAppOrderForm = z.infer<typeof whatsappOrderSchema>;

export default function WhatsAppOrderEntry() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [manualDeliveryCost, setManualDeliveryCost] = useState('');
  const [deliveryType, setDeliveryType] = useState('');
  const { locations: deliveryLocations, loading: locationsLoading } = useDeliveryLocations();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<WhatsAppOrderForm>({
    resolver: zodResolver(whatsappOrderSchema),
  });

  const handleLocationChange = (locationId: string) => {
    setSelectedLocation(locationId);
    if (locationId) {
      // Find the location by ID and get its price
      const location = deliveryLocations.find(loc => loc.id === locationId);
      if (location) {
        setValue('deliveryCost', location.price);
        setManualDeliveryCost(location.price.toString());
        setValue('deliveryLocation', location.name);
      }
    } else {
      setValue('deliveryLocation', '');
    }
  };

  const handleManualDeliveryCostChange = (value: string) => {
    setManualDeliveryCost(value);
    const cost = parseFloat(value) || 0;
    setValue('deliveryCost', cost);
    setSelectedLocation('');
    setValue('deliveryLocation', '');
  };

  const onSubmit = async (data: WhatsAppOrderForm) => {
    setIsSubmitting(true);
    try {
      await api.post('/api/orders/whatsapp', data);
      showToast({
        title: 'Success',
        description: 'WhatsApp order created successfully',
        variant: 'success',
      });
      reset();
      setSelectedLocation('');
      setManualDeliveryCost('');
      setDeliveryType('');
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to create WhatsApp order',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Create WhatsApp Order</h2>
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> If you provide a customer email, it will be used for the order. Otherwise, a temporary WhatsApp email will be created.
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Customer Phone *
            </label>
            <Input
              {...register('customerPhone')}
              placeholder="+254712345678"
            />
            {errors.customerPhone && (
              <p className="text-sm text-red-600 mt-1">{errors.customerPhone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Customer Name *
            </label>
            <Input
              {...register('customerName')}
              placeholder="John Doe"
            />
            {errors.customerName && (
              <p className="text-sm text-red-600 mt-1">{errors.customerName.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Customer Email (Optional)
          </label>
          <Input
            {...register('customerEmail')}
            type="email"
            placeholder="customer@gmail.com"
          />
          {errors.customerEmail && (
            <p className="text-sm text-red-600 mt-1">{errors.customerEmail.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            If provided, this email will be used instead of the temporary WhatsApp email
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Order Details *
          </label>
          <textarea
            {...register('orderDetails')}
            placeholder="2x Cooking Oil 1L, 1x Rice 2kg, 3x Soap bars..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {errors.orderDetails && (
            <p className="text-sm text-red-600 mt-1">{errors.orderDetails.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Mode *
            </label>
            <select 
              {...register('paymentMode')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="">Select payment mode</option>
              <option value="CASH">Cash on Delivery</option>
              <option value="PAYBILL">Paybill</option>
              <option value="BANK">Bank on Delivery</option>
            </select>
            {errors.paymentMode && (
              <p className="text-sm text-red-600 mt-1">{errors.paymentMode.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Delivery Type *
            </label>
            <select 
              {...register('deliveryType')}
              onChange={(e) => {
                setDeliveryType(e.target.value);
                if (e.target.value === 'PICKUP') {
                  setValue('deliveryCost', 0);
                  setManualDeliveryCost('0');
                  setSelectedLocation('');
                  setValue('deliveryLocation', '');
                }
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="">Select delivery type</option>
              <option value="PICKUP">Pickup from Store</option>
              <option value="DELIVERY">Delivery</option>
            </select>
            {errors.deliveryType && (
              <p className="text-sm text-red-600 mt-1">{errors.deliveryType.message}</p>
            )}
          </div>
        </div>

        {deliveryType === 'DELIVERY' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Delivery Location
              </label>
              <select 
                value={selectedLocation}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                disabled={locationsLoading}
              >
                <option value="">{locationsLoading ? 'Loading locations...' : 'Select delivery location'}</option>
                {deliveryLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} - {formatPrice(location.price)}
                    {location.estimatedDays && ` (${location.estimatedDays} days)`}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="text-center text-sm text-gray-500">OR</div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Manual Delivery Cost (KSh) *
              </label>
              <Input
                type="number"
                placeholder="Enter delivery cost"
                value={manualDeliveryCost}
                onChange={(e) => handleManualDeliveryCostChange(e.target.value)}
                min="0"
                step="1"
              />
              {errors.deliveryCost && (
                <p className="text-sm text-red-600 mt-1">{errors.deliveryCost.message}</p>
              )}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">
            Total Product Price
          </label>
          <Input
            {...register('estimatedTotal', { valueAsNumber: true })}
            type="number"
            placeholder="0"
          />
          {errors.estimatedTotal && (
            <p className="text-sm text-red-600 mt-1">{errors.estimatedTotal.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Additional Notes
          </label>
          <textarea
            {...register('notes')}
            placeholder="Any special instructions or notes"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              setSelectedLocation('');
              setManualDeliveryCost('');
              setDeliveryType('');
            }}
          >
            Clear
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            Create Order
          </Button>
        </div>
      </form>
    </div>
  );
}
