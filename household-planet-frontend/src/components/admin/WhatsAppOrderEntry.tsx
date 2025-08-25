'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

import { useToast } from '@/hooks/useToast';
import { api } from '@/lib/api';

const whatsappOrderSchema = z.object({
  customerPhone: z.string().min(10, 'Phone number is required'),
  customerName: z.string().min(2, 'Customer name is required'),
  orderDetails: z.string().min(5, 'Order details are required'),
  deliveryLocation: z.string().optional(),
  deliveryCost: z.number().min(0, 'Delivery cost is required'),
  estimatedTotal: z.number().min(0).optional(),
  paymentMode: z.enum(['CASH', 'PAYBILL', 'BANK'], { required_error: 'Payment mode is required' }),
  deliveryType: z.enum(['PICKUP', 'DELIVERY'], { required_error: 'Delivery type is required' }),
  notes: z.string().optional(),
});

type WhatsAppOrderForm = z.infer<typeof whatsappOrderSchema>;

export default function WhatsAppOrderEntry() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [manualDeliveryCost, setManualDeliveryCost] = useState('');
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<WhatsAppOrderForm>({
    resolver: zodResolver(whatsappOrderSchema),
  });

  const handleLocationChange = (locationValue: string) => {
    setSelectedLocation(locationValue);
    if (locationValue) {
      // Extract price from location value
      const priceMatch = locationValue.match(/Ksh (\d+(?:,\d+)?)/); 
      if (priceMatch) {
        const price = parseInt(priceMatch[1].replace(',', ''));
        setValue('deliveryCost', price);
        setManualDeliveryCost(price.toString());
      }
    }
    setValue('deliveryLocation', locationValue);
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
      toast({
        title: 'Success',
        description: 'WhatsApp order created successfully',
        variant: 'success',
      });
      reset();
      setSelectedLocation('');
      setManualDeliveryCost('');
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

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Delivery Location
            </label>
            <select 
              value={selectedLocation}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="">Select delivery location</option>
              <option value="Nairobi CBD - Ksh 100">Nairobi CBD - Ksh 100</option>
              <option value="Kajiado (Naekana) - Ksh 150">Kajiado (Naekana) - Ksh 150</option>
              <option value="Kitengela (Via Shuttle) - Ksh 150">Kitengela (Via Shuttle) - Ksh 150</option>
              <option value="Thika (Super Metrol) - Ksh 150">Thika (Super Metrol) - Ksh 150</option>
              <option value="Juja (Via Super Metrol) - Ksh 200">Juja (Via Super Metrol) - Ksh 200</option>
              <option value="Kikuyu Town (Super Metrol) - Ksh 200">Kikuyu Town (Super Metrol) - Ksh 200</option>
              <option value="Pangani - Ksh 250">Pangani - Ksh 250</option>
              <option value="Upperhill - Ksh 250">Upperhill - Ksh 250</option>
              <option value="Bomet (Easycoach) - Ksh 300">Bomet (Easycoach) - Ksh 300</option>
              <option value="Eastleigh - Ksh 300">Eastleigh - Ksh 300</option>
              <option value="Hurlingham (Ngong Rd) - Rider - Ksh 300">Hurlingham (Ngong Rd) - Rider - Ksh 300</option>
              <option value="Industrial Area - Rider - Ksh 300">Industrial Area - Rider - Ksh 300</option>
              <option value="Kileleshwa - Ksh 300">Kileleshwa - Ksh 300</option>
              <option value="Kilimani - Ksh 300">Kilimani - Ksh 300</option>
              <option value="Machakos (Makos Sacco) - Ksh 300">Machakos (Makos Sacco) - Ksh 300</option>
              <option value="Madaraka (Mombasa Rd) - Rider - Ksh 300">Madaraka (Mombasa Rd) - Rider - Ksh 300</option>
              <option value="Makadara (Jogoo Rd) - Rider - Ksh 300">Makadara (Jogoo Rd) - Rider - Ksh 300</option>
              <option value="Mbagathi Way (Langata Rd) - Rider - Ksh 300">Mbagathi Way (Langata Rd) - Rider - Ksh 300</option>
              <option value="Mpaka Road - Ksh 300">Mpaka Road - Ksh 300</option>
              <option value="Naivasha (Via NNUS) - Ksh 300">Naivasha (Via NNUS) - Ksh 300</option>
              <option value="Nanyuki (Nanyuki Cabs) - Ksh 300">Nanyuki (Nanyuki Cabs) - Ksh 300</option>
              <option value="Parklands - Ksh 300">Parklands - Ksh 300</option>
              <option value="Riverside - Ksh 300">Riverside - Ksh 300</option>
              <option value="South B - Ksh 300">South B - Ksh 300</option>
              <option value="South C - Ksh 300">South C - Ksh 300</option>
              <option value="Westlands - Ksh 300">Westlands - Ksh 300</option>
              <option value="ABC (Waiyaki Way) - Rider - Ksh 350">ABC (Waiyaki Way) - Rider - Ksh 350</option>
              <option value="Allsops, Ruaraka - Ksh 350">Allsops, Ruaraka - Ksh 350</option>
              <option value="Bungoma (EasyCoach) - Ksh 350">Bungoma (EasyCoach) - Ksh 350</option>
              <option value="Carnivore (Langata) - Rider - Ksh 350">Carnivore (Langata) - Rider - Ksh 350</option>
              <option value="DCI (Kiambu Rd) - Rider - Ksh 350">DCI (Kiambu Rd) - Rider - Ksh 350</option>
              <option value="Eldoret (North-rift Shuttle) - Ksh 350">Eldoret (North-rift Shuttle) - Ksh 350</option>
              <option value="Embu (Using Kukena) - Ksh 350">Embu (Using Kukena) - Ksh 350</option>
              <option value="Homa Bay (Easy Coach) - Ksh 350">Homa Bay (Easy Coach) - Ksh 350</option>
              <option value="Imara Daima (Boda Rider) - Ksh 350">Imara Daima (Boda Rider) - Ksh 350</option>
              <option value="Jamhuri Estate - Ksh 350">Jamhuri Estate - Ksh 350</option>
              <option value="Kericho (Using EasyCoach) - Ksh 350">Kericho (Using EasyCoach) - Ksh 350</option>
              <option value="Kisii (Using Easycoach) - Ksh 350">Kisii (Using Easycoach) - Ksh 350</option>
              <option value="Kisumu (Easy Coach-United Mall) - Ksh 350">Kisumu (Easy Coach-United Mall) - Ksh 350</option>
              <option value="Kitale (Northrift) - Ksh 350">Kitale (Northrift) - Ksh 350</option>
              <option value="Lavington - Ksh 350">Lavington - Ksh 350</option>
              <option value="Mombasa (Dreamline Bus) - Ksh 350">Mombasa (Dreamline Bus) - Ksh 350</option>
              <option value="Nextgen Mall, Mombasa Road - Ksh 350">Nextgen Mall, Mombasa Road - Ksh 350</option>
              <option value="Roasters - Ksh 350">Roasters - Ksh 350</option>
              <option value="Rongo (Using EasyCoach) - Ksh 350">Rongo (Using EasyCoach) - Ksh 350</option>
              <option value="Buruburu - Ksh 400">Buruburu - Ksh 400</option>
              <option value="Donholm - Ksh 400">Donholm - Ksh 400</option>
              <option value="Kangemi - Ksh 400">Kangemi - Ksh 400</option>
              <option value="Kasarani - Ksh 400">Kasarani - Ksh 400</option>
              <option value="Kitisuru - Ksh 400">Kitisuru - Ksh 400</option>
              <option value="Lucky Summer - Ksh 400">Lucky Summer - Ksh 400</option>
              <option value="Lumumba Drive - Ksh 400">Lumumba Drive - Ksh 400</option>
              <option value="Muthaiga - Ksh 400">Muthaiga - Ksh 400</option>
              <option value="Peponi Road - Ksh 400">Peponi Road - Ksh 400</option>
              <option value="Roysambu - Ksh 400">Roysambu - Ksh 400</option>
              <option value="Thigiri - Ksh 400">Thigiri - Ksh 400</option>
              <option value="Village Market - Ksh 400">Village Market - Ksh 400</option>
              <option value="Kahawa Sukari - Ksh 550">Kahawa Sukari - Ksh 550</option>
              <option value="Kahawa Wendani - Ksh 550">Kahawa Wendani - Ksh 550</option>
              <option value="Karen - Ksh 650">Karen - Ksh 650</option>
              <option value="Kiambu - Ksh 650">Kiambu - Ksh 650</option>
              <option value="JKIA - Ksh 700">JKIA - Ksh 700</option>
              <option value="Ngong Town - Ksh 1,000">Ngong Town - Ksh 1,000</option>
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
              error={errors.deliveryCost?.message}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Total Product Price
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
            }}
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