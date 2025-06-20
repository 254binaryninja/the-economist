import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { generateBugReportEmail } from "@/constants/email/bugEmail";
import { generateCollaborationEmail } from "@/constants/email/collaborationEmail";
import { generateCollaborationRoleEmail } from "@/constants/email/collaborationRoleEmail";
import { generateIssueEmail } from "@/constants/email/issueEmail";
import { generateWelcomeEmail } from "@/constants/email/welcomeEmail";
import { BugReport, CollaborationInvite, CollaborationRoleChange, IssueNotification, WelcomeUser } from "@/types";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type } = body as { type: string };

        if (!type) {
            return NextResponse.json(
                { error: "Email type is required" },
                { status: 400 }
            );
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        let mailOptions;
        let emailContent;

        // Switch statement to handle different email types
        switch (type) {
            case "bug":
                const bugData = body as BugReport;
                const { userName, briefDescription, completeDescription } = bugData;

                if (!userName || !briefDescription || !completeDescription) {
                    return NextResponse.json(
                        { error: "Missing required fields for bug report" },
                        { status: 400 }
                    );
                }

                emailContent = generateBugReportEmail({
                    type,
                    userName,
                    briefDescription,
                    completeDescription,
                });

                mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: process.env.ADMIN_EMAIL,
                    subject: `Bug Report from ${userName}: ${briefDescription}`,
                    html: emailContent,
                };
                break;

            case "welcome":
                const welcomeData = body as WelcomeUser;
                const { userName: welcomeUserName, dashboardLink, userEmail: welcomeEmail } = welcomeData;

                if (!welcomeUserName || !dashboardLink || !welcomeEmail) {
                    return NextResponse.json(
                        { error: "Missing required fields for welcome email" },
                        { status: 400 }
                    );
                }

                emailContent = generateWelcomeEmail({
                    type,
                    userName: welcomeUserName,
                    dashboardLink,
                    userEmail: welcomeEmail,
                });

                mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: welcomeEmail,
                    subject: `Welcome to Campus Connect, ${welcomeUserName}!`,
                    html: emailContent,
                };
                break;

            case "collaboration":
                const collabData = body as CollaborationInvite;
                const { userName: collabUserName, inviterName, canvasName, canvasLink, userEmail: collabEmail } = collabData;

                if (!collabUserName || !inviterName || !canvasName || !canvasLink || !collabEmail) {
                    return NextResponse.json(
                        { error: "Missing required fields for collaboration invitation" },
                        { status: 400 }
                    );
                }

                emailContent = generateCollaborationEmail({
                    type,
                    userName: collabUserName,
                    inviterName,
                    canvasName,
                    canvasLink,
                    userEmail: collabEmail,
                });

                mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: collabEmail,
                    subject: `${inviterName} has invited you to collaborate on ${canvasName}`,
                    html: emailContent,
                };
                break;

            case "roleChange":
                const roleData = body as CollaborationRoleChange;
                const { userName: roleUserName, canvasName: roleCanvasName, newRole, changedBy, canvasLink: roleCanvasLink, userEmail: roleEmail } = roleData;

                if (!roleUserName || !roleCanvasName || !newRole || !changedBy || !roleCanvasLink || !roleEmail) {
                    return NextResponse.json(
                        { error: "Missing required fields for role change notification" },
                        { status: 400 }
                    );
                }

                emailContent = generateCollaborationRoleEmail({
                    type,
                    userName: roleUserName,
                    canvasName: roleCanvasName,
                    newRole,
                    changedBy,
                    canvasLink: roleCanvasLink,
                    userEmail: roleEmail,
                });

                mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: roleEmail,
                    subject: `Your role has been updated in ${roleCanvasName}`,
                    html: emailContent,
                };
                break;

            case "issue":
                const issueData = body as IssueNotification;
                const { userName: issueUserName, issueTitle, issueDescription, actionLink, actionText, userEmail: issueEmail } = issueData;

                if (!issueUserName || !issueTitle || !issueDescription || !issueEmail) {
                    return NextResponse.json(
                        { error: "Missing required fields for issue notification" },
                        { status: 400 }
                    );
                }

                emailContent = generateIssueEmail({
                    type,
                    userName: issueUserName,
                    issueTitle,
                    issueDescription,
                    actionLink,
                    actionText,
                    userEmail: issueEmail,
                });

                mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: issueEmail,
                    subject: `Important: ${issueTitle}`,
                    html: emailContent,
                };
                break;

            default:
                return NextResponse.json(
                    { error: "Invalid email type" },
                    { status: 400 }
                );
        }

        await transporter.sendMail(mailOptions);

        return NextResponse.json(
            { message: `${type} email sent successfully` },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error sending email:", error);
        return NextResponse.json(
            { error: "Failed to send email" },
            { status: 500 }
        );
    }
}
