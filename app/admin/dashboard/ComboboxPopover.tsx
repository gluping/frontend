"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus } from "lucide-react"; // Make sure to install lucide-react for icons or use any other icon library

type Status = {
  value: string;
  label: string;
};

const statuses: Status[] = [
  { value: "Alappuzha", label: "Alappuzha" },
  { value: "Kollam", label: "Kollam" },
  { value: "Ambalappuzha", label: "Ambalapuzha" },
  { value: "Muhamma", label: "Muhamma" },
];

export function ComboboxPopover() {
  const [open, setOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<Status | null>(
    null
  );

  const handleCreateNewBranch = () => {
    // Logic for creating a new branch (you can show a modal or navigate to a form)
    console.log("Create New Branch clicked");
    setOpen(false);
  };

  return (
    <div className="fixed top-4 right-4 flex items-center space-x-4 z-50">
      <p className="text-sm text-muted-foreground">Branch</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[150px] justify-start">
            {selectedStatus ? <>{selectedStatus.label}</> : <>Alappuzha</>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" side="bottom" align="start">
          <Command>
            <CommandInput placeholder="Change branch..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>

              {/* Add Create New Branch option */}
              <CommandGroup>
                <CommandItem
                  onSelect={handleCreateNewBranch}
                  className="text-blue-600 font-semibold"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Branch
                </CommandItem>
              </CommandGroup>

              <CommandGroup>
                {statuses.map((status) => (
                  <CommandItem
                    key={status.value}
                    value={status.value}
                    onSelect={(value) => {
                      setSelectedStatus(
                        statuses.find((status) => status.value === value) ||
                          null
                      );
                      setOpen(false);
                    }}
                  >
                    {status.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default ComboboxPopover;
