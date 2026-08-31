import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  UserCircle, Mail, Lock, Camera, Check, AlertCircle,
  Eye, EyeOff, X, Save, ShieldCheck, KeyRound, Loader2, Trash2
} from 'lucide-react';

export default function ProfileModal({ isOpen, onClose }) {
  const { currentUser, setCurrentUser, setToastMessage } = useApp();
  const { user, userFullName, fetchUserProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('general'); // 'general', 'email', 'password'
  
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
    if (isOpen) {
      setFullName(currentUser?.name || userFullName || '');
      setAvatarUrl(currentUser?.avatar_url || localStorage.getItem(`maternitrack_avatar_${currentUser?.id}`) || '');
      setCurrentEmail(user?.email || currentUser?.email || '');
      setProfileError('');
      setProfileSuccess('');
      setEmailError('');
      setEmailSuccess('');
      setPasswordError('');
      setPasswordSuccess('');
      setNewPassword('');
      setConfirmPassword('');
      setNewEmail('');
    }
  }, [isOpen, currentUser, user, userFullName]);

  if (!isOpen) return null;

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
        // Compress image using canvas
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

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    if (currentUser?.id) {
      localStorage.removeItem(`maternitrack_avatar_${currentUser.id}`);
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

      // 2. Update staff table record
      if (currentUser?.id) {
        try {
          await supabase
            .from('staff')
            .update({ name: updatedName, avatar_url: avatarUrl || null })
            .eq('id', currentUser.id);
        } catch {
          // Fallback if avatar_url column is not present in staff table schema
          await supabase
            .from('staff')
            .update({ name: updatedName })
            .eq('id', currentUser.id);
        }

        // Cache avatar in local storage
        if (avatarUrl) {
          localStorage.setItem(`maternitrack_avatar_${currentUser.id}`, avatarUrl);
        } else {
          localStorage.removeItem(`maternitrack_avatar_${currentUser.id}`);
        }

        // 3. Update React App context state
        setCurrentUser(prev => prev ? { ...prev, name: updatedName, avatar_url: avatarUrl } : null);
      }

      if (user?.id) {
        await fetchUserProfile(user.id);
      }

      setProfileSuccess('Profile updated successfully!');
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
      setEmailSuccess('Confirmation link sent! Please check your new email to verify the change.');
      
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

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden my-auto animate-in zoom-in-95 duration-200 max-h-[95vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-teal-50/60 via-slate-50 to-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-600 text-white rounded-xl shadow-sm">
              <UserCircle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Account & Profile Settings</h2>
              <p className="text-xs text-slate-500">Manage your avatar, name, email, and password</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'general'
                ? 'border-teal-600 text-teal-700 bg-white -mb-px rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCircle className="h-4 w-4" /> Profile Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'email'
                ? 'border-teal-600 text-teal-700 bg-white -mb-px rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="h-4 w-4" /> Email / Gmail
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'password'
                ? 'border-teal-600 text-teal-700 bg-white -mb-px rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="h-4 w-4" /> Password
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB 1: GENERAL PROFILE & AVATAR */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              
              {profileError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {profileSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {/* Avatar Upload Section */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="relative group shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={fullName}
                      className="h-20 w-20 rounded-full object-cover ring-4 ring-teal-500/30 shadow-md"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                      {(fullName || '?').charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarFileChange}
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                  />

                  {/* Camera overlay */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Upload photo"
                  >
                    <Camera className="h-5 w-5 mb-0.5" />
                    <span className="text-[9px] font-semibold">Change</span>
                  </button>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Profile Photo</h4>
                    <p className="text-xs text-slate-500">Upload a JPG, PNG, or WebP photo (Max 5MB).</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:border-teal-500 hover:text-teal-700 text-xs font-semibold text-slate-700 rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Camera className="h-3.5 w-3.5 text-teal-600" />
                      Upload Avatar
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Full Name / Title
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Usama Akram"
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-medium transition-all"
                />
              </div>

              {/* Role & Access Info (Read only) */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider mb-1">
                    System Role
                  </span>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-teal-600" />
                    <span className="text-xs font-bold text-slate-800">{currentUser?.role || 'Staff'}</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider mb-1">
                    Current Email
                  </span>
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-700 truncate">{currentEmail || 'Not configured'}</span>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-teal-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {profileLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CHANGE EMAIL / GMAIL */}
          {activeTab === 'email' && (
            <form onSubmit={handleUpdateEmail} className="space-y-4">
              {emailError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{emailError}</span>
                </div>
              )}

              {emailSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>{emailSuccess}</span>
                </div>
              )}

              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-800 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-sky-600" /> Changing your account email
                </p>
                <p className="text-sky-700/90 text-[11px]">
                  When you update your email, a verification link will be sent to the new address to ensure you own it.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Current Email
                </label>
                <input
                  type="email"
                  value={currentEmail}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  New Email / Gmail Address
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. usama.clinic@gmail.com"
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-medium transition-all"
                />
              </div>

              {/* Submit Email */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={emailLoading || !newEmail.trim()}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-teal-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {emailLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  <span>Update Email</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: CHANGE PASSWORD */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0" />
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
                    placeholder="Enter new password (min. 6 characters)"
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
                  Confirm New Password
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

              {/* Password strength tips */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700 flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5 text-slate-500" /> Security Tip:
                </p>
                <p>Use a combination of uppercase letters, numbers, and symbols for a stronger password.</p>
              </div>

              {/* Submit Password */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading || !newPassword}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-teal-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {passwordLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                  <span>Change Password</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
