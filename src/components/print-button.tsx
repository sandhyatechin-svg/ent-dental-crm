"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

interface PrintButtonProps {
  contentRef: React.RefObject<HTMLDivElement>
  documentTitle: string
  children: React.ReactNode
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  disabled?: boolean
}

export function PrintButton({
  contentRef,
  documentTitle,
  children,
  variant = "outline",
  size = "default",
  className,
  disabled = false,
}: PrintButtonProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handlePrint = () => {
    if (!isClient || !contentRef.current) return

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (!printWindow) return

    // Get the content to print
    const content = contentRef.current.innerHTML
    
    // Write the content to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${documentTitle}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: white;
              color: black;
            }
            @media print {
              body { margin: 0; padding: 0; }
              @page { margin: 0.5in; }
            }
            .no-print { display: none !important; }
            button { display: none !important; }
            .print-container { width: 100%; max-width: none; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #333; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .text-lg { font-size: 18px; }
            .text-xl { font-size: 20px; }
            .text-2xl { font-size: 24px; }
            .text-3xl { font-size: 30px; }
            .mb-2 { margin-bottom: 8px; }
            .mb-4 { margin-bottom: 16px; }
            .mb-6 { margin-bottom: 24px; }
            .mt-2 { margin-top: 8px; }
            .mt-4 { margin-top: 16px; }
            .mt-6 { margin-top: 24px; }
            .p-4 { padding: 16px; }
            .p-6 { padding: 24px; }
            .p-8 { padding: 32px; }
            .border-b { border-bottom: 1px solid #ccc; }
            .border-b-2 { border-bottom: 2px solid #ccc; }
            .border-t { border-top: 1px solid #ccc; }
            .border { border: 1px solid #ccc; }
            .rounded { border-radius: 4px; }
            .bg-gray-50 { background-color: #f9fafb; }
            .bg-blue-50 { background-color: #eff6ff; }
            .bg-yellow-50 { background-color: #fefce8; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-700 { color: #374151; }
            .text-gray-800 { color: #1f2937; }
            .text-green-600 { color: #059669; }
            .text-blue-600 { color: #2563eb; }
            .text-purple-600 { color: #7c3aed; }
            .flex { display: flex; }
            .items-center { align-items: center; }
            .justify-center { justify-content: center; }
            .justify-between { justify-content: space-between; }
            .space-y-2 > * + * { margin-top: 8px; }
            .space-y-3 > * + * { margin-top: 12px; }
            .space-y-4 > * + * { margin-top: 16px; }
            .space-y-6 > * + * { margin-top: 24px; }
            .grid { display: grid; }
            .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .gap-2 { gap: 8px; }
            .gap-3 { gap: 12px; }
            .gap-4 { gap: 16px; }
            .w-16 { width: 64px; }
            .h-16 { height: 64px; }
            .w-12 { width: 48px; }
            .h-12 { height: 48px; }
            .w-24 { width: 96px; }
            .h-1 { height: 4px; }
            .h-0.5 { height: 2px; }
            .bg-blue-600 { background-color: #2563eb; }
            .bg-green-600 { background-color: #059669; }
            .bg-purple-600 { background-color: #7c3aed; }
            .text-white { color: white; }
            .rounded-full { border-radius: 9999px; }
            .border-l-4 { border-left: 4px solid; }
            .border-yellow-400 { border-color: #facc15; }
            .text-xs { font-size: 12px; }
            .text-sm { font-size: 14px; }
            .text-base { font-size: 16px; }
            .font-semibold { font-weight: 600; }
            .font-bold { font-weight: 700; }
            .uppercase { text-transform: uppercase; }
            .capitalize { text-transform: capitalize; }
            .overflow-hidden { overflow: hidden; }
            .border-collapse { border-collapse: collapse; }
            .px-3 { padding-left: 12px; padding-right: 12px; }
            .py-2 { padding-top: 8px; padding-bottom: 8px; }
            .text-left { text-align: left; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .bg-gray-100 { background-color: #f3f4f6; }
            .bg-white { background-color: white; }
            .max-w-2xl { max-width: 672px; }
            .max-w-3xl { max-width: 768px; }
            .max-w-4xl { max-width: 896px; }
            .mx-auto { margin-left: auto; margin-right: auto; }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `)
    
    printWindow.document.close()
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }
  }

  if (!isClient) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled={true}
      >
        <Printer className="h-4 w-4 mr-2" />
        {children}
      </Button>
    )
  }

  return (
    <Button
      onClick={handlePrint}
      variant={variant}
      size={size}
      className={className}
      disabled={disabled}
    >
      <Printer className="h-4 w-4 mr-2" />
      {children}
    </Button>
  )
}
