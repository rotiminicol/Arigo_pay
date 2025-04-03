'use client';

import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import CustomInput from './CustomInput';
import { authFormSchema } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getLoggedInUser, signIn, signUp } from '@/lib/actions/user.actions';
import PlaidLink from './PlaidLink';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const AuthForm = ({ type }: { type: string }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = authFormSchema(type);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ''
    },
  });
   
  // 2. Define a submit handler.
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      // Sign up with Appwrite & create plaid token
      if(type === 'sign-up') {
        const userData = {
          firstName: data.firstName!,
          lastName: data.lastName!,
          address1: data.address1!,
          city: data.city!,
          state: data.state!,
          postalCode: data.postalCode!,
          dateOfBirth: data.dateOfBirth!,
          ssn: data.ssn!,
          email: data.email,
          password: data.password
        }

        const newUser = await signUp(userData);
        setUser(newUser);
      }

      if(type === 'sign-in') {
        const response = await signIn({
          email: data.email,
          password: data.password,
        })

        if(response) router.push('/')
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.section 
      initial="hidden"
      animate="visible"
      className="auth-form bg-white p-6 md:p-8 rounded-xl shadow-lg max-w-md mx-auto"
    >
      <motion.header variants={fadeIn} className='flex flex-col gap-5 md:gap-8 mb-8'>
        <Link href="/" className="cursor-pointer flex items-center gap-2">
          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
            >
              <Image 
                src="/icons/logo.svg"
                width={40}
                height={40}
                alt="Arigo Pay logo"
                className="object-contain"
              />
            </motion.div>
          </div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-2xl font-bold text-black tracking-tight"
          >
            Arigo<span className="text-blue-600">Pay</span>
          </motion.h1>
        </Link>

        <motion.div variants={fadeIn} className="flex flex-col gap-1 md:gap-3">
          <h1 className="text-2xl lg:text-3xl font-semibold text-black">
            {user 
              ? 'Link Account'
              : type === 'sign-in'
                ? 'Sign In'
                : 'Sign Up'
            }
          </h1>
          <p className="text-base font-normal text-gray-600">
            {user 
              ? 'Link your account to get started'
              : 'Please enter your details'
            }
          </p>  
        </motion.div>
      </motion.header>
      
      {user ? (
        <motion.div 
          variants={fadeIn}
          className="flex flex-col gap-4"
        >
          <PlaidLink user={user} variant="primary" />
        </motion.div>
      ) : (
        <>
          <Form {...form}>
            <motion.form 
              variants={staggerContainer}
              onSubmit={form.handleSubmit(onSubmit)} 
              className="space-y-5"
            >
              {type === 'sign-up' && (
                <>
                  <motion.div variants={fadeIn} className="flex gap-4">
                    <CustomInput control={form.control} name='firstName' label="First Name" placeholder='Enter your first name' />
                    <CustomInput control={form.control} name='lastName' label="Last Name" placeholder='Enter your last name' />
                  </motion.div>
                  <motion.div variants={fadeIn}>
                    <CustomInput control={form.control} name='address1' label="Address" placeholder='Enter your specific address' />
                  </motion.div>
                  <motion.div variants={fadeIn}>
                    <CustomInput control={form.control} name='city' label="City" placeholder='Enter your city' />
                  </motion.div>
                  <motion.div variants={fadeIn} className="flex gap-4">
                    <CustomInput control={form.control} name='state' label="State" placeholder='Example: NY' />
                    <CustomInput control={form.control} name='postalCode' label="Postal Code" placeholder='Example: 11101' />
                  </motion.div>
                  <motion.div variants={fadeIn} className="flex gap-4">
                    <CustomInput control={form.control} name='dateOfBirth' label="Date of Birth" placeholder='YYYY-MM-DD' />
                    <CustomInput control={form.control} name='ssn' label="SSN" placeholder='Example: 1234' />
                  </motion.div>
                </>
              )}

              <motion.div variants={fadeIn}>
                <CustomInput control={form.control} name='email' label="Email" placeholder='Enter your email' />
              </motion.div>

              <motion.div variants={fadeIn}>
                <CustomInput control={form.control} name='password' label="Password" placeholder='Enter your password' />
              </motion.div>

              <motion.div 
                variants={fadeIn}
                className="flex flex-col gap-4 pt-4"
              >
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="form-btn bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : type === 'sign-in' 
                    ? 'Sign In' : 'Sign Up'}
                </Button>
              </motion.div>
            </motion.form>
          </Form>

          <motion.footer 
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-1 mt-6"
          >
            <p className="text-sm font-normal text-gray-600">
              {type === 'sign-in'
              ? "Don't have an account?"
              : "Already have an account?"}
            </p>
            <Link href={type === 'sign-in' ? '/sign-up' : '/sign-in'} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
              {type === 'sign-in' ? 'Sign up' : 'Sign in'}
            </Link>
          </motion.footer>
        </>
      )}
    </motion.section>
  )
}

export default AuthForm