import React, { useState, useEffect } from 'react';
import { AdminSettingsState } from '@/types/admin';
import {
  Globe,
  Bell,
  ShieldCheck,
  Save,
  Lock,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { toast } from 'sonner';

const DEFAULT_SETTINGS: AdminSettingsState = {
  appName: 'Invoicely SaaS',
  supportEmail: 'admin@invoicely.app',
  currency: 'USD ($)',
  timezone: 'UTC (GMT+0)',
  enableSignupNotifications: true,
  enableChurnAlerts: true,
  churnThresholdPercent: 5.0,
  enablePaymentFailAlerts: true,
  apiKey: 'inv_live_998124801284091240182409',
  twoFactorEnforced: true
};

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<AdminSettingsState>(() => {
    const saved = localStorage.getItem('invoicely_admin_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [showApiKey, setShowApiKey] = useState<boolean>(false);

  const handleSave = () => {
    localStorage.setItem('invoicely_admin_settings', JSON.stringify(settings));
    toast.success('Admin settings saved successfully!');
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(settings.apiKey);
    toast.success('API Key copied to clipboard');
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-up max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Admin Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure platform parameters, automated admin alerts, and security credentials.
          </p>
        </div>
        <Button
          onClick={handleSave}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-2 rounded-xl"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {/* Settings Tab Navigation */}
      <Tabs defaultValue="general" className="w-full space-y-6">
        <TabsList className="bg-white/80 dark:bg-[#0D111D]/80 border border-slate-200/80 dark:border-slate-800/80 p-1 rounded-2xl w-full sm:w-auto justify-start">
          <TabsTrigger value="general" className="rounded-xl text-xs font-semibold gap-2">
            <Globe className="h-3.5 w-3.5" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-xl text-xs font-semibold gap-2">
            <Bell className="h-3.5 w-3.5" />
            Notifications & Alerts
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl text-xs font-semibold gap-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            Security & API Keys
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: General Settings */}
        <TabsContent value="general">
          <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0D111D]/80 backdrop-blur-sm shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Platform Configuration
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Core identity settings for your internal application instance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Application Title</Label>
                  <Input
                    value={settings.appName}
                    onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                    className="rounded-xl border-slate-200 dark:border-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Support Contact Email</Label>
                  <Input
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    className="rounded-xl border-slate-200 dark:border-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Default Base Currency</Label>
                  <Input
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="rounded-xl border-slate-200 dark:border-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">System Timezone</Label>
                  <Input
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="rounded-xl border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Notifications & Alerts */}
        <TabsContent value="notifications">
          <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0D111D]/80 backdrop-blur-sm shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Admin Email Alerts & Thresholds
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Receive real-time notifications for critical customer events and billing issues.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                <div>
                  <Label className="text-xs font-bold text-slate-900 dark:text-white">New Signup Digest</Label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Receive daily email notifications when new accounts are created.
                  </p>
                </div>
                <Switch
                  checked={settings.enableSignupNotifications}
                  onCheckedChange={(val) => setSettings({ ...settings, enableSignupNotifications: val })}
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                <div>
                  <Label className="text-xs font-bold text-slate-900 dark:text-white">High Churn Rate Alert</Label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Trigger an urgency notification if monthly churn exceeds {settings.churnThresholdPercent}%.
                  </p>
                </div>
                <Switch
                  checked={settings.enableChurnAlerts}
                  onCheckedChange={(val) => setSettings({ ...settings, enableChurnAlerts: val })}
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                <div>
                  <Label className="text-xs font-bold text-slate-900 dark:text-white">Failed Payment Warnings</Label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Alert super admins immediately on credit card transaction declines.
                  </p>
                </div>
                <Switch
                  checked={settings.enablePaymentFailAlerts}
                  onCheckedChange={(val) => setSettings({ ...settings, enablePaymentFailAlerts: val })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Security & API Keys */}
        <TabsContent value="security">
          <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0D111D]/80 backdrop-blur-sm shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Admin Authentication & API Access
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Manage high-privilege API tokens and security enforcement.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-xs">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Master Admin API Key</Label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      readOnly
                      value={settings.apiKey}
                      className="pr-10 font-mono text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button variant="outline" onClick={copyApiKey} className="gap-1.5 rounded-xl text-xs">
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                <div>
                  <Label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-amber-500" />
                    Enforce Two-Factor Authentication (2FA)
                  </Label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Require 2FA verification for all admin level logins.
                  </p>
                </div>
                <Switch
                  checked={settings.twoFactorEnforced}
                  onCheckedChange={(val) => setSettings({ ...settings, twoFactorEnforced: val })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
