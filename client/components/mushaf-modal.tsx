"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

interface MushafModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageNumber: number;
}

export function MushafModal({ isOpen, onClose, pageNumber }: MushafModalProps) {
  const [currentPage, setCurrentPage] = useState(pageNumber);
  useEffect(() => {
    setCurrentPage(pageNumber);
  }, [pageNumber]);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Mushaf Page {currentPage}</DialogTitle>
          <DialogDescription>View the verse in the Mushaf</DialogDescription>
        </DialogHeader>
        <div className="flex justify-center items-center p-4">
          <Button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === 1}
            variant="outline"
            className="mx-4"
          >
            {<FaArrowLeft />}
          </Button>
          <Image
            src={`/pngs/${currentPage}.png`}
            alt={`Mushaf page ${currentPage}`}
            width={800}
            height={1200}
            className="w-full h-auto"
            unoptimized
          />
          <Button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 604}
            variant="outline"
            className="mx-4"
          >
            {<FaArrowRight />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
