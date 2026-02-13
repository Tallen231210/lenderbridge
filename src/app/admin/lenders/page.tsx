/**
 * Lender database page — searchable, filterable table of all lenders.
 * Supports compound filtering (property type, state, loan range, specialty),
 * text search on name/contact, and pagination at 50 per page.
 * The broker uses this to find the right lender for each deal.
 */
"use client";

import { useState, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useDebounce } from "@/hooks/useDebounce";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PROPERTY_TYPES, LOAN_TYPES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

/** US state abbreviations for the state filter */
const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

export default function AdminLendersPage() {
  const [searchText, setSearchText] = useState("");
  const [propertyType, setPropertyType] = useState<string>("all");
  const [state, setState] = useState<string>("all");
  const [loanType, setLoanType] = useState<string>("all");
  const [page, setPage] = useState(0);

  // Debounce search text to avoid firing a query on every keystroke
  const debouncedSearch = useDebounce(searchText, 300);

  const result = useQuery(api.lenders.searchLenders, {
    searchText: debouncedSearch || undefined,
    propertyType: propertyType !== "all" ? propertyType : undefined,
    state: state !== "all" ? state : undefined,
    loanType: loanType !== "all" ? loanType : undefined,
    page,
    pageSize: 50,
  });

  // Reset to first page when filters change
  function handleFilterChange(setter: (v: string) => void, value: string) {
    setter(value);
    setPage(0);
  }

  // Keep previous results visible while new query loads — prevents
  // flash of "No lenders found" between search keystrokes.
  const hasLoadedRef = useRef(false);
  const prevResultRef = useRef(result);
  if (result !== undefined) {
    hasLoadedRef.current = true;
    prevResultRef.current = result;
  }

  // Use the latest result if available, otherwise show previous results
  const displayResult = result ?? prevResultRef.current;
  const lenders = displayResult?.lenders ?? [];
  const total = displayResult?.total ?? 0;
  const hasMore = displayResult?.hasMore ?? false;

  // Only show full-page skeleton before the very first query resolves
  if (!hasLoadedRef.current) {
    return <PageSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lender Database</h1>
        <p className="text-gray-500 mt-1">
          {total.toLocaleString()} lender{total !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Search and filters — always visible, never replaced by skeleton */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search by name or contact..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setPage(0);
              }}
              className="max-w-xs"
            />
            <Select
              value={propertyType}
              onValueChange={(v) => handleFilterChange(setPropertyType, v)}
            >
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Property Types</SelectItem>
                {PROPERTY_TYPES.map((pt) => (
                  <SelectItem key={pt.value} value={pt.value}>
                    {pt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={state}
              onValueChange={(v) => handleFilterChange(setState, v)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {US_STATES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={loanType}
              onValueChange={(v) => handleFilterChange(setLoanType, v)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Loan Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Loan Types</SelectItem>
                {LOAN_TYPES.map((lt) => (
                  <SelectItem key={lt.value} value={lt.value}>
                    {lt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(searchText || propertyType !== "all" || state !== "all" || loanType !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchText("");
                  setPropertyType("all");
                  setState("all");
                  setLoanType("all");
                  setPage(0);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lender table */}
      {lenders.length === 0 ? (
        <EmptyState
          title="No lenders found"
          description="Try adjusting your search or filter criteria."
        />
      ) : (
        <>
          <div className="bg-white rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lender</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Specialties</TableHead>
                  <TableHead>States</TableHead>
                  <TableHead>Loan Range</TableHead>
                  <TableHead>Loan Types</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lenders.map((lender) => (
                  <TableRow key={lender._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {lender.name}
                        </p>
                        {lender.notes && (
                          <p className="text-xs text-gray-400 italic mt-0.5">
                            {lender.notes}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {lender.contact_name && (
                          <p className="text-gray-700">{lender.contact_name}</p>
                        )}
                        {lender.email && (
                          <p className="text-gray-500 text-xs">{lender.email}</p>
                        )}
                        {lender.phone && (
                          <p className="text-gray-500 text-xs">{lender.phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {lender.specialties.slice(0, 3).map((s) => (
                          <Badge
                            key={s}
                            variant="secondary"
                            className="text-xs capitalize"
                          >
                            {s.replace(/_/g, " ")}
                          </Badge>
                        ))}
                        {lender.specialties.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{lender.specialties.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {lender.states_covered.slice(0, 5).join(", ")}
                        {lender.states_covered.length > 5 &&
                          ` +${lender.states_covered.length - 5}`}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {lender.min_loan && lender.max_loan
                          ? `${formatCurrency(lender.min_loan)} - ${formatCurrency(lender.max_loan)}`
                          : lender.min_loan
                            ? `${formatCurrency(lender.min_loan)}+`
                            : lender.max_loan
                              ? `Up to ${formatCurrency(lender.max_loan)}`
                              : "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {lender.loan_types.map((lt) => (
                          <Badge
                            key={lt}
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {lt}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination controls */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {page * 50 + 1}-{Math.min((page + 1) * 50, total)} of{" "}
              {total.toLocaleString()}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasMore}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
