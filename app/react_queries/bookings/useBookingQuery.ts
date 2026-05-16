import { useQuery } from "@tanstack/react-query";
import { bookingApi } from "@/app/api";

const useBookingQuery = () => {
  return useQuery({
    queryKey: ["booking"],
    queryFn:async () =>{ 
        const data =await bookingApi.getBookings();
        return data;
    }
  });
};

export default useBookingQuery;