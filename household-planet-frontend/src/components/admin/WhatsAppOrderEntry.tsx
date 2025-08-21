'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

import { useToast } from '@/hooks/useToast';
import { api } from '@/lib/api';

const whatsappOrderSchema = z.object({
  customerPhone: z.string().min(10, 'Phone number is required'),
  customerName: z.string().min(2, 'Customer name is required'),
  orderDetails: z.string().min(10, 'Order details are required'),
  shippingAddress: z.string().min(10, 'Shipping address is required'),
  deliveryLocation: z.string().optional(),
  estimatedTotal: z.number().min(0).optional(),
  notes: z.string().optional(),
});

type WhatsAppOrderForm = z.infer<typeof whatsappOrderSchema>;

export default function WhatsAppOrderEntry() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WhatsAppOrderForm>({
    resolver: zodResolver(whatsappOrderSchema),
  });

  const onSubmit = async (data: WhatsAppOrderForm) => {
    setIsSubmitting(true);
    try {
      await api.post('/api/orders/whatsapp', data);
      toast({
        title: 'Success',
        description: 'WhatsApp order created successfully',
        variant: 'success',
      });
      reset();
    } catch (error) {
      toast({
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
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Customer Phone *
            </label>
            <Input
              {...register('customerPhone')}
              placeholder="+254712345678"
              error={errors.customerPhone?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Customer Name *
            </label>
            <Input
              {...register('customerName')}
              placeholder="John Doe"
              error={errors.customerName?.message}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Order Details *
          </label>
          <Textarea
            {...register('orderDetails')}
            placeholder="2x Cooking Oil 1L, 1x Rice 2kg, 3x Soap bars..."
            rows={4}
            error={errors.orderDetails?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Shipping Address *
          </label>
          <Textarea
            {...register('shippingAddress')}
            placeholder="Full delivery address including county, town, and specific location"
            rows={3}
            error={errors.shippingAddress?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Delivery Location
            </label>
            <select 
              {...register('deliveryLocation')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="">Select location</option>
              <option value="nairobi-cbd">Nairobi CBD</option>
              <option value="westlands">Westlands</option>
              <option value="karen">Karen</option>
              <option value="kiambu">Kiambu</option>
              <option value="thika">Thika</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Estimated Total (KSh)
            </label>
            <Input
              {...register('estimatedTotal', { valueAsNumber: true })}
              type="number"
              placeholder="0"
              error={errors.estimatedTotal?.message}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Additional Notes
          </label>
          <Textarea
            {...register('notes')}
            placeholder="Any special instructions or notes"
            rows={2}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => reset()}
          >
            Clear
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
          >
            Create Order
          </Button>
        </div>
      </form>
    </div>
  );
}