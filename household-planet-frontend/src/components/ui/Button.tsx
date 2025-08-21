import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-base font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 select-none',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-soft hover:shadow-medium hover:from-primary-600 hover:to-primary-700 hover:-translate-y-0.5',
        destructive:
          'bg-gradient-to-r from-error-500 to-error-600 text-white shadow-soft hover:shadow-medium hover:from-error-600 hover:to-error-700 hover:-translate-y-0.5',
        outline:
          'border-2 border-primary-300 bg-white text-primary-700 shadow-soft hover:bg-primary-50 hover:border-primary-400 hover:shadow-medium hover:-translate-y-0.5',
        secondary:
          'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white shadow-soft hover:shadow-medium hover:from-secondary-600 hover:to-secondary-700 hover:-translate-y-0.5',
        ghost: 'text-primary-700 hover:bg-primary-50 hover:text-primary-800 rounded-lg',
        link: 'text-primary-600 underline-offset-4 hover:underline hover:text-primary-700 p-0 h-auto',
        success: 'bg-gradient-to-r from-success-500 to-success-600 text-white shadow-soft hover:shadow-medium hover:from-success-600 hover:to-success-700 hover:-translate-y-0.5',
        warning: 'bg-gradient-to-r from-warning-500 to-warning-600 text-white shadow-soft hover:shadow-medium hover:from-warning-600 hover:to-warning-700 hover:-translate-y-0.5',
      },
      size: {
        sm: 'h-10 px-4 py-2 text-sm min-w-[80px]',
        default: 'h-12 px-6 py-3 text-base min-w-[120px]',
        lg: 'h-14 px-8 py-4 text-lg min-w-[140px]',
        icon: 'h-12 w-12 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }: ButtonProps) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </Comp>
  );
};

export { Button, buttonVariants };
