import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field: 'name' | 'weight' | 'height' | 'dob' | 'sex';
  currentValue: string;
  onSave: (value: any) => void;
}

export const EditProfileDialog = ({
  open,
  onOpenChange,
  field,
  currentValue,
  onSave,
}: EditProfileDialogProps) => {
  const [value, setValue] = useState(currentValue);

  const handleSave = () => {
    onSave(value);
    onOpenChange(false);
  };

  const getFieldConfig = () => {
    switch (field) {
      case 'name':
        return { title: 'Edit Name', type: 'text', label: 'Name' };
      case 'weight':
        return { title: 'Edit Weight', type: 'number', label: 'Weight (kg)' };
      case 'height':
        return { title: 'Edit Height', type: 'number', label: 'Height (cm)' };
      case 'dob':
        return { title: 'Edit Date of Birth', type: 'date', label: 'Date of Birth' };
      case 'sex':
        return { title: 'Edit Sex', type: 'select', label: 'Sex' };
      default:
        return { title: 'Edit', type: 'text', label: 'Value' };
    }
  };

  const config = getFieldConfig();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{config.label}</Label>
            {config.type === 'select' ? (
              <Select value={value} onValueChange={setValue}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                type={config.type}
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
