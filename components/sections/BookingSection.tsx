"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function BookingSection() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <section className="py-24 bg-white" id="book-now">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">Book Your Slot</h2>
            <p className="text-xl text-gray-600 mb-8">
              Select your preferred date and time to secure your booking instantly.
            </p>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter your name" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" className="mt-1" />
              </div>
              
              <div>
                <Label>Select Time</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => (
                      <SelectItem key={hour} value={`${hour}:00`}>
                        {`${hour}:00 ${hour < 12 ? 'AM' : 'PM'}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Duration</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Hour</SelectItem>
                    <SelectItem value="2">2 Hours</SelectItem>
                    <SelectItem value="3">3 Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button className="w-full">Book Now</Button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white p-6 rounded-2xl shadow-lg"
          >
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
            
            <div className="mt-8 space-y-4">
              <h3 className="text-xl font-semibold">Pricing</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Weekday (Before 6 PM)</span>
                  <span className="font-semibold">$50/hour</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Weekday (After 6 PM)</span>
                  <span className="font-semibold">$70/hour</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Weekend</span>
                  <span className="font-semibold">$80/hour</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}