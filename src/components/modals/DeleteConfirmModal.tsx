"use client"
import React from "react"
import { Modal } from "@/components/ui/modal"
import Button from "../ui/button/Button"
import { Trash2 } from "lucide-react"

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  count: number
  title?: string
  description?: string
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  count,
  title = "Confirm Deletion",
  description = "This action cannot be undone.",
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xs mx-4 p-6">
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Professional warning icon */}
        <div className="w-20 h-20 bg-error-50 dark:bg-error-500/10 border-4 border-error-100 dark:border-error-500/30 rounded-2xl flex items-center justify-center p-5">
          <Trash2 className="w-12 h-12 text-error-500 dark:text-error-400" />
        </div>
        
        {/* Professional title & description */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white leading-tight">
            {title}
          </h2>
          <div>
            <p className="text-base text-gray-700 dark:text-gray-200 font-medium">
              Delete <span className="font-semibold text-error-600 dark:text-error-400">{count}</span>{' '}
              selected record{count !== 1 ? 's' : ''}?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        
        {/* Professional button layout */}
        <div className="flex gap-3 w-full pt-1">
          <Button
            variant="outline"
            className="flex-1 h-11 text-sm font-medium border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1 h-11 text-sm font-semibold bg-error-500 hover:bg-error-600 text-white shadow-theme-md hover:shadow-theme-lg transform hover:-translate-y-0.5 transition-all duration-200"
            onClick={onConfirm}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  )
}
