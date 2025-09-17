'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, AlertCircle, Check, X, UserPlus, Shield, Star, Gift, Truck } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { phoneSchema } from '@/lib/validation'

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: phoneSchema,
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

type RegisterFormData = z.infer<typeof registerSchema>

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
  { label: 'One uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
  { label: 'One lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
  { label: 'One number', test: (pwd) => /\d/.test(pwd) }
]

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { register: authRegister } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  })

  const password = watch('password', '')

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true)

    try {
      const response = await authRegister({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password
      })
      
      // Registration successful, redirect to login with success message
      router.push('/login?message=' + encodeURIComponent((response as any)?.message || 'Registration successful! Please check your email to verify your account.'))
    } catch (err: any) {
      setError('root', {
        message: err?.message || 'Registration failed. Please try again or contact support.'
      })
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    const passedRequirements = passwordRequirements.filter(req => req.test(password)).length
    if (passedRequirements === 0) return { strength: 0, label: '', color: '' }
    if (passedRequirements <= 2) return { strength: 33, label: 'Weak', color: 'bg-red-500' }
    if (passedRequirements === 3) return { strength: 66, label: 'Medium', color: 'bg-yellow-500' }
    return { strength: 100, label: 'Strong', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength(password)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-50 flex items-center justify-center p-4 overflow-y-auto relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-orange-50/30 to-slate-50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22%23f97316%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M20%2020c0-5.5-4.5-10-10-10s-10%204.5-10%2010%204.5%2010%2010%2010%2010-4.5%2010-10zm10%200c0-5.5-4.5-10-10-10s-10%204.5-10%2010%204.5%2010%2010%2010%2010-4.5%2010-10z%22/%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md my-8 relative z-10"
      >
        {/* Enhanced Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            className="relative mx-auto mb-6"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white">
              <UserPlus className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
              <Check className="w-3 h-3 text-white" />
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-orange-800 to-gray-900 bg-clip-text text-transparent mb-3"
          >
            Create Account
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-gray-600 text-lg"
          >
            Start your shopping journey with us
          </motion.p>
          
          {/* Progress Indicator */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-4 flex items-center justify-center gap-2"
          >
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <div className="w-8 h-1 bg-orange-500 rounded-full" />
              <div className="w-2 h-2 bg-orange-200 rounded-full" />
            </div>
            <span className="text-xs text-gray-500 ml-2">Step 1 of 2</span>
          </motion.div>
        </div>

        {/* Enhanced Register Form */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-4 sm:p-8 border border-white/20 relative overflow-hidden"
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-transparent to-slate-50/50 rounded-3xl" />
          <div className="relative z-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            {/* Enhanced Global Error */}
            <AnimatePresence>
              {errors.root && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-4 flex items-center gap-3 shadow-lg"
                >
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-red-700 text-sm font-medium">{errors.root?.message}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* First Name Field */}
            <div className="space-y-3">
              <label htmlFor="firstName" className="text-sm font-semibold text-gray-900 block flex items-center gap-2">
                <User className="w-4 h-4 text-orange-500" />
                First Name
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <Input
                  {...register('firstName')}
                  type="text"
                  placeholder="Enter your first name"
                  className={`pl-10 h-10 sm:h-14 text-sm sm:text-base text-gray-900 bg-white border-2 rounded-xl transition-all duration-200 focus:bg-white focus:shadow-lg placeholder:text-gray-500 ${
                    errors.firstName 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500/20'
                  }`}
                />
                {!errors.firstName && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                )}
              </div>
              <AnimatePresence>
                {errors.firstName && (
                  <motion.p
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="text-red-600 text-sm flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errors.firstName?.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Last Name Field */}
            <div className="space-y-3">
              <label htmlFor="lastName" className="text-sm font-semibold text-gray-900 block flex items-center gap-2">
                <User className="w-4 h-4 text-orange-500" />
                Last Name
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <Input
                  {...register('lastName')}
                  type="text"
                  placeholder="Enter your last name"
                  className={`pl-10 h-10 sm:h-14 text-sm sm:text-base text-gray-900 bg-white border-2 rounded-xl transition-all duration-200 focus:bg-white focus:shadow-lg placeholder:text-gray-500 ${
                    errors.lastName 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500/20'
                  }`}
                />
                {!errors.lastName && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                )}
              </div>
              <AnimatePresence>
                {errors.lastName && (
                  <motion.p
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="text-red-600 text-sm flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errors.lastName?.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-900 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="Enter your email"
                  className={`pl-10 h-10 sm:h-12 text-sm sm:text-base text-gray-900 bg-white border-gray-300 placeholder:text-gray-500 ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'focus:border-orange-500 focus:ring-orange-500'}`}
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 text-sm flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.email?.message}
                </motion.p>
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-gray-900 block">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  {...register('phone')}
                  type="tel"
                  placeholder="0700123456 or +254700123456"
                  className={`pl-10 h-10 sm:h-12 text-sm sm:text-base text-gray-900 bg-white border-gray-300 placeholder:text-gray-500 ${errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'focus:border-orange-500 focus:ring-orange-500'}`}
                />
              </div>
              {errors.phone && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 text-sm flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.phone?.message}
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-900 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  className={`pl-10 pr-10 h-10 sm:h-12 text-sm sm:text-base text-gray-900 bg-white border-gray-300 placeholder:text-gray-500 ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'focus:border-orange-500 focus:ring-orange-500'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${passwordStrength.strength}%` }}
                      />
                    </div>
                    {passwordStrength.label && (
                      <span className={`text-xs font-medium ${
                        passwordStrength.strength === 100 ? 'text-green-600' :
                        passwordStrength.strength === 66 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {passwordRequirements.map((req, index) => {
                      const passed = req.test(password)
                      return (
                        <div key={index} className={`flex items-center gap-1 ${passed ? 'text-green-600' : 'text-gray-400'}`}>
                          {passed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {req.label}
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
              
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 text-sm flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.password?.message}
                </motion.p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-900 block">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  className={`pl-10 pr-10 h-10 sm:h-12 text-sm sm:text-base text-gray-900 bg-white border-gray-300 placeholder:text-gray-500 ${errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'focus:border-orange-500 focus:ring-orange-500'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 text-sm flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.confirmPassword?.message}
                </motion.p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="text-sm text-gray-600">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-orange-600 hover:text-orange-700 font-medium">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-orange-600 hover:text-orange-700 font-medium">
                Privacy Policy
              </Link>
            </div>

            {/* Enhanced Submit Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 sm:h-14 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:via-orange-700 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group text-sm sm:text-base"
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-lg">Creating your account...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-lg">Create Account</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Enhanced Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-gradient-to-r from-transparent via-gray-300 to-transparent" />
            <div className="px-6 py-2 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full border border-gray-200">
              <span className="text-sm font-medium text-gray-600">or continue with</span>
            </div>
            <div className="flex-1 border-t border-gradient-to-r from-transparent via-gray-300 to-transparent" />
          </div>

          {/* Enhanced Social Login */}
          <div className="space-y-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="button"
                variant="outline"
                className="w-full h-14 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 rounded-xl relative overflow-hidden group"
                disabled
              >
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="font-medium text-gray-700">Continue with Google</span>
                  <div className="ml-2 px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full font-medium">
                    Soon
                  </div>
                </div>
              </Button>
            </motion.div>
          </div>

          {/* Enhanced Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-base">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-orange-600 hover:text-orange-700 font-semibold transition-all duration-200 hover:underline underline-offset-2"
              >
                Sign in here
              </Link>
            </p>
            
            {/* Trust indicators */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500"
            >
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Secure</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>Verified</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                <span>Trusted</span>
              </div>
            </motion.div>
          </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
