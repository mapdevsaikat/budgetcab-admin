import { Booking } from './types';

interface BookingWithOptions extends Booking {
  drivers?: {
    id: string;
    name: string | null;
    mobile?: string | null;
  } | null;
  booking_options?: Array<{
    cab_type: string;
    trip_type: string;
    number_of_nights: number | null;
  }> | null;
}

export function generateWhatsAppMessage(booking: BookingWithOptions): string {
  const lines: string[] = [];
  
  // Header
  lines.push('🚗 *BudgetCab Booking Details*');
  lines.push('');
  
  // Booking Reference
  lines.push(`📋 *Booking Ref:* ${booking.booking_ref}`);
  lines.push('');
  
  // Pickup Location with Google Maps link
  if (booking.pickup_address) {
    lines.push('📍 *Pickup Location:*');
    lines.push(booking.pickup_address);
    if (booking.pickup_lat && booking.pickup_lng) {
      const mapsUrl = `https://www.google.com/maps?q=${booking.pickup_lat},${booking.pickup_lng}`;
      lines.push(`🗺️ ${mapsUrl}`);
    }
    if (booking.pickup_digipin) {
      lines.push(`📍 DigiPin: ${booking.pickup_digipin}`);
    }
    lines.push('');
  }
  
  // Drop Location
  if (booking.drop_address) {
    lines.push('🎯 *Drop Location:*');
    lines.push(booking.drop_address);
    if (booking.drop_lat && booking.drop_lng) {
      const mapsUrl = `https://www.google.com/maps?q=${booking.drop_lat},${booking.drop_lng}`;
      lines.push(`🗺️ ${mapsUrl}`);
    }
    if (booking.drop_digipin) {
      lines.push(`📍 DigiPin: ${booking.drop_digipin}`);
    }
    lines.push('');
  }
  
  // Trip Details
  if (booking.booking_options && booking.booking_options.length > 0) {
    const options = booking.booking_options[0];
    lines.push('🚕 *Trip Details:*');
    if (options.cab_type) {
      lines.push(`• Cab Type: ${options.cab_type}`);
    }
    if (options.trip_type) {
      lines.push(`• Trip Type: ${options.trip_type}`);
    }
    if (options.number_of_nights && options.number_of_nights > 0) {
      lines.push(`• Nights: ${options.number_of_nights}`);
    }
    lines.push('');
  }
  
  // Distance
  if (booking.distance_km) {
    lines.push(`📏 *Distance:* ${booking.distance_km.toFixed(2)} km`);
    lines.push('');
  }
  
  // Pricing
  lines.push('💰 *Pricing:*');
  if (booking.price_total) {
    lines.push(`• Total Fare: ₹${booking.price_total.toFixed(2)}`);
  }
  if (booking.toll && booking.toll > 0) {
    lines.push(`• Toll: ₹${booking.toll.toFixed(2)}`);
  } else {
    lines.push('• Toll: Not added');
  }
  lines.push('');
  
  // Customer Details
  if (booking.user_first_name || booking.user_mobile) {
    lines.push('👤 *Customer Details:*');
    if (booking.user_first_name) {
      lines.push(`• Name: ${booking.user_first_name}`);
    }
    if (booking.user_mobile) {
      lines.push(`• Mobile: ${booking.user_mobile}`);
    }
    lines.push('');
  }
  
  // Scheduled Time
  if (booking.scheduled_time) {
    const scheduledDate = new Date(booking.scheduled_time);
    lines.push(`📅 *Scheduled Time:* ${scheduledDate.toLocaleString('en-IN', {
      dateStyle: 'full',
      timeStyle: 'short'
    })}`);
    lines.push('');
  }
  
  // Status
  lines.push(`📊 *Status:* ${booking.status.replace(/_/g, ' ').toUpperCase()}`);
  
  // Driver Info (if assigned)
  if (booking.drivers?.name) {
    lines.push('');
    lines.push(`👨‍✈️ *Assigned Driver:* ${booking.drivers.name}`);
    if (booking.drivers.mobile) {
      lines.push(`📱 Driver Mobile: ${booking.drivers.mobile}`);
    }
  }
  
  return lines.join('\n');
}

export function getWhatsAppShareUrl(booking: BookingWithOptions, driverMobile?: string): string {
  const message = generateWhatsAppMessage(booking);
  const encodedMessage = encodeURIComponent(message);
  
  // If driver mobile is provided, use it; otherwise use a generic WhatsApp URL
  const phoneNumber = driverMobile ? driverMobile.replace(/[^0-9]/g, '') : '';
  
  if (phoneNumber) {
    // WhatsApp URL with phone number
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  } else {
    // Generic WhatsApp URL (user will select contact)
    return `https://wa.me/?text=${encodedMessage}`;
  }
}
