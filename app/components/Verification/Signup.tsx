"use client";
import { useState, useEffect } from "react";
import LoadingSpinner from "@/app/components/Common/LoadingSpinner";
import {
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaExclamationTriangle,
  FaUser,
  FaEnvelope,
  FaUserTag,
  FaVenusMars,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import { RiShieldKeyholeFill, RiAdminFill } from "react-icons/ri";
import { useAuth } from "@/app/hooks/useAuth";

type ApiResponse = {
  success: boolean;
  message: string;
  data?: {
    email: string;
    admin: string;
    [key: string]: any;
  };
};
interface SignupPageProps {
  data: {
    email: string;
    role: string;
  };
  token: string;
}
type FormData = {
  email: string;
  role: string;
  gender: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
};

export default function SignupPage({ data, token }: SignupPageProps) {
  const { signup, isLoading, error } = useAuth();

  console.log("DATA", data);
  const [formData, setFormData] = useState<FormData>({
    email: data?.email || "",
    role: data?.role || "",
    gender: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

  // Mock background image URL
  const backgroundImageUrl =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCvivsYtlENCc1EapMYDzhmDRsydaRf5jj1XUIiKcnNE4s4gdwzDONPPLeaNlNAYtZuQ_Fz27dzhAbLvADHqUATRiojgwfh5FI7Futbm0KvAUvBP_-uL-ejGgn1HUzIg8VwAd-jtKKb20jdXk-XgC0wF3DZVLvd2yHLhxsKP_VwtHmrpQWZw1MSQcWqnimZMpFvX0HRXMV6_oHPAWwERhBJzbOEkrQ22WI8fku9zeyLm1QuU-4AnydioV0HyBpuD0dcHs6z7EnXg7iQ";

  useEffect(() => {
    if (formData.password) {
      calculatePasswordStrength(formData.password);
    }
  }, [formData.password]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (formErrors[name as keyof FormData]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const calculatePasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    setPasswordStrength(Math.min(strength, 5));
  };

  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};
    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.gender) errors.gender = "Gender is required";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    if (!formData.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      signup({
        token,
        credentials: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          dateOfBirth: formData.dateOfBirth,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          gender: formData.gender,
        },
      });

      // Reset form after successful submission
      setFormData({
        email: data?.email || "",
        role: data?.role || "",
        gender: "",
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        dateOfBirth: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Signup error:", error);
      alert("Failed to create account. Please try again.");
    }
  };

  const handleContactSupport = () => {
    console.log("Contact support clicked");
    // Implement contact support logic
  };

  const getStrengthText = () => {
    switch (passwordStrength) {
      case 0:
        return "No password";
      case 1:
        return "Very Weak";
      case 2:
        return "Weak";
      case 3:
        return "Fair";
      case 4:
        return "Strong";
      case 5:
        return "Very Strong";
      default:
        return "";
    }
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-green-500";
      case 5:
        return "bg-green-600";
      default:
        return "bg-gray-300 dark:bg-[#324467]";
    }
  };

  console.log("formData", formData);

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-950 relative overflow-hidden py-10">
      {/* Background Pattern Effect */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-background-light dark:bg-background-dark"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]"></div>
      </div>

      {/* Main Card Container */}
      <div className="relative w-full max-w-[800px] z-10 px-4">
        <div className="w-full bg-white dark:bg-[#161c27] rounded-xl shadow-2xl border border-gray-200 dark:border-[#324467]/40 overflow-hidden flex flex-col">
          {/* Hero Image Banner */}
          <div
            className="h-40 w-full bg-center bg-no-repeat bg-cover relative"
            style={{ backgroundImage: `url('${backgroundImageUrl}')` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#161c27] to-transparent opacity-90"></div>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <div className="bg-[#192233]/80 backdrop-blur-md border border-[#324467] rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                <RiAdminFill className="text-primary text-xl" />
                <span className="text-white font-bold text-sm tracking-wide">
                  HOLDIT ADMIN PORTAL
                </span>
              </div>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-10 flex flex-col gap-6">
            {/* Header Text */}
            <div className="flex flex-col text-center">
              <h2 className="text-gray-900 dark:text-white tracking-tight text-[28px] font-bold leading-tight">
                Complete Your Account Setup
              </h2>
              <p className="text-gray-500 dark:text-[#92a4c9] text-base font-normal leading-normal mt-2">
                Your verification was successful. Please provide the required
                information to complete your account.
              </p>
            </div>

            {/* Form Section */}
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Personal Information Section */}
                <div className="space-y-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-[#324467] pb-2">
                    Personal Information
                  </h3>

                  {/* First Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-700 dark:text-white text-sm font-medium leading-normal flex items-center gap-2">
                      <FaUser className="text-gray-400" />
                      First Name *
                    </label>
                    <input
                      className={`form-input flex w-full min-w-0 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border ${
                        formErrors.firstName
                          ? "border-red-500"
                          : "border-gray-300 dark:border-[#324467]"
                      } bg-gray-50 dark:bg-[#192233] focus:border-primary h-12 placeholder:text-gray-400 dark:placeholder:text-[#92a4c9] px-4 text-base font-normal leading-normal transition-all`}
                      name="firstName"
                      placeholder="First Name"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                    {formErrors.firstName && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.firstName}
                      </p>
                    )}
                  </div>

                  {/* Email (Read-only) */}
                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-gray-700 dark:text-white text-sm font-medium leading-normal flex items-center gap-2">
                      <FaEnvelope className="text-gray-400" />
                      Email
                    </label>
                    <input
                      className="form-input flex w-full min-w-0 resize-none overflow-hidden rounded-lg text-gray-500 dark:text-[#92a4c9] focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-[#324467] bg-gray-100 dark:bg-[#1a2335] h-12 px-4 text-base font-normal leading-normal transition-all cursor-not-allowed"
                      value={formData.email}
                      readOnly
                      disabled
                    />
                    <p className="text-xs text-gray-400 dark:text-[#6a7a96] absolute -bottom-5 right-0">
                      Provided during invitation
                    </p>
                  </div>

                  {/* Gender */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-700 dark:text-white text-sm font-medium leading-normal flex items-center gap-2">
                      <FaVenusMars className="text-gray-400" />
                      Gender *
                    </label>
                    <select
                      className={`form-input flex w-full min-w-0 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border ${
                        formErrors.gender
                          ? "border-red-500"
                          : "border-gray-300 dark:border-[#324467]"
                      } bg-gray-50 dark:bg-[#192233] focus:border-primary h-12 placeholder:text-gray-400 dark:placeholder:text-[#92a4c9] px-4 text-base font-normal leading-normal transition-all`}
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">
                        Prefer not to say
                      </option>
                    </select>
                    {formErrors.gender && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.gender}
                      </p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-700 dark:text-white text-sm font-medium leading-normal flex items-center gap-2">
                      <FaCalendarAlt className="text-gray-400" />
                      Date of Birth *
                    </label>
                    <input
                      className={`form-input flex w-full min-w-0 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border ${
                        formErrors.dateOfBirth
                          ? "border-red-500"
                          : "border-gray-300 dark:border-[#324467]"
                      } bg-gray-50 dark:bg-[#192233] focus:border-primary h-12 placeholder:text-gray-400 dark:placeholder:text-[#92a4c9] px-4 text-base font-normal leading-normal transition-all`}
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      max={new Date().toISOString().split("T")[0]}
                    />
                    {formErrors.dateOfBirth && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.dateOfBirth}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-700 dark:text-white text-sm font-medium leading-normal flex items-center gap-2">
                      <FaPhone className="text-gray-400" />
                      Phone Number *
                    </label>
                    <input
                      className={`form-input flex w-full min-w-0 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border ${
                        formErrors.phone
                          ? "border-red-500"
                          : "border-gray-300 dark:border-[#324467]"
                      } bg-gray-50 dark:bg-[#192233] focus:border-primary h-12 placeholder:text-gray-400 dark:placeholder:text-[#92a4c9] px-4 text-base font-normal leading-normal transition-all`}
                      name="phone"
                      placeholder="000000000"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                    {formErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Professional Information & Credentials Section */}
                <div className="space-y-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-[#324467] pb-2">
                    Professional Information
                  </h3>

                  {/* Last Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-700 dark:text-white text-sm font-medium leading-normal flex items-center gap-2">
                      <FaUser className="text-gray-400" />
                      Last Name *
                    </label>
                    <input
                      className={`form-input flex w-full min-w-0 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border ${
                        formErrors.lastName
                          ? "border-red-500"
                          : "border-gray-300 dark:border-[#324467]"
                      } bg-gray-50 dark:bg-[#192233] focus:border-primary h-12 placeholder:text-gray-400 dark:placeholder:text-[#92a4c9] px-4 text-base font-normal leading-normal transition-all`}
                      name="lastName"
                      placeholder="Last Name"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                    {formErrors.lastName && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.lastName}
                      </p>
                    )}
                  </div>

                  {/* Role (Read-only) */}
                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-gray-700 dark:text-white text-sm font-medium leading-normal flex items-center gap-2">
                      <FaUserTag className="text-gray-400" />
                      Role
                    </label>
                    <input
                      className="form-input uppercase flex w-full min-w-0 resize-none overflow-hidden rounded-lg text-gray-500 dark:text-[#92a4c9] focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-[#324467] bg-gray-100 dark:bg-[#1a2335] h-12 px-4 text-base font-normal leading-normal transition-all cursor-not-allowed"
                      value={formData.role}
                      readOnly
                      disabled
                    />
                    <p className="text-xs text-gray-400 dark:text-[#6a7a96] absolute -bottom-5 right-0">
                      Assigned by administrator
                    </p>
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-700 dark:text-white text-sm font-medium leading-normal flex items-center gap-2">
                      <RiShieldKeyholeFill className="text-gray-400" />
                      Create Password *
                    </label>
                    <div className="relative flex w-full items-stretch rounded-lg group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <RiShieldKeyholeFill className="text-gray-400 dark:text-[#92a4c9] group-focus-within:text-primary transition-colors text-[20px]" />
                      </div>
                      <input
                        className={`form-input flex w-full min-w-0 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border ${
                          formErrors.password
                            ? "border-red-500"
                            : "border-gray-300 dark:border-[#324467]"
                        } bg-gray-50 dark:bg-[#192233] focus:border-primary h-12 placeholder:text-gray-400 dark:placeholder:text-[#92a4c9] pl-11 pr-12 text-base font-normal leading-normal transition-all`}
                        name="password"
                        placeholder="Enter strong password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                        className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-gray-400 dark:text-[#92a4c9] hover:text-primary transition-colors cursor-pointer z-10 focus:outline-none disabled:opacity-50"
                      >
                        {showPassword ? (
                          <FaEyeSlash className="text-[20px]" />
                        ) : (
                          <FaEye className="text-[20px]" />
                        )}
                      </button>
                    </div>

                    {/* Strength Meter */}
                    <div className="flex gap-1 mt-1 h-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`flex-1 rounded-full transition-all duration-300 ${
                            level <= passwordStrength
                              ? getStrengthColor()
                              : "bg-gray-300 dark:bg-[#324467]"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-0.5">
                      <p className="text-xs text-gray-500 dark:text-[#6a7a96]">
                        {getStrengthText()}
                      </p>
                      {formData.password && passwordStrength < 3 && (
                        <p className="text-xs text-yellow-500 dark:text-yellow-400 flex items-center gap-1">
                          <FaExclamationTriangle className="text-[10px]" />
                          Use uppercase, lowercase, numbers & symbols
                        </p>
                      )}
                    </div>
                    {formErrors.password && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-700 dark:text-white text-sm font-medium leading-normal flex items-center gap-2">
                      <FaCheck className="text-gray-400" />
                      Confirm Password *
                    </label>
                    <div className="relative flex w-full items-stretch rounded-lg group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <FaCheck
                          className={`text-[20px] transition-colors ${
                            formData.confirmPassword &&
                            formData.password === formData.confirmPassword
                              ? "text-green-500"
                              : "text-gray-400 dark:text-[#92a4c9] group-focus-within:text-primary"
                          }`}
                        />
                      </div>
                      <input
                        className={`form-input flex w-full min-w-0 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border ${
                          formErrors.confirmPassword
                            ? "border-red-500"
                            : "border-gray-300 dark:border-[#324467]"
                        } bg-gray-50 dark:bg-[#192233] focus:border-primary h-12 placeholder:text-gray-400 dark:placeholder:text-[#92a4c9] pl-11 pr-12 text-base font-normal leading-normal transition-all`}
                        name="confirmPassword"
                        placeholder="Re-enter password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        disabled={isLoading}
                        className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-gray-400 dark:text-[#92a4c9] hover:text-primary transition-colors cursor-pointer z-10 focus:outline-none disabled:opacity-50"
                      >
                        {showConfirmPassword ? (
                          <FaEyeSlash className="text-[20px]" />
                        ) : (
                          <FaEye className="text-[20px]" />
                        )}
                      </button>
                    </div>
                    {formErrors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.confirmPassword}
                      </p>
                    )}
                    {formData.confirmPassword &&
                    !formErrors.confirmPassword &&
                    formData.password === formData.confirmPassword ? (
                      <p className="text-xs text-green-500 dark:text-green-400 mt-1">
                        ✓ Passwords match
                      </p>
                    ) : (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                        Passwords do not match
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {/* Address */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-gray-700 dark:text-white text-sm font-medium leading-normal flex items-center gap-2">
                  <FaMapMarkerAlt className="text-gray-400" />
                  Address
                </label>
                <textarea
                  className={`form-input flex w-full min-w-0 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-[#324467] bg-gray-50 dark:bg-[#192233] focus:border-primary h-24 placeholder:text-gray-400 dark:placeholder:text-[#92a4c9] px-4 py-3 text-base font-normal leading-normal transition-all`}
                  name="address"
                  placeholder="123 Main St, City, State, ZIP"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  rows={3}
                />
              </div>
              {/* Action Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 h-12 px-5 text-white text-base font-bold leading-normal tracking-wide shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="text-white" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <RiShieldKeyholeFill className="text-lg" />
                      <span>Complete Account Setup</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Support Section */}
            <div className="border-t border-gray-200 dark:border-[#324467] pt-4 mt-2">
              <p className="text-center text-sm text-gray-500 dark:text-[#92a4c9]">
                Having trouble setting up?{" "}
                <button
                  onClick={handleContactSupport}
                  className="text-primary hover:text-blue-400 font-medium transition-colors cursor-pointer focus:outline-none"
                >
                  Contact Support
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
