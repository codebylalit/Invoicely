import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface RecurringInvoiceSettingsProps {
    isRecurring: boolean;
    onRecurringChange: (value: boolean) => void;
    frequency: 'weekly' | 'monthly' | 'custom';
    onFrequencyChange: (value: 'weekly' | 'monthly' | 'custom') => void;
    interval: number;
    onIntervalChange: (value: number) => void;
    startDate: string;
    onStartDateChange: (value: string) => void;
    endDate: string;
    onEndDateChange: (value: string) => void;
    isProUser: boolean;
}

export const RecurringInvoiceSettings: React.FC<RecurringInvoiceSettingsProps> = ({
    isRecurring,
    onRecurringChange,
    frequency,
    onFrequencyChange,
    interval,
    onIntervalChange,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange,
    isProUser,
}) => {
    if (!isProUser) {
        return (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Recurring invoices are available for Pro users only. Upgrade to Pro to enable this feature.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-between">
                <Label htmlFor="recurring">Recurring Invoice</Label>
                <Switch
                    id="recurring"
                    checked={isRecurring}
                    onCheckedChange={onRecurringChange}
                />
            </div>

            {isRecurring && (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="frequency">Frequency</Label>
                            <Select
                                value={frequency}
                                onValueChange={(value: 'weekly' | 'monthly' | 'custom') => onFrequencyChange(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="interval">Interval</Label>
                            <Input
                                id="interval"
                                type="number"
                                min="1"
                                value={interval}
                                onChange={(e) => onIntervalChange(parseInt(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => onStartDateChange(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="endDate">End Date (Optional)</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => onEndDateChange(e.target.value)}
                                min={startDate}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}; 