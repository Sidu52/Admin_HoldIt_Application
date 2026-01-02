import { User } from "@/app/types/usermanager";

interface ContactCardProps {
  user: User;
}

// This would come from your actual user data
const userContactInfo = {
  email: 'john.doe@holdit.com',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  emailVerified: true,
};

export default function ContactCard({ user }: ContactCardProps) {
  return (
    <div className="bg-white dark:bg-[#232f48] rounded-xl p-5 border border-[#e5e7eb] dark:border-[#324467] shadow-sm">
      <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#3b82f6]">contact_page</span>
        Contact Information
      </h3>
      
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-[#3b82f6]">
            <span className="material-symbols-outlined text-[20px]">mail</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-medium uppercase tracking-wider">
              Email Address
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[#111418] dark:text-white font-medium text-sm break-all">
                {userContactInfo.email}
              </span>
              {userContactInfo.emailVerified && (
                <span className="material-symbols-outlined text-emerald-500 text-[16px]" title="Verified">
                  verified
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="mt-1 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-[#3b82f6]">
            <span className="material-symbols-outlined text-[20px]">call</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-medium uppercase tracking-wider">
              Phone
            </span>
            <span className="text-[#111418] dark:text-white font-medium text-sm">
              {userContactInfo.phone}
            </span>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="mt-1 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-[#3b82f6]">
            <span className="material-symbols-outlined text-[20px]">location_on</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-medium uppercase tracking-wider">
              Location
            </span>
            <span className="text-[#111418] dark:text-white font-medium text-sm">
              {userContactInfo.location}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}