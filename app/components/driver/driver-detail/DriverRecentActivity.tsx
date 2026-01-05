import React, { useState, useEffect } from "react";

interface Trip {
  id: string;
  date: string;
  time: string;
  route: string;
  tripId: string;
  earnings: number;
  status: "completed" | "cancelled" | "in_progress";
}

interface DriverRecentActivityProps {
  driverId: string;
}

const DriverRecentActivity: React.FC<DriverRecentActivityProps> = ({ driverId }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock API call - in real app, fetch from API
    const fetchTrips = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data
      const mockTrips: Trip[] = [
        {
          id: "1",
          date: "Oct 24, 2023",
          time: "08:30 AM",
          route: "Downtown → Airport",
          tripId: "#TR-8821",
          earnings: 45.5,
          status: "completed",
        },
        {
          id: "2",
          date: "Oct 23, 2023",
          time: "05:15 PM",
          route: "Westside → North Hills",
          tripId: "#TR-8815",
          earnings: 22.0,
          status: "completed",
        },
        {
          id: "3",
          date: "Oct 23, 2023",
          time: "02:40 PM",
          route: "Airport → City Center",
          tripId: "#TR-8802",
          earnings: 0.0,
          status: "cancelled",
        },
        {
          id: "4",
          date: "Oct 22, 2023",
          time: "11:20 AM",
          route: "East End → Downtown",
          tripId: "#TR-8798",
          earnings: 18.75,
          status: "completed",
        },
        {
          id: "5",
          date: "Oct 22, 2023",
          time: "09:45 AM",
          route: "North Hills → Airport",
          tripId: "#TR-8793",
          earnings: 32.5,
          status: "completed",
        },
      ];
      
      setTrips(mockTrips);
      setLoading(false);
    };

    fetchTrips();
  }, [driverId]);

  const getStatusBadge = (status: Trip["status"]) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400">
            Cancelled
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">
            In Progress
          </span>
        );
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <section className="rounded-xl bg-card-dark border border-border-dark overflow-hidden mb-8">
      <div className="flex items-center justify-between border-b border-border-dark px-6 py-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">history</span>
          Recent Driving History
        </h3>
        <button className="text-sm font-medium text-primary hover:text-blue-400">
          View All Trips
        </button>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
            <p className="mt-2 text-text-secondary">Loading recent trips...</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-text-secondary mb-2">
              history
            </span>
            <p className="text-text-secondary">No recent trips found</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-text-secondary">
            <thead className="bg-[#232f48]/50 text-xs uppercase text-text-secondary">
              <tr>
                <th className="px-6 py-4 font-semibold" scope="col">Date & Time</th>
                <th className="px-6 py-4 font-semibold" scope="col">Route</th>
                <th className="px-6 py-4 font-semibold" scope="col">Trip ID</th>
                <th className="px-6 py-4 font-semibold" scope="col">Earnings</th>
                <th className="px-6 py-4 font-semibold" scope="col">Status</th>
                <th className="px-6 py-4 font-semibold text-right" scope="col">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {trips.map((trip) => (
                <tr key={trip.id} className="hover:bg-[#232f48]/30 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-white">
                    <div>{trip.date}</div>
                    <div className="text-xs text-text-secondary">{trip.time}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">{trip.route}</td>
                  <td className="whitespace-nowrap px-6 py-4 font-mono text-xs">
                    {trip.tripId}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-bold text-white">
                    {formatCurrency(trip.earnings)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {getStatusBadge(trip.status)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <button className="text-text-secondary hover:text-white">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default DriverRecentActivity;