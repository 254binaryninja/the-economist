'use client'

import { useUser } from "@clerk/nextjs"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "../ui/button"
import { DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"

export default function BugReport() {
    const [, setIsOpen] = useState(false)
    const { user } = useUser()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [bugReport, setBugReport] = useState({
        userName: user?.fullName || '',
        briefDescription: '',
        completeDescription: ''
    })

    const handleBugReport = async () => {
        try {
            setIsSubmitting(true)

            // Validate form
            if (!bugReport.userName || !bugReport.briefDescription || !bugReport.completeDescription) {
                toast.error('Please fill in all fields')
                return
            }

            const response = await fetch('/api/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bugReport),
            })

            if (!response.ok) {
                throw new Error('Failed to submit bug report')
            }

            toast.success('Bug report submitted successfully')
            setBugReport({ userName: '', briefDescription: '', completeDescription: '' })
            setIsOpen(false)
        } catch (error) {
            console.error('Error submitting bug report:', error)
            toast.error('Failed to submit bug report. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <DialogContent className="sm:max-w-[425px]">
            <div className="grid gap-4 py-4">
                <DialogHeader>
                    <DialogTitle>Report a Bug</DialogTitle>
                </DialogHeader>
                <div className="grid gap-2">
                    <Label htmlFor="briefDescription">Brief Description</Label>
                    <Input
                        id="briefDescription"
                        value={bugReport.briefDescription}
                        onChange={(e) => setBugReport({ ...bugReport, briefDescription: e.target.value })}
                        placeholder="Brief description of the bug"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="completeDescription">Complete Description</Label>
                    <Textarea
                        id="completeDescription"
                        value={bugReport.completeDescription}
                        onChange={(e) => setBugReport({ ...bugReport, completeDescription: e.target.value })}
                        placeholder="Detailed description of the bug"
                        rows={4}
                    />
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                </Button>
                <Button
                    onClick={handleBugReport}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </Button>
            </div>
        </DialogContent>
    )
}