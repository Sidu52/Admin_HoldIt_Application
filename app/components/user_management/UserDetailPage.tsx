'use client';
import  { Breadcrumbs,ProfileHeader,ContactCard, AccountDetails, ActivityTabs } from "./user-detail"
import { User } from '@/app/types/usermanager';

interface UserDetailPageProps {
  user: User;
}

export default function UserDetailPage({ user }: UserDetailPageProps) {
  return (
    <div className="bg-background-light dark:bg-background-dark text-[#111418] dark:text-white overflow-x-hidden">
      <div className="relative flex min-h-screen flex-col">
        <div className="layout-container flex h-full grow flex-col">
          <div className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
              
              <Breadcrumbs userName={user.first_name + user.last_name} />
              
              <ProfileHeader user={user} />
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
                {/* Left Column: User Info & Stats */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  <ContactCard user={user} />
                  <AccountDetails user={user} />
                </div>
                
                {/* Right Column: Tabs & Content */}
                <div className="lg:col-span-8 flex flex-col">
                  <ActivityTabs />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}