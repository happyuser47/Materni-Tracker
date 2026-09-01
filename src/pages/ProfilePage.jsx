import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  UserCircle, Mail, Lock, Camera, Check, AlertCircle,
  Eye, EyeOff, Save, ShieldCheck, KeyRound, Loader2, Trash2,
  Calendar, Briefcase, LogOut, CheckCircle2, RefreshCw
} from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, setCurrentUser, setToastMessage, requestConfirm, setStaffMembers } = useApp();
  const { user, userFullName, fetchUserProfile, logout, isSuperAdmin } = useAuth();

  const [activeSection, setActiveSection] = useState('profile'); // 'profile', 'password'

  // General Profile State
  const [fullName, setFullName] = useState(currentUser?.name || userFullName || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Email Update State
  const [currentEmail, setCurrentEmail] = useState(user?.email || currentUser?.email || '');
  const [newEmail, setNewEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');

  // Password Update State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    setFullName(currentUser?.name || userFullName || '');
    setAvatarUrl(currentUser?.avatar_url || localStorage.getItem(`maternitrack_avatar_${currentUser?.id}`) || '');
    setCurrentEmail(user?.email || currentUser?.email || '');
  }, [currentUser, user, userFullName]);

  // Handle image file selection and compression
  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileError('Image size should be less than 5MB.');
      return;
    }

    setProfileError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setAvatarUrl(compressedDataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    setAvatarUrl('');
    if (currentUser?.id) {
      localStorage.removeItem(`maternitrack_avatar_${currentUser.id}`);
      try {
        await supabase.from('staff').update({ avatar_url: null }).eq('id', currentUser.id);
      } catch (err) {
        console.warn('Remove avatar error:', err);
      }
      setCurrentUser(prev => prev ? { ...prev, avatar_url: '' } : null);
      if (setStaffMembers) {
        setStaffMembers(prev => prev.map(s => s.id === currentUser.id ? { ...s, avatar_url: '' } : s));
      }
    }
  };

  // Save General Profile (Name & Avatar)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);

    try {
      const updatedName = fullName.trim();
      if (!updatedName) {
        setProfileError('Full name cannot be empty.');
        setProfileLoading(false);
        return;
      }

      // 1. Update Auth metadata in Supabase
      await supabase.auth.updateUser({
        data: {
          name: updatedName,
          full_name: updatedName,
          avatar_url: avatarUrl || null
        }
      });

      // 2. Update staff table record in Supabase
      if (currentUser?.id) {
        await supabase
          .from('staff')
          .update({ name: updatedName, avatar_url: avatarUrl || null })
          .eq('id', currentUser.id);

        // Cache avatar in local storage
        if (avatarUrl) {
          localStorage.setItem(`maternitrack_avatar_${currentUser.id}`, avatarUrl);
        } else {
          localStorage.removeItem(`maternitrack_avatar_${currentUser.id}`);
        }

        // 3. Update React App context state
        setCurrentUser(prev => prev ? { ...prev, name: updatedName, avatar_url: avatarUrl } : null);
        if (setStaffMembers) {
          setStaffMembers(prev => prev.map(s => s.id === currentUser.id ? { ...s, name: updatedName, avatar_url: avatarUrl } : s));
        }
      }

      if (user?.id) {
        await fetchUserProfile(user.id);
      }

      setProfileSuccess('Profile information updated successfully!');
      if (setToastMessage) {
        setToastMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setToastMessage(null), 3000);
      }
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      console.error('Profile update failed:', err);
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Update Email Address
  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess('');
    setEmailLoading(true);

    try {
      const emailTrimmed = newEmail.trim().toLowerCase();
      if (!emailTrimmed || !emailTrimmed.includes('@')) {
        setEmailError('Please enter a valid email address.');
        setEmailLoading(false);
        return;
      }

      if (emailTrimmed === currentEmail.toLowerCase()) {
        setEmailError('New email is the same as your current email.');
        setEmailLoading(false);
        return;
      }

      // Update email via Supabase Auth
      const { data, error } = await supabase.auth.updateUser({ email: emailTrimmed });
      if (error) throw error;

      // Update staff record email if possible
      if (currentUser?.id) {
        await supabase
          .from('staff')
          .update({ email: emailTrimmed })
          .eq('id', currentUser.id);
        
        setCurrentUser(prev => prev ? { ...prev, email: emailTrimmed } : null);
      }

      setCurrentEmail(emailTrimmed);
      setNewEmail('');
      setEmailSuccess('Confirmation link sent! Please check your new email inbox to confirm the change.');
      
      if (setToastMessage) {
        setToastMessage({ type: 'success', text: 'Email update initiated. Please check your inbox.' });
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err) {
      console.error('Email update failed:', err);
      setEmailError(err.message || 'Failed to update email.');
    } finally {
      setEmailLoading(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match. Please re-enter.');
      return;
    }

    setPasswordLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setPasswordSuccess('Password changed successfully! You can now use your new password.');
      setNewPassword('');
      setConfirmPassword('');

      if (setToastMessage) {
        setToastMessage({ type: 'success', text: 'Password changed successfully!' });
        setTimeout(() => setToastMessage(null), 3000);
      }
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err) {
      console.error('Password change failed:', err);
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSignOut = () => {
    requestConfirm(
      'Are you sure you want to sign out of your account?',
      async () => {
        try {
          await logout();
        } catch (err) {
          console.error('Logout failed:', err);
        }
      }
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-2xl shadow-sm">
              <UserCircle className="h-7 w-7" />
            </div>
            <span>My Profile & Account</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-1">
            Manage your personal profile, avatar photo, email address, and security credentials.
          </p>
        </div>

        <button
          onClick={handleSignOut}
          className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold rounded-xl transition-all border border-red-200 flex items-center gap-2 cursor-pointer w-fit"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>

      {/* TWO TOP HORIZONTAL TABS (Grid 2-col, No horizontal scroll) */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80">
        <button
          type="button"
          onClick={() => setActiveSection('profile')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 sm:px-6 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
            activeSection === 'profile'
              ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
          }`}
        >
          <UserCircle className="h-4 w-4 shrink-0" />
          <span className="truncate">Personal Info & Email</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('password')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 sm:px-6 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
            activeSection === 'password'
              ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
          }`}
        >
          <KeyRound className="h-4 w-4 shrink-0" />
          <span className="truncate">Password & Security</span>
        </button>
      </div>

      {/* Hidden file input for Avatar upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Column: Framed Uiverse Card */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col items-center">
          
          {/* Framed Profile Card Container */}
          <div className="w-full bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col items-center">
            {/* ========================================================
                From Uiverse.io by Smit-Prajapati (Adapted for MaterniTrack)
               ======================================================== */}
            <div className="uiverse-profile-card">
              {/* Photo Change Button in Top Right */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="card-mail-btn"
                title="Upload or change profile photo"
              >
                <Camera className="h-4 w-4" />
              </button>

              {/* Profile Picture Layer */}
              <div className="card-profile-pic">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} />
                ) : (
                  <div className="avatar-fallback">
                    {(fullName || '?').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Sliding Bottom Container */}
              <div className="card-bottom">
                <div className="card-content">
                  <div>
                    <span className="card-name">{fullName || 'Staff User'}</span>
                    <span className="card-about">
                      <span className="font-semibold text-teal-100">
                        {currentUser?.role === 'Admin' ? 'Clinic Administrator • Doctor' : 'Clinic Staff • Maternal Care'}
                      </span>
                      {isSuperAdmin && (
                        <span className="block text-[10px] font-bold text-amber-200 uppercase tracking-wide mt-0.5">
                          ★ Super Admin
                        </span>
                      )}
                      <span className="text-[11px] opacity-90 flex items-center gap-1.5 mt-1.5 truncate text-white">
                        <Mail className="h-3 w-3 shrink-0" /> {currentEmail || user?.email || 'No email configured'}
                      </span>
                    </span>
                  </div>

                  <div className="card-bottom-actions">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="card-action-btn"
                    >
                      <Camera className="h-3 w-3" /> Change Photo
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="card-action-btn card-action-btn-danger"
                        title="Remove photo"
                      >
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-medium mt-3 flex items-center gap-1 text-center">
              <span>✨</span> Hover card to reveal interactive profile sheet
            </p>
          </div>

        </div>

        {/* Right Column: Settings & Security Forms */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          
          {/* Card 1: Personal Profile */}
          {activeSection === 'profile' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-100 text-teal-700 rounded-xl">
                  <UserCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Personal Information</h3>
                  <p className="text-xs text-slate-500">Update your name and clinic identity.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 md:p-8 space-y-5">
              {profileError && (
                <div className="p-3.5 bg-red-50 text-red-700 text-xs sm:text-sm rounded-xl border border-red-200 flex items-center gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {profileSuccess && (
                <div className="p-3.5 bg-emerald-50 text-emerald-700 text-xs sm:text-sm rounded-xl border border-emerald-200 flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Full Name / Title
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Usama Akram"
                    required
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-medium transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Assigned Role
                  </label>
                  <div className="px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 flex items-center justify-between">
                    <span>{currentUser?.role || 'Staff'}</span>
                    <ShieldCheck className="h-4 w-4 text-teal-600" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-teal-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {profileLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>
          )}

          {/* Card 2: Email / Gmail Update */}
          {activeSection === 'profile' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Email / Gmail Address</h3>
                  <p className="text-xs text-slate-500">Update the email address used for login and notifications.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateEmail} className="p-6 md:p-8 space-y-5">
              {emailError && (
                <div className="p-3.5 bg-red-50 text-red-700 text-xs sm:text-sm rounded-xl border border-red-200 flex items-center gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{emailError}</span>
                </div>
              )}

              {emailSuccess && (
                <div className="p-3.5 bg-emerald-50 text-emerald-700 text-xs sm:text-sm rounded-xl border border-emerald-200 flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{emailSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Current Email
                  </label>
                  <input
                    type="email"
                    value={currentEmail}
                    disabled
                    className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    New Email / Gmail Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. usama.clinic@gmail.com"
                    required
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-medium transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={emailLoading || !newEmail.trim()}
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-sky-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {emailLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  <span>Update Email</span>
                </button>
              </div>
            </form>
          </div>
          )}

          {/* Card 3: Password & Security */}
          {activeSection === 'password' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Change Password</h3>
                <p className="text-xs text-slate-500">Set a new security password.</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              {passwordError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  New Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-medium transition-all"
                />
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700 flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5 text-slate-500" /> Security Tip:
                </p>
                <p>Include letters, numbers, and symbols to ensure maximum account protection.</p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passwordLoading || !newPassword}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {passwordLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                  <span>Change Password</span>
                </button>
              </div>
            </form>
          </div>
          )}
        </div>

      </div>
    </div>
  );
}
