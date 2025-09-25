'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/Tabs';
import WhatsAppOrderEntry from '../../../components/admin/WhatsAppOrderEntry';
import WhatsAppMessages from '../../../components/admin/WhatsAppMessages';

export default function WhatsAppPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">WhatsApp Management</h1>
        <p className="text-gray-600">Manage WhatsApp orders</p>
      </div>

      <Tabs defaultValue="messages" className="space-y-6">
        <TabsList>
          <TabsTrigger value="messages">WhatsApp Orders</TabsTrigger>
          <TabsTrigger value="entry">Create Order</TabsTrigger>
        </TabsList>

        <TabsContent value="messages">
          <WhatsAppMessages />
        </TabsContent>

        <TabsContent value="entry">
          <WhatsAppOrderEntry />
        </TabsContent>
      </Tabs>
    </div>
  );
}
