import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users } from 'lucide-react';

export default function MarketingSettingsManager({ settings, handleInputChange }) {
  
  const handleDateChange = (e) => {
    // Ensure the value is in ISO format for consistency
    const date = new Date(e.target.value);
    handleInputChange('marketing_settings', 'visitor_counter_start_date', date.toISOString());
  };

  // Format the date for the datetime-local input
  const getFormattedDate = () => {
    const dateStr = settings.marketing_settings?.visitor_counter_start_date;
    if (!dateStr) return '';
    const date = new Date(dateStr);
    // Adjust for timezone offset to display local time correctly
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - timezoneOffset);
    return localDate.toISOString().slice(0, 16);
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-purple-600"/>Marketing & Social Proof</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-slate-50 rounded-lg">
          <h3 className="font-semibold text-slate-800 mb-2">Public Visitor Counter</h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="visitor-base">Visitor Counter Base</Label>
              <Input
                id="visitor-base"
                type="number"
                value={settings.marketing_settings?.visitor_counter_base || 0}
                onChange={(e) => handleInputChange('marketing_settings', 'visitor_counter_base', parseInt(e.target.value, 10) || 0)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="visitor-start-date">Counter Start Date</Label>
              <Input
                id="visitor-start-date"
                type="datetime-local"
                value={getFormattedDate()}
                onChange={handleDateChange}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}