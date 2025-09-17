import React from 'react';

const CheckoutForm: React.FC = () => {
  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Checkout</h2>
      <form>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
          >
            Complete Order
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;
