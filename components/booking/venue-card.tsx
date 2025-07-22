"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Ticket } from "lucide-react";

interface VenueCardProps {
  id: string;
  name: string;
  description: string;
  location: string;
  type: string;
  pricePerHour: string;
  openingTime: string;
  closingTime: string;
  maxPlayers: number;
  imageUrl: string | null;
}

export function VenueCard({
  name,
  description,
  location,
  type,
  pricePerHour,
  openingTime,
  closingTime,
  maxPlayers,
  imageUrl,
}: VenueCardProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        {imageUrl && (
          <div className="relative h-48 mb-4 overflow-hidden rounded-lg">
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <h1 className="text-2xl font-bold mb-2">{name}</h1>
        <p className="text-gray-600 mb-4">{description}</p>

        <div className="flex items-start gap-2 mb-3">
          <MapPin className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
          <p className="text-gray-600">{location}</p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-500" />
            <p className="text-gray-600">
              {openingTime} to {closingTime}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-gray-500" />
            <p className="text-gray-600">₹{pricePerHour} per hour</p>
          </div>

          <p className="text-gray-600">Max Players: {maxPlayers}</p>
        </div>
      </CardContent>
    </Card>
  );
}
