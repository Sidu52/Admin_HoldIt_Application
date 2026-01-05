"use client";

import { FaBars, FaBell, FaSearch } from "react-icons/fa";
import { RiAdminFill } from "react-icons/ri";
import { userProfile } from "@/app/hooks/useDashboard";
import { useAppDispatch } from "@/app/store/hooks";
import { setUser } from "@/app/store/slices/profileSlice";
import { useEffect } from "react";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const dispatch = useAppDispatch();
  const { data, isLoading } = userProfile();

  useEffect(() => {
    if (data?.data?.data) {
      dispatch(setUser(data.data.data));
    }
  }, [data]);

  if(isLoading) return <div>Loading...</div>

  // userProfile
  const userAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuAAzYfl7BKRe8Yq0Ky4eMt1zaqyrEuHMDr4I6_douAxszB0BSuk973GrnoYiLKeou3Wlo0MqudMSMWm-9jaVjn3wSbg_jNEoELHdzr_QC4lHwKzY10qz8bb9Du8-rMlbrm194Op99OQmzDOdWGOuBiIBMIlZ9Ol-fAdp_3fXzGEqOiubwCQDby2CY9uER33f0hX2TvjL1_c0vk3vv1JOBU263NNmssgUTIlfgu4U6-mbiaQt29pT43jQOvl2nc_7HKeIFVHyaCD6Wwn";

  return (
    <header className="sticky top-0 z-40 lg:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111722]">
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="p-2 text-slate-600 dark:text-slate-400 hover:text-[#135bec]"
        >
          <FaBars className="text-xl" />
        </button>
        <div className="flex items-center gap-2">
          <div className="bg-[#135bec]/10 flex items-center justify-center rounded-lg h-8 w-8">
            <RiAdminFill className="text-[#135bec] text-lg" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">Holdit</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-[#135bec]">
          <FaBell className="text-xl" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="h-10 w-10 rounded-full bg-cover bg-center cursor-pointer border border-slate-200 dark:border-slate-600"
          style={{ backgroundImage: `url('${userAvatar}')` }}
        />
      </div>
    </header>
  );
};

export default Header;