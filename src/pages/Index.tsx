
import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Clock, Users, CheckCircle } from 'lucide-react';
import { format, isToday, isBefore, startOfDay } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { useBreakpoint } from '@/hooks/use-mobile';

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

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [bookings, setBookings] = useState<Bookings>({});
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const { isMobile, isTablet } = useBreakpoint();

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
  }, []);

  // Save bookings to localStorage whenever bookings change
  useEffect(() => {
    localStorage.setItem('bookings', JSON.stringify(bookings));
  }, [bookings]);

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
    
    setBookings(prev => {
      const newBookings = { ...prev };
      if (!newBookings[dateStr]) {
        newBookings[dateStr] = Array(TIME_SLOTS.length).fill(0);
      }
      newBookings[dateStr][slotIndex]++;
      return newBookings;
    });
    
    toast({
      title: "Booking confirmed!",
      description: `Successfully booked ${TIME_SLOTS[slotIndex]} on ${format(selectedDate, 'PPP')}`,
    });
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
        </div>

        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="book" className="w-full">
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
                  <CardContent className="px-2 sm:px-6 pb-5 sm:pb-6 flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => isBefore(date, startOfDay(new Date()))}
                      className="rounded-md border shadow-sm bg-white max-w-full"
                      showOutsideDays={!isMobile}
                      fixedWeeks
                    />
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
                      <h3 className="font-medium mb-3 sm:mb-4 text-sm sm:text-base">Select Date</h3>
                      <div className="flex justify-center w-full">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          className="rounded-md border shadow-sm bg-white max-w-full"
                          showOutsideDays={!isMobile}
                          fixedWeeks
                        />
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
    </div>
  );
};

export default Index;
