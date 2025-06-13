import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { DayContent, DayContentProps } from 'react-day-picker';
import { CalendarDays, Clock, Users, CheckCircle, ArrowLeft } from 'lucide-react';
import { format, isToday, isBefore, startOfDay } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { useBreakpoint } from '@/hooks/use-mobile';
import { useSearchParams, Link } from 'react-router-dom';
import './booking-calendar.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DebugDialog } from '@/components/debug-dialog';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const TIME_SLOTS = [
  "09:00 AM - 10:00 AM",
  "10:30 AM - 11:30 AM", 
  "12:00 PM - 01:00 PM",
  "02:00 PM - 03:00 PM",
  "03:30 PM - 04:30 PM"
];

const MAX_BOOKINGS_PER_SLOT = 5;

interface Bookings {
  [date: string]: number[];
}

interface UserDetails {
  name: string;
  email: string;
  phone: string;
}

const userDetailsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits')
});

const Index = () => {  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [bookings, setBookings] = useState<Bookings>({});
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [showUserDetailsDialog, setShowUserDetailsDialog] = useState(false);
  const [useExistingDetails, setUseExistingDetails] = useState(false);
  const [showDebugDialog, setShowDebugDialog] = useState(false);
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'book';
  
  const handleCloseUserDetailsDialog = (open: boolean) => {
    if (!open) {
      // Reset the form when closing the dialog
      form.reset();      setShowUserDetailsDialog(false);
    } else {
      setShowUserDetailsDialog(true);
    }
  };
  const { isMobile, isTablet } = useBreakpoint();

  const form = useForm<z.infer<typeof userDetailsSchema>>({
    resolver: zodResolver(userDetailsSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  });

  // Load bookings from localStorage on mount
  useEffect(() => {
    const savedBookings = localStorage.getItem('bookings');
    if (savedBookings) {
      try {
        setBookings(JSON.parse(savedBookings));
      } catch (error) {
        console.error('Error loading bookings:', error);
      }
    }
    
    // Load user details from localStorage if available
    const savedUserDetails = localStorage.getItem('userDetails');
    if (savedUserDetails) {
      try {
        setUserDetails(JSON.parse(savedUserDetails));
      } catch (error) {
        console.error('Error loading user details:', error);
      }
    }
  }, []);

  // Save bookings to localStorage whenever bookings change
  useEffect(() => {
    localStorage.setItem('bookings', JSON.stringify(bookings));
  }, [bookings]);
  
  // Save user details to localStorage whenever they change
  useEffect(() => {
    if (userDetails) {
      localStorage.setItem('userDetails', JSON.stringify(userDetails));
    }
  }, [userDetails]);  // Check if a date has any bookings
  const hasBookings = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const slotCounts = bookings[dateStr];
    
    if (!slotCounts) return false;
    
    // Check if at least one slot has bookings
    return slotCounts.some(count => count > 0);
  };
  
  // Custom day component that shows a dot for days with bookings
  function BookedDayContent(props: DayContentProps) {
    const { date } = props;
    const isDateBooked = hasBookings(date);
    
    return (
      <div className="relative">
        <DayContent {...props} />
        {isDateBooked && (
          <div 
            className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"
            style={{ 
              bottom: '2px',
              zIndex: 10
            }}
          />
        )}
      </div>
    );
  };
  
  const getSlotStatus = (slotIndex: number, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const slotCounts = bookings[dateStr] || Array(TIME_SLOTS.length).fill(0);
    const currentBookings = slotCounts[slotIndex] || 0;
    
    // Check if slot time has passed for today
    if (isToday(date)) {
      const slotTime = TIME_SLOTS[slotIndex].split(' - ')[0];
      const [time, period] = slotTime.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      const slotHour = period === 'PM' && hours !== 12 ? hours + 12 : (period === 'AM' && hours === 12 ? 0 : hours);
      
      const now = new Date();
      const slotDateTime = new Date(date);
      slotDateTime.setHours(slotHour, minutes, 0, 0);
      
      if (isBefore(slotDateTime, now)) {
        return { status: 'passed', remaining: 0, current: currentBookings };
      }
    }
    
    if (currentBookings >= MAX_BOOKINGS_PER_SLOT) {
      return { status: 'full', remaining: 0, current: currentBookings };
    }
    
    return { 
      status: 'available', 
      remaining: MAX_BOOKINGS_PER_SLOT - currentBookings,
      current: currentBookings 
    };
  };

  const handleBookSlot = (slotIndex: number) => {
    if (!selectedDate) return;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const slotStatus = getSlotStatus(slotIndex, selectedDate);
    
    if (slotStatus.status !== 'available') {
      toast({
        title: "Cannot book this slot",
        description: slotStatus.status === 'full' ? "This slot is fully booked" : "This time slot has passed",
        variant: "destructive"
      });
      return;
    }
    
    // Set the selected slot and show user details dialog if needed
    setSelectedSlot(slotIndex);
    
    // If we already have user details, ask if they want to use existing details
    if (userDetails) {
      setUseExistingDetails(true);
    } else {
      // Otherwise, show the dialog to collect user details
      setShowUserDetailsDialog(true);
    }
  };

  const confirmBooking = (details: UserDetails | null = null) => {
    if (selectedSlot === null || !selectedDate) return;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    // Save the user details if provided
    if (details) {
      setUserDetails(details);
    }
    
    // Update bookings
    setBookings(prev => {
      const newBookings = { ...prev };
      if (!newBookings[dateStr]) {
        newBookings[dateStr] = Array(TIME_SLOTS.length).fill(0);
      }
      newBookings[dateStr][selectedSlot]++;
      return newBookings;
    });
    
    // Show confirmation toast
    toast({
      title: "Booking confirmed!",
      description: `Successfully booked ${TIME_SLOTS[selectedSlot]} on ${format(selectedDate, 'PPP')}`,
    });
    
    // Reset state
    setSelectedSlot(null);
    setShowUserDetailsDialog(false);
    setUseExistingDetails(false);
  };
    const handleUseExistingDetails = (useExisting: boolean) => {
    setUseExistingDetails(false);
    
    if (useExisting && userDetails) {
      // Use existing details
      confirmBooking();
    } else {
      // Show the form to collect new details and pre-populate with existing details if available
      if (userDetails) {
        form.reset({
          name: userDetails.name,
          email: userDetails.email,
          phone: userDetails.phone,
        });
      }
      setShowUserDetailsDialog(true);
    }
  };

  const handleUserDetailsSubmit = (data: z.infer<typeof userDetailsSchema>) => {
    const details = {
      name: data.name,
      email: data.email,
      phone: data.phone
    };
    
    confirmBooking(details);
  };
  const handleCancelBooking = (slotIndex: number) => {
    if (!selectedDate) return;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const slotCounts = bookings[dateStr];
    
    if (!slotCounts || slotCounts[slotIndex] === 0) {
      toast({
        title: "No booking to cancel",
        description: "There are no bookings for this slot",
        variant: "destructive"
      });
      return;
    }
    
    setBookings(prev => {
      const newBookings = { ...prev };
      newBookings[dateStr][slotIndex]--;
      
      // Remove the date entry if no bookings remain
      if (newBookings[dateStr].every(count => count === 0)) {
        delete newBookings[dateStr];
      }
      
      return newBookings;
    });
    
    toast({
      title: "Booking cancelled",
      description: `Cancelled booking for ${TIME_SLOTS[slotIndex]} on ${format(selectedDate, 'PPP')}`,
    });
  };

  const getBookedSlots = () => {
    if (!selectedDate) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const slotCounts = bookings[dateStr] || [];
    return slotCounts.map((count, index) => ({ index, count })).filter(slot => slot.count > 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Smart Booking System</h1>
          <p className="text-base sm:text-lg text-gray-600">Schedule your appointments with ease</p>
          <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              Max {MAX_BOOKINGS_PER_SLOT} per slot
            </Badge>
          </div>
        </div>        {/* User Details Dialog */}
        <Dialog open={showUserDetailsDialog} onOpenChange={handleCloseUserDetailsDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Complete Your Booking</DialogTitle>
              <DialogDescription>
                Please enter your details to confirm your appointment for{' '}
                {selectedSlot !== null && selectedDate && (
                  <span className="font-medium">
                    {TIME_SLOTS[selectedSlot]} on {format(selectedDate, 'EEE, MMM d, yyyy')}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>              <form onSubmit={form.handleSubmit(handleUserDetailsSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="your.email@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Your phone number" type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="pt-3">                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => handleCloseUserDetailsDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Confirm Booking</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Use Existing Details Confirmation Dialog */}
        <Dialog open={useExistingDetails} onOpenChange={() => setUseExistingDetails(false)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Use Existing Details</DialogTitle>
              <DialogDescription>
                We found your previous booking details. Would you like to use them for this booking?
                {userDetails && (
                  <div className="mt-4 border rounded-md p-4 bg-muted/30">
                    <div className="grid gap-1">
                      <p className="text-sm font-medium">Name: {userDetails.name}</p>
                      <p className="text-sm font-medium">Email: {userDetails.email}</p>
                      <p className="text-sm font-medium">Phone: {userDetails.phone}</p>
                    </div>
                  </div>
                )}              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => handleUseExistingDetails(false)}
              >
                Enter New Details
              </Button>
              <Button 
                onClick={() => handleUseExistingDetails(true)}
              >
                Use These Details
              </Button>
            </div>
          </DialogContent>
        </Dialog>        {/* Back to Home link */}
        <div className="mb-4">
          <Link to="/" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>

        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue={initialTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-8">
              <TabsTrigger value="book" className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base py-1.5 sm:py-2">
                <CalendarDays className="w-3 h-3 sm:w-4 sm:h-4" />
                Book Appointment
              </TabsTrigger>
              <TabsTrigger value="manage" className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base py-1.5 sm:py-2">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                Manage Bookings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="book" className="space-y-4 sm:space-y-6">
              <div className="grid gap-4 sm:gap-8 md:grid-cols-1 lg:grid-cols-2">
                {/* Calendar Section */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader className="px-4 py-5 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      Select Date
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Choose your preferred appointment date
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-2 sm:px-6 pb-5 sm:pb-6 flex justify-center">                    <div className="relative">                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => isBefore(date, startOfDay(new Date()))}
                        className="rounded-md border shadow-sm bg-white max-w-full"
                        showOutsideDays={!isMobile}
                        fixedWeeks
                        components={{
                          DayContent: BookedDayContent
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Time Slots Section */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader className="px-4 py-5 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      Available Time Slots
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {selectedDate ? format(selectedDate, 'EEE, MMM d, yyyy') : 'Select a date to view slots'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6 pb-5 sm:pb-6">
                    {selectedDate ? (
                      <div className="space-y-2 sm:space-y-3">
                        {TIME_SLOTS.map((slot, index) => {
                          const slotStatus = getSlotStatus(index, selectedDate);
                          return (
                            <div
                              key={index}
                              className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 ${
                                slotStatus.status === 'available'
                                  ? 'border-green-200 bg-green-50 hover:border-green-300 hover:shadow-md cursor-pointer'
                                  : slotStatus.status === 'full'
                                  ? 'border-red-200 bg-red-50'
                                  : 'border-gray-200 bg-gray-50'
                              }`}
                              onClick={() => slotStatus.status === 'available' && handleBookSlot(index)}
                            >
                              <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
                                <div>
                                  <p className="font-medium text-gray-900 text-sm sm:text-base">{slot}</p>
                                  <p className="text-xs sm:text-sm text-gray-600">
                                    {slotStatus.current}/{MAX_BOOKINGS_PER_SLOT} booked
                                  </p>
                                </div>
                                <div className="text-right">
                                  {slotStatus.status === 'available' ? (
                                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-300 text-xs sm:text-sm whitespace-nowrap">
                                      {slotStatus.remaining} available
                                    </Badge>
                                  ) : slotStatus.status === 'full' ? (
                                    <Badge variant="destructive" className="text-xs sm:text-sm whitespace-nowrap">
                                      Fully Booked
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="text-xs sm:text-sm whitespace-nowrap">
                                      Time Passed
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 sm:py-8 text-gray-500">
                        <CalendarDays className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm sm:text-base">Please select a date to view available time slots</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="manage" className="space-y-4 sm:space-y-6">
              {/* User details card */}
              {userDetails && (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader className="px-4 py-5 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      Your Details
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Personal information used for bookings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6 pb-5 sm:pb-6">
                    <div className="space-y-3 border rounded-md p-4 bg-blue-50/50">
                      <div className="grid grid-cols-[100px_1fr] items-center">
                        <span className="font-medium text-gray-700">Name:</span>
                        <span>{userDetails.name}</span>
                      </div>
                      <div className="grid grid-cols-[100px_1fr] items-center">
                        <span className="font-medium text-gray-700">Email:</span>
                        <span>{userDetails.email}</span>
                      </div>
                      <div className="grid grid-cols-[100px_1fr] items-center">
                        <span className="font-medium text-gray-700">Phone:</span>
                        <span>{userDetails.phone}</span>
                      </div>
                      <div className="pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            form.reset({
                              name: userDetails.name,
                              email: userDetails.email,
                              phone: userDetails.phone,
                            });
                            setShowUserDetailsDialog(true);
                          }}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs sm:text-sm"
                        >
                          Edit Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                <CardHeader className="px-4 py-5 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    Manage Your Bookings
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {selectedDate ? `Bookings for ${format(selectedDate, 'EEE, MMM d, yyyy')}` : 'Select a date to manage bookings'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-5 sm:pb-6">
                  <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    <div className="flex flex-col items-center sm:items-start">
                      <h3 className="font-medium mb-3 sm:mb-4 text-sm sm:text-base">Select Date</h3>                      <div className="flex justify-center w-full">                        <div className="relative">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-md border shadow-sm bg-white max-w-full"
                            showOutsideDays={!isMobile}
                            fixedWeeks
                            components={{
                              DayContent: BookedDayContent
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-3 sm:mb-4 text-sm sm:text-base">Current Bookings</h3>
                      {selectedDate && getBookedSlots().length > 0 ? (
                        <div className="space-y-2 sm:space-y-3">
                          {getBookedSlots().map(({ index, count }) => (
                            <div key={index} className="p-3 sm:p-4 rounded-lg border bg-blue-50 border-blue-200">
                              <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
                                <div>
                                  <p className="font-medium text-gray-900 text-sm sm:text-base">{TIME_SLOTS[index]}</p>
                                  <p className="text-xs sm:text-sm text-gray-600">{count} booking(s)</p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancelBooking(index)}
                                  className="text-red-600 border-red-200 hover:bg-red-50 text-xs sm:text-sm py-1 sm:py-2 h-auto whitespace-nowrap"
                                >
                                  Cancel One
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 sm:py-8 text-gray-500">
                          <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm sm:text-base">
                            {selectedDate 
                              ? 'No bookings found for this date' 
                              : 'Select a date to view bookings'
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* User Details Dialog */}
      <Dialog open={showUserDetailsDialog} onOpenChange={setShowUserDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              {useExistingDetails 
                ? 'We found your details. Do you want to use the existing details for booking?' 
                : 'Please enter your details to proceed with the booking.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleUserDetailsSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />                <Button type="submit" className="w-full">
                  Submit
                </Button>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Debug Dialog for development */}
      <DebugDialog 
        isOpen={showDebugDialog} 
        onClose={() => setShowDebugDialog(false)} 
        bookings={bookings} 
      />

      {/* Debug Button - Add this for development purposes */}
      <div className="fixed bottom-5 right-5 z-50">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowDebugDialog(true)}
          className="bg-white shadow-lg"
        >
          Debug Bookings
        </Button>
      </div>
    </div>
  );
};

export default Index;
