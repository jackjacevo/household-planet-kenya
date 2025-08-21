'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import WhatsAppOrderEntry from '@/components/admin/WhatsAppOrderEntry';
import WhatsAppMessages from '@/components/admin/WhatsAppMessages';

export default function WhatsAppPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">WhatsApp Orders</h1>
        <p className="text-gray-600">Manage orders received via WhatsApp</p>
      </div>

      <Tabs defaultValue="entry" className="space-y-6">
        <TabsList>
          <TabsTrigger value="entry">Create Order</TabsTrigger>
          <TabsTrigger value="messages">Pending Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="entry">
          <WhatsAppOrderEntry />
        </TabsContent>

        <TabsContent value="messages">
          <WhatsAppMessages />
        </TabsContent>
      </Tabs>
    </div>
  );
}